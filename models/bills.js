const { Schema, model } = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const BillSchema = Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    cantidad: {
        type: Number,
        required: true
    },
    valor: {
        type: Number,
        required: true
    },
    categoria: {
        type: Schema.Types.ObjectId,
        ref: "Category"
    },
    create_at: {
        type: Date,
        default: Date.now
    }
});

BillSchema.plugin(mongoosePaginate);

module.exports = model("Bills", BillSchema, "bills");
