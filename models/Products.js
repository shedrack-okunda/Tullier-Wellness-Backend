import mongoose from 'mongoose'

const {Schema} = mongoose

const productSchema = new Schema({
    title: {type: String, required: true},
    description: {type: String, required: true},
    price: {type: Number, required: true},
    stockQuantity: {type: Number, required: true},
    images: {type: [String], required: true},
}, {timestamps: true, versionKey: false} )

const Product = mongoose.model('Product', productSchema)
export default Product