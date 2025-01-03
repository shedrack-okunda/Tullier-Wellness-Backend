import express from 'express'
import product from '../controllers/Product.js'
const router = express.Router()

router
    .post('/', product.create)
    .get('/', product.getAll)
    .get('/:id', product.getById)
    .patch('/:id', product.updateById)
    .patch('/undelete/:id', product.undeleteById)
    .delete('/:id', product.deleteById)

export default router