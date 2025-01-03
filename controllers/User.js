import User from '../models/User.js'

export const getById = async (req, res) => {
    try {
        const { id } = req.params
        const result = (await User.findById(id)).toObject()
        delete result.password
        res.status(200).json(result)
    } catch (error) {
        return res.status(500).json({message: 'Error getting your details, please try again.'})
    }
}

export const updateById = async (req, res) => {
    try {
        const { id } = req.params
        const updated = (await User.findByIdAndUpdate(id, req.body, {new: true})).toObject()
        delete updated.password
        res.status(200).json(updated)
    } catch (error) {
        return res.status(500).json({message: 'Error getting your details, please try again.'})
    }
}