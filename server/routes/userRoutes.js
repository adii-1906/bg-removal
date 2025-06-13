import express from 'express'
import { clerkWebHooks, userCredits } from '../controllers/userController.js'
import authUser from '../middlewares/auth.js'

const userRouter = express.Router()

userRouter.post('/webhooks', clerkWebHooks)
userRouter.get('/credits', authUser, userCredits)

export default userRouter