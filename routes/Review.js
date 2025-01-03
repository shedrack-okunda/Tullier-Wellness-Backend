import express from 'express'
import review from '../controllers/Review.js'
const router = express.Router()

router
    .post('/', review.create)
    .get('/product/:id', review.getByProductId)
    .patch('/:id', review.updateById)
    .delete('/:id', review.deleteById)

export default router