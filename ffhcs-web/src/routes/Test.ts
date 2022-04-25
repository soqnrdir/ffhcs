import { Request, Response, Router } from 'express'
import { OK, BAD_REQUEST } from 'http-status-codes';
import Debug from "debug"
const debug = Debug("ffhcs:routes")
import logger from '@shared/Logger'
import {VMS} from '../Config'
import { getVMSGroupList, getVMSEventStatus } from '@VMS/VMSCameraData'
import { GISData, getLatestCoords } from '@VMS/GISClient'
import vmsChecker from '@VMS/index'

const router = Router()

if (process.env.NODE_ENV === 'development') {
  // debug 버전에만 test api 노출함
  router.get('/vmsgrouplist', async (req: Request, res: Response) => {
    try {
      const server = VMS.servers[0]
      const withStatusUpdate = req.query.update ? parseInt(req.query.update as string) != 0 : false
      const list = await getVMSGroupList(server.server as string, server.addr as string,
        server.id as string, server.password as string, withStatusUpdate)
      return res.status(OK).json({ records: list })
    } catch (err) {
      logger.error(`exception in 'vmsgrouplist' API: ${err.message}`)
      return res.status(BAD_REQUEST).json({ result: err.message })
    }
  })
  
  router.get('/lastestcoords', async (req: Request, res: Response) => {
    try {
      const coords : Array<GISData> = await getLatestCoords()
      return res.status(OK).json({ records: coords })
    } catch (err) {
      logger.error(`exception in 'lastestcoords' API: ${err.message}`)
      return res.status(BAD_REQUEST).json({ result: err.message })
    }
  })
  
  router.get('/vmseventstatus', async (req: Request, res: Response) => {
    try {
      const server = VMS.servers[0]
      const eventStatusList = await getVMSEventStatus(server.addr as string, server.id as string,
        server.password as string)
      return res.status(OK).json({ records: eventStatusList })
    } catch (err) {
      logger.error(`exception in 'vmseventstatus' API: ${err.message}`)
      return res.status(BAD_REQUEST).json({ result: err.message })
    }
  })
  
  router.get('/sendevents', async (req: Request, res: Response) => {
    let perm = req.query.perm || ''
    try {
      let records = vmsChecker.generatePlaylist(perm as string)
      if (req.query.index !== undefined) {
        let nindex = parseInt(req.query.index as string)
        records = records.filter((record, i) => i === nindex)
      }
      vmsChecker.sendEvents(records)
      return res.status(OK).json({ result: 'ok' })
    } catch (err) {
      logger.error(`exception in 'sendevents' API: ${err.message}`)
      return res.status(BAD_REQUEST).json({ result: err.message })
    }
  })
  
  router.get('/gpsevent', async (req: Request, res: Response) => {
    try {
      let fcno = req.query.fcno || ''
      let longitude = req.query.longitude || ''
      let latitude = req.query.latitude || ''
      debug(`gpsevent: fcno=${fcno} longitude=${longitude} latitude=${latitude}`)
      vmsChecker.handleGPSData(fcno as string, longitude as string, latitude as string, new Date())
      return res.status(OK).json({ result: 'ok' })
    } catch (err) {
      logger.error(`exception in 'gpsevent' API: ${err.message}`)
      return res.status(BAD_REQUEST).json({ result: err.message })
    }
  })
  
  /**
   * 권한에 일치하는 카메라 정보를 포함하는 카메라 그룹 목록을 반환한다.
   */
  router.get('/playlists', async (req: Request, res: Response) => {
    let perm = req.query.perm || ''
    let records = vmsChecker.generatePlaylist(perm as string)
    return res.status(OK).json({records: records})
  })
  
}
  
export default router
