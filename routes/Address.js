import express from 'express'
import address from '../controllers/Address.js'
const router = express.Router()

router
    .post('/', address.create)
    .get('/user/:id', address.getByUserId)
    .patch('/:id', address.updateById)
    .delete('/:id', address.deleteById)

export default router