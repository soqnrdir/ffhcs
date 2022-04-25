import Debug from "debug"
const debug = Debug("ffhcs:vms")
import { CameraGroupData, readCameraDataFromDb, addToDB } from './CameraData'
import { VMSCameraGroup, getVMSGroupList, updateCameraStatus } from './VMSCameraData'
import {VMS, API} from '../Config'
import logger from '@shared/Logger'
import { Request, Response } from 'express'
import { lookupAddr } from './GPSAddr'
import { GISData, getLatestCoords } from '@VMS/GISClient'
import CameraGroup from '@entities/CameraGroup'
import UserDao from '@daos/UserDao'

const userDao = new UserDao()

export class EventListener {
  public userKey : string
  public clientId : string
  public response : Response

  constructor(userKey: string, clientId: string, response : Response) {
    this.userKey = userKey
    this.clientId = clientId
    this.response = response
  }
}

export class VMSChecker {
  public groupDataList : Array<CameraGroupData>
  public vmsGroupList : Array<VMSCameraGroup>
  public listLoaded : boolean
  private vmsTimerId : NodeJS.Timeout | null  // VMS 서버 check를 위한 Timer ID
  private gisTimerId : NodeJS.Timeout | null  // GIS 서버 check를 위한 Timer ID
  private listeners : Array<EventListener>

  constructor() {
    this.groupDataList = []
    this.vmsGroupList = []
    this.listLoaded = false
    this.vmsTimerId = null
    this.gisTimerId = null
    this.listeners = []
  }

  addListener(userKey: string, clientId: string, req: Request, response : Response) {
    let client = new EventListener(userKey, clientId, response)
    this.listeners.push(client)
    logger.info(`event client added from ${req.headers['x-forwarded-for']}: ${clientId} clients=${this.listeners.length}`);
    req.on('close', () => {
      logger.info(`event client disconnected: ${clientId}`);
      this.listeners = this.listeners.filter(client => client.clientId !== clientId)
    });
  }

  sendEvents(playlists: Array<Object>) {
    debug(`send events: clients=${this.listeners.length} records=${playlists.length}`);
    let text = JSON.stringify(playlists)
    this.listeners.forEach(client => client.response.write(`data: ${text}\n\n`))
  }

  async sendPlaylists(client: EventListener, groupDataList: Array<CameraGroupData>) {
    debug(`sendPlaylists: clientId=${client.clientId}`);
    let user = await userDao.getOne(client.userKey)
    if (!user) {
      return
    }
    var perm = this.parsePermStr(user.level)
    let playlists : Array<Object> = []
    for (let groupData of groupDataList) {
      playlists.push(this.generatePlaydata(groupData, perm))
    }
    let text = JSON.stringify(playlists)
    this.listeners.forEach(client => client.response.write(`data: ${text}\n\n`))
  }

  // DB의 카메라 목록과 VMS 서버로부터 받은 목록을 비교해서
  // 없는 경우 DB에 카메라 정보를 추가한다.
  async syncToDB() : Promise<boolean> {
    let added = false
    for (let groupData of this.groupDataList) {
      var index = this.vmsGroupList.findIndex(vmsGroup =>
        vmsGroup.vmsServer === groupData.cameraGroup.vmsServer &&
        vmsGroup.vmsGroupKey === groupData.cameraGroup.vmsGroupKey)
      if (index < 0) {
        debug(`removedFromVMS vmsGroup=${groupData.cameraGroup.vmsGroupName}`)
        await groupData.removedFromVMS()
      } else {
        debug(`updateDB [${index}] vmsGroup=${groupData.cameraGroup.vmsGroupName}`)
        if (await groupData.updateDB(this.vmsGroupList[index]))
          added = true
      }
    }

    for (let vmsGroup of this.vmsGroupList) {
      var index = this.groupDataList.findIndex(groupData =>
        vmsGroup.vmsServer === groupData.cameraGroup.vmsServer &&
        vmsGroup.vmsGroupKey === groupData.cameraGroup.vmsGroupKey)
      if (index < 0) {
        //debug(`addToDB vmsGroup=${vmsGroup.vmsGroupName}`)
        await addToDB(vmsGroup)
        added = true
      }
    }
    return added
  }

  async setVMSCamera() {
    for (let groupData of this.groupDataList) {
      var index = this.vmsGroupList.findIndex(vmsGroup =>
        vmsGroup.vmsServer === groupData.cameraGroup.vmsServer &&
        vmsGroup.vmsGroupKey === groupData.cameraGroup.vmsGroupKey)
      if (index != -1) {
        groupData.setVMSCamera(this.vmsGroupList[index])
      }
    }
  }

  async loadInitialData() {
    try {
      this.groupDataList = await readCameraDataFromDb()
      const server = VMS.servers[0]
      const withStatusUpdate = true
      this.vmsGroupList = await getVMSGroupList(server.server as string, server.addr as string,
        server.id as string, server.password as string, withStatusUpdate)
      this.listLoaded = true
      if (await this.syncToDB()) {
        this.groupDataList = await readCameraDataFromDb()
      }
      this.setVMSCamera()
    } catch (err) {
      debug(err)
      logger.error(`<VMSChecker> can't get initial data: ${err.message}`)
    }
  }

  async syncCameraStatus() {
    try {
      const server = VMS.servers[0]
      await updateCameraStatus(server.addr as string, server.id as string,
        server.password as string, this.vmsGroupList)
  } catch (err) {
      debug(err)
      logger.error(`<VMSChecker> error while updating camera status: ${err.message}`)
    }
  }

  async onCheckVMS() {
    debug(`onCheckVMS-------------------------------`)
    if (!this.listLoaded) {
      await this.loadInitialData()
    }
    try {
      await this.syncCameraStatus()
      if (await this.syncToDB()) {
        this.groupDataList = await readCameraDataFromDb()
      }
    } catch (err) {
      debug(err)
      logger.error(`<VMSChecker> error onCheckVMS: ${err.message}`)
      // DB 불일치로 오류가 발생한 경우가 있을수 있음으로 다시 읽음
      this.groupDataList = await readCameraDataFromDb()
    }
  }

  // GIS 서버로 부터 헬기 좌표를 얻어와서 GPS 좌료에 대응하는 주소를 갱신하고
  // 좁속 클라이언트들에서 변경된 정보를 전달한다.
  async onCheckGIS() {
    debug(`onCheckGIS-------------------------------`)
    try {
      const coords : Array<GISData> = await getLatestCoords()
      let groupDataList : Array<CameraGroupData> = []
      for (let coord of coords) {
        let groupData = await this.updateGPSData(coord.fcno, coord.longitude, coord.latitude, coord.send_date)
        if (groupData) {
          groupDataList.push(groupData)
        }
      }
      if (groupDataList.length > 0) {
        debug(`<onCheckGIS> ${groupDataList.length} item updated`)
        this.listeners.forEach(client => this.sendPlaylists(client, groupDataList))
      }
    } catch (err) {
      debug(err)
      logger.error(`<VMSChecker> error while onCheckGIS: ${err.message}`)
    }
  }

  startChecker() {
    this.startVMSCheckTimer()
    this.startGISCheckTimer()
  }

  stopChecker() {
    this.stopVMSCheckTimer()
    this.stopGISCheckTimer()
  }

  private startVMSCheckTimer() {
    if (this.vmsTimerId == null) {
      let intervalMS = VMS.updateInterval * 1000
      debug(`startVMSCheckTimer with interval=${intervalMS}`)
      this.vmsTimerId = setInterval(() => this.onCheckVMS(), intervalMS)
    }
  }

  private stopVMSCheckTimer() {
    if (this.vmsTimerId != null) {
      clearInterval(this.vmsTimerId)
      this.vmsTimerId = null
    }
  }

  private startGISCheckTimer() {
    if (this.gisTimerId == null) {
      let intervalMS = API.GISUpdateInterval * 1000
      debug(`startGISCheckTimer with interval=${intervalMS}`)
      this.gisTimerId = setInterval(() => this.onCheckGIS(), intervalMS)
    }
  }

  private stopGISCheckTimer() {
    if (this.gisTimerId != null) {
      clearInterval(this.gisTimerId)
      this.gisTimerId = null
    }
  }

  generatePlaydata(groupData: CameraGroupData, perm: Array<boolean>) : Object {
    const server = VMS.servers[0]
    return groupData.generatePlaydataWithPerm(server.id as string, server.password as string, perm)
  }

  /**
   * 권한 문자열을 boolean로 배열로 변환
   * @param perm 권한 스트림: 예) "0,1,2,3"
   * @returns boolean 배열 값 
   */
  parsePermStr(perm: string) : Array<boolean> {
    let permList = [false, false, false, false]
    for (let i of perm.split(',').map(x => parseInt(x)).filter(x => !isNaN(x))) {
      i -= 1
      if (i >= 0 && i < permList.length)
        permList[i] = true
    }
    return permList
  }

  generatePlaylist(perm: string) : Array<Object> {
    var result : Array<Object> = []
    var permArray = this.parsePermStr(perm)
    for (let groupData of this.groupDataList) {
      if (!groupData.cameraGroup.disabled) {
        result.push(this.generatePlaydata(groupData, permArray))
      }
    }
    return result
  }

  async updateGPSAddrText(groupData: CameraGroupData, longitude: string, latitude: string, gpsDate: Date) : Promise<boolean> {
    try {
      groupData.gpsAddr = await lookupAddr(longitude, latitude)
      groupData.gpsDate = gpsDate
      return true
    } catch (err) {
      debug(err)
      logger.error(`<VMSChecker> error while updateGPSAddrText(): ${err.message}`)
      return false
    }
  }

  // GPS 좌표와 주소를 변경한다.
  async updateGPSData(fcno: string, longitude: string, latitude: string, gpsDate: Date) : Promise<CameraGroupData | null> {
    let matchedGroup = this.groupDataList.filter(data => data.cameraGroup.fcno == fcno)
    if (matchedGroup.length == 0) {
      debug(`updateGPSData: fcno=${fcno} not found`)
      return null
    } else {
      if (matchedGroup[0].gpsAddr.isSameCoord(longitude, latitude) && matchedGroup[0].gpsAddr.hasAddress())
        return null // TEXT 주소 변환이 필요가 없는 경우
      if (await this.updateGPSAddrText(matchedGroup[0], longitude, latitude, gpsDate))
        return matchedGroup[0]
      return null
    }
  }

  // GPS 좌표와 주소 정보를 지운다.
  async clearGPSData(fcno: string) : Promise<CameraGroupData | null> {
    let matchedGroup = this.groupDataList.filter(data => data.cameraGroup.fcno == fcno)
    if (matchedGroup.length == 0) {
      debug(`clearGPSData: fcno=${fcno} not found`)
      return null
    } else {
      matchedGroup[0].clearGPSAddr()
      return matchedGroup[0]
    }
  }

  async handleGPSData(fcno: string, longitude: string, latitude: string, gpsDate: Date) : Promise<void> {
    let updatedGroup = await this.updateGPSData(fcno, longitude, latitude, gpsDate)
    if (updatedGroup) {
      let groupDataList = [updatedGroup]
      debug(`handleGPSData: fcno=${fcno} updated: addr=${updatedGroup.gpsAddr}`)
      this.listeners.forEach(client => this.sendPlaylists(client, groupDataList))
    }
  }

  async applyCameraGroupChange(cameraGroup: CameraGroup) : Promise<void> {
    let matchedGroup = this.groupDataList.filter(data => data.cameraGroup.id == cameraGroup.id)
    if (matchedGroup.length == 0) {
      debug(`applyCameraGroupChange: cameraGroup=${cameraGroup.id} not found`)
    } else {
      matchedGroup[0].cameraGroup.disabled = cameraGroup.disabled
      matchedGroup[0].cameraGroup.fcno = cameraGroup.fcno
    }
  }

}

var vmsChecker = new VMSChecker()

export default vmsChecker
