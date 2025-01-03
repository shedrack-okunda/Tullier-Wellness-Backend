import Address from '../models/Address.js'

export const create = async(req, res) => {
    try {
        const created = new Address(req.body)
        await created.save()
        res.status(201).json(created)
    } catch (error) {
        return res.status(500).json({message: 'Error adding address, please try again.'})
    }
}

export const getByUserId = async (req, res) => {
    try {
        const { id } = req.params
        const results = await Address.find({user: id})
        res.status(200).json(results)
    } catch (error) {
        return res.status(500).json({message: 'Error fetching address, please try again.'})
    }
}

export const updateById = async (req, res) => {
    try {
        const { id } = req.params
        const updated = await Address.findByIdAndUpdate(id, req.body, {new: true})
        res.status(200).json(updated)
    } catch(error) {
        return res.status(500).json({message: 'Error updating address, please try again.'})
    }
}

export const deleteById = async (req, res) => {
    try {
        const { id } = req.params
        const deleted = await Address.findByIdAndDelete(id)
        res.status(200).json(deleted)
    } catch(error) {
        return res.status(500).json({message: 'Errors deleting address, please try again.'})
    }
}