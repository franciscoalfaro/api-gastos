const {Schema, model} = require("mongoose")
const mongoosePaginate = require('mongoose-paginate-v2');

const BillsySchema = Schema({
    name:{
        type:String,
        require:true
    },
    description:{
        type:String,
        required:true
    },
    cantidad:{
        type:Number,
        required:true
    },
    valor:{
        type:Number,
        required:true
    },
    
    categoria:{
        type:Schema.ObjectId,
        ref:"Category"

    },
    create_at:{
        type:Date,
        default:Date.now

    }

})

BillsySchema.plugin(mongoosePaginate);


module.exports = model("Bills", BillsySchema, "bills")