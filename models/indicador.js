const { Schema, model } = require("mongoose")
const mongoosePaginate = require('mongoose-paginate-v2');

const IndicadorSchema = Schema({
    descripEsp: {
        type: String,
        required: true
    },
    seriesId: {
        type: String,
        required: true
    },
    Obs: [
        {
            indexDateString: {
                type: String,
            },
            value: {
                type: String,
            },
            statusCode: {
                type: String,
            }
        }
    ],
    create_at: {
        type: Date,
        default: Date.now

    }

})



IndicadorSchema.plugin(mongoosePaginate);


module.exports = model("Indicador", IndicadorSchema, "indicadores")