import {Request, Response, NextFunction} from 'express'
import Debug from "debug"
const debug = Debug("ffhcs:auth")
import jwt from 'jsonwebtoken'
import {API} from './Config'
import { BAD_REQUEST, UNAUTHORIZED, OK } from 'http-status-codes'

// tslint:disable-next-line no-any
export type PromiseMiddleware = (req: Request, res: Response) => Promise<any>

export const promise = (middleware: PromiseMiddleware) => (
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await middleware(req, res)

      if (result) {
        res.json(result)
      } else {
        next()
      }
    } catch (err) {
      next(err)
    }
  }
)

export interface RequestWithAuth extends Request {
  tokenData ?: any
}

export const authenticate = (req: RequestWithAuth, res: Response, next: NextFunction) => {
  let token = <string>(req.headers['x-access-token'] || req.headers['authorization']) // Express headers are auto converted to lowercase

  debug(`token=${token}`)
  if (token && token.startsWith('Bearer ')) {
    // Remove Bearer from string
    token = token.slice(7, token.length);
  }

  if (token) {
    jwt.verify(token, API.authSecret, (err, decoded) => {
      if (err) {
        debug('verify error:', err)
        res.status(UNAUTHORIZED).json({
          result:'인증 실패(invalid token)'
        })
      } else {
        //debug('decoded jwt:', decoded)
        req.tokenData = decoded
        next()
      }
    })
  } else if (API.authDisabled) {
    debug('authDisabled - API supplied in public')
    // set test user data
    req.tokenData = {
      user: {
        id: 'vTMvJVNXZPa5yxNU1E1ScN',
        createdAt: 1616721205067,
        userId: 'test1',
        name: '시험자',
        email: '',
        division: '',
        phone: '01012345678',
        level: ''
      }
    }
    next()
  } else {
    debug('Auth token is not supplied')
    res.status(UNAUTHORIZED).json({
      result:'access forbidden'
    })
  }
}

export default {promise, authenticate}
