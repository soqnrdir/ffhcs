import { Request, Response, Router } from 'express'
import { BAD_REQUEST, UNAUTHORIZED, OK } from 'http-status-codes'
import vmsChecker from '@VMS/index'
import { authenticate, RequestWithAuth } from '../Middleware'
import Debug from 'debug'
const debug = Debug("ffhcs:cameras")
import logger from '@shared/Logger'

const router = Router()
var clientSeq = 0

router.get('/all', authenticate, async (req: RequestWithAuth, res: Response) => {
  if (!req.tokenData) {
    logger.error(`unauthorized API call from ${req.headers['x-forwarded-for']}: '/playlists/all'`)
    return res.status(UNAUTHORIZED).json({ result: 'unauthorized access' })
  }
  let user = req.tokenData ? req.tokenData.user : null
  if (req.tokenData.admin) {
    let records = vmsChecker.generatePlaylist('1,2,3,4')
    return res.status(OK).json({records: records})
  } else {
    let records = vmsChecker.generatePlaylist(req.tokenData.user.level)
    return res.status(OK).json({records: records})
  }
})

router.get('/events', authenticate, async (req: RequestWithAuth, res: Response) => {
  if (!req.tokenData) {
    logger.error(`unauthorized API call from ${req.headers['x-forwarded-for']}: '/playlists/events'`)
    return res.status(UNAUTHORIZED).json({ result: 'unauthorized access' })
  }
  const headers = {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache'
  }
  res.writeHead(OK, headers)
  let user = req.tokenData.user
  if (!req.query.change_only || req.query.change_only == '0') {
    let records = vmsChecker.generatePlaylist(user.level)
    res.write(`data: ${JSON.stringify(records)}\n\n`)
  }

  let clientId = `${user.userId}-${++clientSeq}`
  vmsChecker.addListener(user.id, clientId, req, res)
})

export default router
