import { Request, Response, Router } from 'express'
import { BAD_REQUEST, CREATED, OK } from 'http-status-codes'
import { ParamsDictionary } from 'express-serve-static-core'
import { authenticate, RequestWithAuth } from '../Middleware'
import { paramMissingError } from '@shared/constants'
import Playlog from '@entities/Playlog'
import Util from '@daos/Util'

import PlaylogDao from '@daos/PlaylogDao'
import Debug from 'debug'
const debug = Debug("ffhcs:playlogs")
import logger from '@shared/Logger'

const router = Router()
const playlogDao = new PlaylogDao()

router.get('/all', authenticate, async (req: RequestWithAuth, res: Response) => {
  try {
    const records = await playlogDao.getAll()
    return res.status(OK).json({ records: records })
  } catch (ex) {
    debug(`[playlogs] exception: ${ex}`)
    return res.status(BAD_REQUEST).json({ result: ex.message })
  }
})

router.get('/query', authenticate, async (req: RequestWithAuth, res: Response) => {
  const { dateFrom, dateTo, limit } = req.query
  try {
    var from = Util.parseStartOfDate(dateFrom as string)
    var to = Util.parseEndOfDate(dateTo as string)
    var limitNum : number = limit ? parseInt(limit as string) : 500
    let query = 'SELECT playlogs.statusCode, playlogs.startAt, playlogs.stopAt, users.name as userName, users.userId as userId, users.division, cameras.vmsName'
      + ' FROM playlogs, users, cameras WHERE playlogs.cameraId = cameras.id AND playlogs.userId = users.id'
      + ` AND playlogs.startAt BETWEEN ${from} AND ${to} ORDER BY playlogs.startAt DESC LIMIT ${limitNum}`
    debug(`[playlogs] query: ${query}`)
    const records = await playlogDao.rawQuery(query)
    debug(`[playlogs] records: ${records}`)
    return res.status(OK).json({ records: records })
  } catch (ex) {
    debug(`[playlogs] exception: ${ex}`)
    return res.status(BAD_REQUEST).json({ result: ex.message })
  }
})

router.get('/totalCntQuery', authenticate, async (req: RequestWithAuth, res: Response) => {
  const { dateFrom, dateTo } = req.query
  try {
    var from = Util.parseStartOfDate(dateFrom as string)
    var to = Util.parseEndOfDate(dateTo as string)
    let query = 'select substr(datetime(startAt/1000, "unixepoch", "localtime"),0,11) as  startAt, count(*) as totalCnt from playlogs'
      + ` WHERE startAt BETWEEN ${from} AND ${to}`
      + ` group by substr(datetime(startAt/1000, 'unixepoch', 'localtime'),0,11) ORDER BY startAt`
    debug(`[playlogs] query: ${query}`)
    const records = await playlogDao.rawQuery(query)
    debug(`[playlogs] records: ${records}`)
    return res.status(OK).json({ records: records })
  } catch (ex) {
    debug(`[playlogs] exception: ${ex}`)
    return res.status(BAD_REQUEST).json({ result: ex.message })
  }
})

router.get('/succesCntQuery', authenticate, async (req: RequestWithAuth, res: Response) => {
  const { dateFrom, dateTo } = req.query
  try {
    var from = Util.parseStartOfDate(dateFrom as string)
    var to = Util.parseEndOfDate(dateTo as string)
    let query = 'select substr(datetime(startAt/1000, "unixepoch", "localtime"),0,11) as  startAt, count(*) as succesCnt from playlogs where stopAt NOTNULL'
      + ` AND startAt BETWEEN ${from} AND ${to}`
      + ` group by substr(datetime(startAt/1000, 'unixepoch', 'localtime'),0,11) ORDER BY startAt`
    debug(`[playlogs] query: ${query}`)
    const records = await playlogDao.rawQuery(query)
    debug(`[playlogs] records: ${records}`)
    return res.status(OK).json({ records: records })
  } catch (ex) {
    debug(`[playlogs] exception: ${ex}`)
    return res.status(BAD_REQUEST).json({ result: ex.message })
  }
})

router.get('/get/:id', authenticate, async (req: RequestWithAuth, res: Response) => {
  const { id } = req.params as ParamsDictionary
  const record = await playlogDao.getOne(id)
  if (record) {
    return res.status(OK).json(record)
  } else {
    debug(`[playlogs] record not found: id=${id}`)
    return res.status(OK).json('')
  }
})

router.post('/play-start', authenticate, async (req: RequestWithAuth, res: Response) => {
  const {cameraId, statusCode} = req.body
  let user = req.tokenData ? req.tokenData.user : null
  if (!user) {
    debug('[playlogs] no user data')
    return res.status(BAD_REQUEST).json({
      error: paramMissingError,
    })
  }
  try {
    let record = new Playlog(null)
    record.userId = user.id
    record.cameraId = cameraId
    record.statusCode = statusCode
    await playlogDao.add(record)
    return res.status(CREATED).json({ result: { id: record.id } })
  } catch (ex) {
    debug(`exception: ${ex}`)
    return res.status(BAD_REQUEST).json({ result: ex.message })
  }
})

router.put('/play-update', authenticate, async (req: RequestWithAuth, res: Response) => {
  const { playlogId } = req.body
  if (!playlogId) {
    debug('[playlogs] request with empty body')
    return res.status(BAD_REQUEST).json({
        error: paramMissingError,
    })
  }
  try {
    const record = await playlogDao.getOne(playlogId)
    if (!record) {
      debug(`[playlogs] record not found: id=${playlogId}`)
      return res.status(OK).json('')
    }
    record.stopAt = new Date()
    const result = await playlogDao.update(record)
    return res.status(OK).json({ result: result })
  } catch (ex) {
    debug(`[playlogs] exception: ${ex}`)
    return res.status(BAD_REQUEST).json({ result: ex.message })
  }
})

export default router
