import express from 'express'
import { create, getByUserId, updateById, deleteById, deleteByUserId} from '../controllers/Cart.js'
const router = express.Router()

router
    .post('/', create)
    .get('/user/:id', getByUserId)
    .patch('/:id', updateById)
    .delete('/:id', deleteById)
    .delete('/user/:id', deleteByUserId)

export default router