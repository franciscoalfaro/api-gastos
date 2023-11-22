const {Schema, model} = require("mongoose")
const mongoosePaginate = require('mongoose-paginate-v2');

const CategorySchema = Schema({
    name:{
        type:String,
        require:true
    },
    description:{
        type:String
    },
    create_at:{
        type:Date,
        default:Date.now

    }

})

CategorySchema.plugin(mongoosePaginate);


module.exports = model("Category", CategorySchema, "categorys")