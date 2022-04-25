import { Request, Response, Router } from 'express'
import { BAD_REQUEST, CREATED, OK } from 'http-status-codes'
import { ParamsDictionary } from 'express-serve-static-core'
import UserDao from '@daos/UserDao'
import { paramMissingError } from '@shared/constants'
import { MakeCRUDRoutes } from './RouteUtil'
import Debug from "debug"
const debug = Debug("ffhcs:routes")

const router = Router()
const userDao = new UserDao()

// "GET /v1/users/all"

MakeCRUDRoutes('users', router, userDao)

export default router
