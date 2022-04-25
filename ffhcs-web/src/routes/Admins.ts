import { Request, Response, Router } from 'express'
import { BAD_REQUEST, CREATED, OK } from 'http-status-codes'
import { ParamsDictionary } from 'express-serve-static-core'
import AdminDao from '@daos/AdminDao'
import { MakeCRUDRoutes } from './RouteUtil'
import Debug from "debug"
const debug = Debug("ffhcs:routes")

// Init shared
const router = Router()
const adminDao = new AdminDao()

MakeCRUDRoutes('admins', router, adminDao)

export default router
