import express from 'express'
import { create, getAll, getByUserId, updateById } from '../controllers/Order.js'
const router = express.Router()

router
    .post('/', create)
    .get('/', getAll)
    .get('/user/:id', getByUserId)
    .patch('/:id', updateById)

export default router