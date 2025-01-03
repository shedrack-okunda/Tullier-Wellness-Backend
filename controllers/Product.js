import Product from '../models/Product.js'

export const create = async (req, res) => {
    try {
        const created = new Product(req.body)
        await created.save()
        res.status(201).json(created)
    } catch(error) {
        return res.status(500).json({message: 'Error adding product, please try again.'})
    }
}

export const getAll = async (req, res) => {
    try {
        const filter = {}
        const sort = {}
        let skip = 0
        let limit = 0

        if (req.query.user) {
            filter['isDeleted'] = false
        }

        if (req.query.sort) {
            sort[req.query.sort] = req.query.order?req.query.order === 'asc'?1: -1 : 1
        }

        if (req.query.page && req.query.limit) {
            const pageSize = req.query.limit
            const page = req.query.page
            skip = pageSize * (page - 1)
            limit = pageSize
        }

        const totalDocs = await Product.find(filter).sort(sort).countDocuments().exec()
        const results = await Product.find(filter).sort(sort).skip(skip).limit(limit).exec()

        res.set('X-Total-Count', totalDocs)
        res.status(200).json(results)

    } catch(error) {
        return res.status(500).json({message: 'Error while fetching products, please try again.'})
    }
}

export const getById = async (req, res) => {
    try {
        const { id } = req.params
        const result = await Product.findById(id)
        res.status(200).json(result)
    } catch(error) {
        return res.status(500).json({message: 'Error getting product details, please try again'})
    }
}

export const updateById = async (req, res) => {
    try {
        const { id } = req.params
        const updated = await Product.findByIdAndUpdate(id, req.body, {new: true})
        res.status(200).json(updated)
    } catch(error) {
        return res.status(500).json({message: 'Error updating product, please try again.'})
    }
}

export const undeleteById = async (req, res) => {
    try {
        const { id } = req.params 
        const unDeleted = await Product.findByIdAndUpdate(id, {isDeleted: false}, {new: true})
        res.status(200).json(unDeleted)
    } catch (error) {
        return res.status(500).json({message: 'Error restoring product, please try again.'})
    }
}

export const deleteById = async (req, res) => {
    try {
        const { id } = req.params
        const deleted = await Product.findByIdAndUpdate(id, {isDeleted: true}, {new: true})
        res.status(200).json(deleted)
    } catch (error) {
        return res.status(500).json({message: 'Error deleting product, please try again.'})
    }
}