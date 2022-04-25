import Camera from '@entities/Camera'
import CameraGroup from '@entities/CameraGroup'
import CameraGroupDao from '@daos/CameraGroupDao'
import CameraDao from '@daos/CameraDao'
import { VMSCamera } from './VMSCameraData'
import { VMSCameraGroup } from './VMSCameraData'
import { GPSAddr } from './GPSAddr'
import Debug from "debug"
const debug = Debug("ffhcs:index")
import logger from '@shared/Logger'
import short from 'short-uuid'

export class CameraData {
  public camera: Camera
  public vmsCamera: VMSCamera | null

  constructor(camera: Camera) {
    this.camera = camera
    this.vmsCamera = null
  }
}

const cameraGroupDao = new CameraGroupDao()
const cameraDao = new CameraDao()

export class CameraGroupData {
  public cameraGroup: CameraGroup
  public cameraDataList: Array<CameraData>
  public gpsAddr: GPSAddr
  public gpsDate: Date | null // GPS 센서 정보 수신 시간

  constructor(cameraGroup: CameraGroup) {
    this.cameraGroup = cameraGroup
    this.cameraDataList = []
    this.gpsAddr = new GPSAddr('', '')
    this.gpsDate = null
  }

  clearGPSAddr() {
    this.gpsAddr = new GPSAddr('', '')
    this.gpsDate = null
  }

  async updateDB(vmsCameraGroup: VMSCameraGroup) : Promise<boolean> {
    let chaned = this.cameraGroup.vmsServer != vmsCameraGroup.vmsServer ||
      this.cameraGroup.vmsGroupName !== vmsCameraGroup.vmsGroupName ||
      this.cameraGroup.removedAt !== null

    let newStatus = vmsCameraGroup.getStatus()
    if (this.cameraGroup.status != newStatus) {
      logger.info(`Camera status changed: name=${this.cameraGroup.vmsGroupName} ${this.cameraGroup.status} -> ${newStatus}`)
      if (newStatus == 1) {
        this.cameraGroup.onlineAt = new Date()
        this.cameraGroup.offlineAt = null
      } else {
        this.cameraGroup.offlineAt = new Date()
      }
      this.cameraGroup.status = newStatus
      chaned = true
    }

    if (chaned) {
      this.cameraGroup.vmsServer = vmsCameraGroup.vmsServer
      this.cameraGroup.vmsGroupName = vmsCameraGroup.vmsGroupName
      this.cameraGroup.removedAt = null
      await cameraGroupDao.update(this.cameraGroup)
    }
    let added = false
    for (let vmsCamera of vmsCameraGroup.cameras) {
      var index = this.cameraDataList.findIndex(cameraData => cameraData.camera.vmsKey === vmsCamera.vmsKey)
      if (index == -1) {
        let camera = new Camera(null)
        camera.chType = vmsCamera.chType
        camera.vmsKey = vmsCamera.vmsKey
        camera.vmsEnable = vmsCamera.vmsEnable
        camera.vmsName = vmsCamera.vmsName
        camera.vmsUrl1 = vmsCamera.vmsUrl1
        camera.vmsUrl2 = vmsCamera.vmsUrl2
        camera.cameraGroupId = this.cameraGroup.id
        await cameraDao.add(camera)
        debug(`cameraDao.add: [${this.cameraDataList.length}]${camera.vmsName} key=${camera.vmsKey}`)
        this.cameraDataList.push(new CameraData(camera))
        added = true
      } else {
        let cameraData = this.cameraDataList[index]
        if (cameraData.camera.chType !== vmsCamera.chType ||
          cameraData.camera.vmsEnable != vmsCamera.vmsEnable || // DB에서 읽은 값이 boolean 값이 아니고 숫자임으로 !== 사용하면 안됨
          cameraData.camera.vmsName !== vmsCamera.vmsName ||
          cameraData.camera.vmsUrl1 !== vmsCamera.vmsUrl1 ||
          cameraData.camera.vmsUrl2 !== vmsCamera.vmsUrl2) {
            cameraData.camera.chType = vmsCamera.chType
            cameraData.camera.vmsEnable = vmsCamera.vmsEnable
            cameraData.camera.vmsName = vmsCamera.vmsName
            cameraData.camera.vmsUrl1 = vmsCamera.vmsUrl1
            cameraData.camera.vmsUrl2 = vmsCamera.vmsUrl2
            debug(`cameraDao.update: [${index}]${cameraData.camera.vmsName} key=${cameraData.camera.vmsKey}`)
            await cameraDao.update(cameraData.camera)
          }
      }
    }
    return added
  }

  setVMSCamera(vmsCameraGroup: VMSCameraGroup) {
    for (let vmsCamera of vmsCameraGroup.cameras) {
      var index = this.cameraDataList.findIndex(cameraData => cameraData.camera.vmsKey === vmsCamera.vmsKey)
      if (index != -1) {
        this.cameraDataList[index].vmsCamera = vmsCamera
      }
    }
  }

  // VMS 서버 목록에서 제거된 경우 삭제된 날짜만 업데이트 시킴
  async removedFromVMS() {
    if (this.cameraGroup.removedAt != null)
      return
    this.cameraGroup.removedAt = new Date()
    debug(`removedFromVMS: ${this.cameraGroup.vmsGroupName}`)
    await cameraGroupDao.update(this.cameraGroup)
  }

  generatePlaydata(vmsId: string, vmsPassword: string) : Object {
    let groupData = {
      id: this.cameraGroup.id,
      vmsGroupName: this.cameraGroup.vmsGroupName,
      category: this.cameraGroup.category,
      status: this.cameraGroup.status,
      onlineAt: this.cameraGroup.onlineAt,
      offlineAt: this.cameraGroup.offlineAt,
      fcno: this.cameraGroup.fcno,
      longitude: this.gpsAddr.longitude,
      latitude: this.gpsAddr.latitude,
      addresses: this.gpsAddr.addresses,
      gpsDate: this.gpsDate
    }
    var cameras : Array<Object> = []
    for (let cameraData of this.cameraDataList) {
      let camera = {
        id: cameraData.camera.id,
        chType: cameraData.camera.chType,
        vmsEnable: cameraData.camera.vmsEnable,
        vmsName: cameraData.camera.vmsName,
        vmsUrl1: cameraData.camera.vmsUrl1,
        vmsUrl2: cameraData.camera.vmsUrl2,
        vmsOnline1: cameraData.vmsCamera ? cameraData.vmsCamera.vmsOnline1 : false,
        vmsOnline2: cameraData.vmsCamera ? cameraData.vmsCamera.vmsOnline2 : false,
        vmsId: vmsId,
        vmsPassword: vmsPassword
      }
      cameras.push(camera)
    }
    groupData['cameras'] = cameras
    return groupData
  }

  generatePlaydataWithPerm(vmsId: string, vmsPassword: string, perm: Array<boolean>) : Object {
    let groupData = {
      id: this.cameraGroup.id,
      vmsGroupName: this.cameraGroup.vmsGroupName,
      category: this.cameraGroup.category,
      status: this.cameraGroup.status,
      onlineAt: this.cameraGroup.onlineAt,
      offlineAt: this.cameraGroup.offlineAt,
      fcno: this.cameraGroup.fcno,
      longitude: this.gpsAddr.longitude,
      latitude: this.gpsAddr.latitude,
      addresses: this.gpsAddr.addresses,
      gpsDate: this.gpsDate
    }
    var cameras : Array<Object> = []
    for (let cameraData of this.cameraDataList) {
      let chIndex = cameraData.camera.chType - 1
      if (chIndex >= 0 && chIndex < perm.length && !perm[chIndex]) {
        // 해당 채널에 대한 권한이 없는경우 채널 정보를 채우지 않음
      } else {
        let camera = {
          id: cameraData.camera.id,
          chType: cameraData.camera.chType,
          vmsEnable: cameraData.camera.vmsEnable,
          vmsName: cameraData.camera.vmsName,
          vmsUrl1: cameraData.camera.vmsUrl1,
          vmsUrl2: cameraData.camera.vmsUrl2,
          vmsOnline1: cameraData.vmsCamera ? cameraData.vmsCamera.vmsOnline1 : false,
          vmsOnline2: cameraData.vmsCamera ? cameraData.vmsCamera.vmsOnline2 : false,
          vmsId: vmsId,
          vmsPassword: vmsPassword
        }
        cameras.push(camera)
      }
    }
    groupData['cameras'] = cameras
    return groupData
  }
  
}

export async function readCameraDataFromDb() : Promise<Array<CameraGroupData>> {
  let groupDataList : Array<CameraGroupData> = []
  let cameraGroupList = await cameraGroupDao.getAll()
  for (let cameraGroup of cameraGroupList) {
    let groupData = new CameraGroupData(cameraGroup)
    let whereRaw = `cameraGroupId='${cameraGroup.id}' ORDER BY chType`
    let cameras = await cameraDao.find(whereRaw)
    for (let camera of cameras || []) {
      groupData.cameraDataList.push(new CameraData(camera))
    }
    debug(`readCameraDataFromDb: [${groupDataList.length}]${cameraGroup.vmsGroupName} numCameras=${groupData.cameraDataList.length}`)
    groupDataList.push(groupData)
  }
  return groupDataList
}

export async function addToDB(vmsCameraGroup: VMSCameraGroup) {
  let cameraGroup = new CameraGroup(null)
  cameraGroup.id = short.generate()
  cameraGroup.vmsServer = vmsCameraGroup.vmsServer
  cameraGroup.vmsGroupKey = vmsCameraGroup.vmsGroupKey
  cameraGroup.vmsGroupName = vmsCameraGroup.vmsGroupName
  await cameraGroupDao.add(cameraGroup)
  for (let vmsCamera of vmsCameraGroup.cameras) {
    let camera = new Camera(null)
    camera.chType = vmsCamera.chType
    camera.vmsKey = vmsCamera.vmsKey
    camera.vmsEnable = vmsCamera.vmsEnable
    camera.vmsName = vmsCamera.vmsName
    camera.vmsUrl1 = vmsCamera.vmsUrl1
    camera.vmsUrl2 = vmsCamera.vmsUrl2
    camera.cameraGroupId = cameraGroup.id
    await cameraDao.add(camera)
  }
  debug(`addToDB: ${cameraGroup.vmsGroupName} numCameras=${vmsCameraGroup.cameras.length}`)
}
