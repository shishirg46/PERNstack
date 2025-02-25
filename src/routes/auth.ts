import express, { Request, Response } from 'express'
import { AuthController } from '../controllers/AuthController'

const router = express.Router()
const authController = new AuthController()
router.post('/register', (req: Request, res: Response) =>
    authController.register(req, res),
)
export default router
