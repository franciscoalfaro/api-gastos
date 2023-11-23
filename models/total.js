const {Schema, model} = require("mongoose")
const mongoosePaginate = require('mongoose-paginate-v2');

const TotalSchema = Schema({
    userId:{
        type:Schema.ObjectId,
        ref:"User",
        required:true

    },
    gastoUtilizado:{
        type:Number,
        required:true
    },
    mes:{
        type:Number,
        required:true
    },
    ano:{
        type:Number,
        required:true
    },
    create_at:{
        type:Date,
        default:Date.now

    }

})

TotalSchema.plugin(mongoosePaginate);


module.exports = model("Total", TotalSchema, "totals")