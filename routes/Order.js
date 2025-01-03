import express from 'express'
import order from '../controllers/Order.js'
const router = express.Router()

router
    .post('/', order.create)
    .get('/', order.getAll)
    .get('/user/:id', order.getByUserId)
    .patch('/:id', order.updateById)

export default router