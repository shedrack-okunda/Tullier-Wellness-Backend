import express from 'express'
import cart from '../controllers/Cart.js'
const router = express.Router()

router
    .post('/', cart.create)
    .get('/user/:id', cart.getByUserId)
    .patch('/:id', cart.updateById)
    .delete('/:id', cart.deleteById)
    .delete('/user/:id', cart.deleteByUserId)

export default router