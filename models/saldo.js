const {Schema, model} = require("mongoose")
const mongoosePaginate = require('mongoose-paginate-v2');


const SaldoSchema = Schema({
    userId:{
        type:Schema.ObjectId,
        ref:"User",
        required:true

    },
    montoMensual:{
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

SaldoSchema.plugin(mongoosePaginate);


module.exports = model("Saldo", SaldoSchema, "saldos")