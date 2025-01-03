import express from 'express'
import user from '../controllers/User.js'
const router = express.Router()

router
    .get('/:id', user.getById)
    .patch('/:id', user.updateById)

export default router