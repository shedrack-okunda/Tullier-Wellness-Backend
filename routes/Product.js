import express from 'express'
import { create, getAll, getById, updateById, undeleteById, deleteById } from '../controllers/Product.js'
const router = express.Router()

router
    .post('/', create)
    .get('/', getAll)
    .get('/:id', getById)
    .patch('/:id', updateById)
    .patch('/undelete/:id', undeleteById)
    .delete('/:id', deleteById)

export default router