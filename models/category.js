const { Schema, model } = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const CategorySchema = Schema({
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
        type: String
    },
    create_at: {
        type: Date,
        default: Date.now
    }
});

CategorySchema.plugin(mongoosePaginate);

module.exports = model("Category", CategorySchema, "categorys");
