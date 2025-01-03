import Review from '../models/Review.js'

export const create = async (req, res) => {
    try {
        const created = await new Review(req.body).populate({path: 'user', select: '-password'})  
        await created.save()
        res.status(201).json(created)
    } catch (error) {
        return res.status(500).json({message: 'Error posting review, please try again.'})
    }
}

export const getByProductId = async (req, res) => {
    try {
        const { id } = req.params
        let skip = 0
        let limit = 0

        if (req.query.page && req.query.limit) {
            const pageSize = req.query.limit
            const page = req.query.page

            skip = pageSize * (page - 1)
            limit = pageSize
        }

        const totalDocs = await Review.find({product: id}).countDocuments().exec()
        const result = await Review.find({product: id}).skip(skip).limit(limit).populate('user').exec()

        res.status('X-Total-Count', totalDocs)
        res.status(200).json(result)

    } catch(error) {
        return res.status(500).json({message: 'Error getting reviews for this product, please try again.'})
    }
}

export const updateById = async (req, res) => {
    try {
        const { id } = req.params
        const updated = await Review.findByIdAndUpdate(id, req.body, {new: true}).populate('user')
        res.status(200).json(updated)
    } catch(error) {
        return res.status(500).json({message: 'Error updating review, please try again.'})
    }
}

export const deleteById = async (req, res) => {
    try {
        const { id } = req.params
        const deleted = await Review.findByIdAndDelete(id)
        res.status(200).json(deleted)
    } catch(error) {
        return res.status(500).json({message: 'Error deleting review, please try again.'})
    }
}