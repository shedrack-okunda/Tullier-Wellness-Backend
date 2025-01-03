import Order from '../models/Order.js'

export const create = async (req, res) => {
    try {   
        const created = new Order(req.body)
        await created.save()
        res.status(201).json(created)
    } catch(error) {
        return res.status(500).json({message: 'Error occurred while creating an order, please try again.'})
    }
}

export const getByUserId = async (req, res) => {
    try {
        const { id } = req.params
        const results = await Order.find({user: id})
        res.status(200).json(results)
    } catch(error) {
        return res.status(500).json({message: 'Error fetching orders, please try again.'})
    }
}

export const getAll = async (req, res) => {
    try {
        let skip = 0
        let limit = 0

        if (req.query.page && req.query.limit) {
            const pageSize = req.query.limit
            const page = req.query.page
            skip = pageSize * (page - 1)
            limit = pageSize
        }

        const totalDocs = await Order.find({}).countDocuments().exec()
        const results = await Order.find({}).skip(skip).limit(limit).exec()

        res.header('X-Total-Count', totalDocs)
        res.status(200).json(results)
    } catch(error) {
        return res.status(500).json({message: 'Error fetching orders, please try again.'})
    }
}

export const updateById = async (req, res) => {
    try {
        const { id } = req.params
        const updated = await Order.findByIdAndUpdate(id, req.body, {new: true})
        res.status(200).json(updated)
    } catch(error) {
        return res.status(500).json({message: 'Error updating order, please try again.'})
    }
}