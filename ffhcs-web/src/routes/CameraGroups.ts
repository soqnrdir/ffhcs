import { Request, Response, Router } from 'express'
import { BAD_REQUEST, CREATED, OK } from 'http-status-codes'
import { ParamsDictionary } from 'express-serve-static-core'
import { authenticate, RequestWithAuth } from '../Middleware'
import CameraGroupDao from '@daos/CameraGroupDao'
import { paramMissingError } from '@shared/constants'
import Debug from 'debug'
const debug = Debug("ffhcs:cameraGroups")
import logger from '@shared/Logger'
import vmsChecker from '@VMS/index'

const router = Router()
const dao = new CameraGroupDao()

router.get('/all', authenticate, async (req: RequestWithAuth, res: Response) => {
  try {
    const records = await dao.getAll()
    return res.status(OK).json({ records: records })
  } catch (ex) {
    debug(`[cameraGroups] exception: ${ex}`)
    return res.status(BAD_REQUEST).json({ result: ex.message })
  }
})

router.get('/get/:id', authenticate, async (req: RequestWithAuth, res: Response) => {
  const { id } = req.params as ParamsDictionary
  const record = await dao.getOne(id)
  if (record) {
    return res.status(OK).json(record)
  } else {
    debug(`[cameraGroups] record not found: id=${id}`)
    return res.status(OK).json('')
  }
})

router.post('/add', authenticate, async (req: RequestWithAuth, res: Response) => {
  const record = req.body
  if (!record) {
    debug('[cameraGroups] request with empty body')
    return res.status(BAD_REQUEST).json({
      error: paramMissingError,
    })
  }
  try {
    const result = await dao.add(record)
    return res.status(CREATED).json({ result: result })
  } catch (ex) {
    debug(`exception: ${ex}`)
    return res.status(BAD_REQUEST).json({ result: ex.message })
  }
})

router.put('/update', authenticate, async (req: RequestWithAuth, res: Response) => {
  const record = req.body
  if (!record) {
    debug('[cameraGroups] request with empty body')
    return res.status(BAD_REQUEST).json({
        error: paramMissingError,
    })
  }
  try {
    const result = await dao.update(record)
    vmsChecker.applyCameraGroupChange(record)
    return res.status(OK).json({ result: result })
  } catch (ex) {
    debug(`[cameraGroups] exception: ${ex}`)
    return res.status(BAD_REQUEST).json({ result: ex.message })
  }
})

router.delete('/delete/:id', authenticate, async (req: RequestWithAuth, res: Response) => {
  const { id } = req.params as ParamsDictionary
  try {
    const result = await dao.delete(id)
    return res.status(OK).json({ result: result })
  } catch (ex) {
    debug(`[cameraGroups] exception: ${ex}`)
    return res.status(BAD_REQUEST).json({ result: ex.message })
  }
})

export default router
