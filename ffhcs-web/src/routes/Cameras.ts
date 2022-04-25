import { Request, Response, Router } from 'express'
import { BAD_REQUEST, CREATED, OK } from 'http-status-codes'
import { ParamsDictionary } from 'express-serve-static-core'
import { RequestWithAuth } from '../Middleware'
import { MakeCRUDRoutes } from './RouteUtil'

import CameraDao from '@daos/CameraDao'
import { paramMissingError } from '@shared/constants'
import Debug from 'debug'
const debug = Debug("ffhcs:cameras")
import logger from '@shared/Logger'

const router = Router()
const cameraDao = new CameraDao()

MakeCRUDRoutes('cameras', router, cameraDao)

export default router
