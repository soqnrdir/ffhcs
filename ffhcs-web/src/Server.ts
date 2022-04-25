import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import path from 'path'
import helmet from 'helmet'

import express, { Request, Response, NextFunction } from 'express'
import { BAD_REQUEST } from 'http-status-codes'
import 'express-async-errors'

import BaseRouter from './routes'
import logger from '@shared/Logger'


// Init express
const app = express()

/************************************************************************************
 *                              Set basic express settings
 ***********************************************************************************/

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())

// Show routes called in console during development
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
} else {
    app.use(morgan('common'))
}

// Security
if (process.env.NODE_ENV === 'production') {
    app.use(helmet())
}

// Add APIs
app.use('/v1', BaseRouter)

// Print API errors
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.message, err)
    return res.status(BAD_REQUEST).json({
        error: err.message,
    })
})


/************************************************************************************
 *                              Serve front-end content
 ***********************************************************************************/

const viewsDir = path.join(__dirname, 'views')
app.set('views', viewsDir)
app.set("view engine", "ejs")
if (process.env.NODE_ENV === 'development') {
    app.get('/', (req: Request, res: Response) => {
        res.sendFile('index.html', {root: viewsDir})
    })
}
const staticDir = path.join(__dirname, 'public')
app.use(express.static(staticDir))
app.get('/test', (req: Request, res: Response) => {
    res.sendFile('index.html', {root: viewsDir})
})

if (process.env.NODE_ENV === 'production') {
    // 개발자 모드에서는 배포된 앱을 실행하지 않는다
    const staticDir = path.join(__dirname, 'app-dist')
    app.use(express.static(staticDir))
}

// Export express instance
export default app
