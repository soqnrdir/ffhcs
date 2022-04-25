import { Request, Response, Router } from 'express'
import { BAD_REQUEST, CREATED, OK } from 'http-status-codes'
import { ParamsDictionary } from 'express-serve-static-core'
import { ICRUDDao } from '@daos/CRUDDao'
import { authenticate, RequestWithAuth } from '../Middleware'
import { paramMissingError } from '@shared/constants'
import Debug from "debug"
const debug = Debug("ffhcs:routes")

export function MakeCRUDRoutes(tableName: string, router: Router, dao: ICRUDDao) {

  // "GET /v1/users/all"
  router.get('/all', authenticate, async (req: RequestWithAuth, res: Response) => {
    try {
      const records = await dao.getAll()
      return res.status(OK).json({ records: records })
    } catch (ex) {
      debug(`[${tableName}] exception: ${ex}`)
      return res.status(BAD_REQUEST).json({ result: ex.message })
    }
  })

  router.get('/get/:id', authenticate, async (req: RequestWithAuth, res: Response) => {
    const { id } = req.params as ParamsDictionary
    const record = await dao.getOne(id)
    if (record) {
      return res.status(OK).json(record)
    } else {
      debug(`[${tableName}] record not found: id=${id}`)
      return res.status(OK).json('')
    }
  })

  router.post('/add', authenticate, async (req: RequestWithAuth, res: Response) => {
    const record = req.body
    if (!record) {
      debug('[${tableName}] request with empty body')
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
      debug('[${tableName}] request with empty body')
      return res.status(BAD_REQUEST).json({
          error: paramMissingError,
      })
    }
    try {
      const result = await dao.update(record)
      return res.status(OK).json({ result: result })
    } catch (ex) {
      debug(`[${tableName}] exception: ${ex}`)
      return res.status(BAD_REQUEST).json({ result: ex.message })
    }
  })

  router.delete('/delete/:id', authenticate, async (req: RequestWithAuth, res: Response) => {
    const { id } = req.params as ParamsDictionary
    try {
      const result = await dao.delete(id)
      return res.status(OK).json({ result: result })
    } catch (ex) {
      debug(`[${tableName}] exception: ${ex}`)
      return res.status(BAD_REQUEST).json({ result: ex.message })
    }
  })

}
