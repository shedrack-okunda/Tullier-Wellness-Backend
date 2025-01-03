import express from 'express'
import { getById, updateById } from '../controllers/User.js'
const router = express.Router()

router
    .get('/:id', getById)
    .patch('/:id', updateById)

export default router