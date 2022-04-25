import { Router } from 'express'
import AuthRouter from './Auth'
import UserRouter from './Users'
import AdminRouter from './Admins'
import CameraRouter from './Cameras'
import CameraGroupRouter from './CameraGroups'
import TestRouter from './Test'
import PlaylistRouter from './Playlists'
import PlaylogRouter from './Playlogs'

// Init router and path
const router = Router()

// Add sub-routes
router.use('/auth', AuthRouter)
router.use('/users', UserRouter)
router.use('/admins', AdminRouter)
router.use('/cameras', CameraRouter)
router.use('/cameragroups', CameraGroupRouter)
router.use('/tests', TestRouter)
router.use('/playlists', PlaylistRouter)
router.use('/playlogs', PlaylogRouter)

// Export the base-router
export default router
