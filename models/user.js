const {Schema, model} = require("mongoose")
const mongoosePaginate = require('mongoose-paginate-v2');
const Category = require("./category")

const UserSchema = Schema({
    name:{
        type:String,
        require:true
    },
    surname:{
        type:String
    },
    bio:{
        type:String
    },
    nick:{
        type:String,
        require:true
    },
    email:{
        type:String,
        require:true
    },
    password:{
        type:String,
        require:true
    },
    role:{
        type:String,
        default:"role_user"
    },
    image:{
        type:String,
        default:"default.png"
    },
    eliminado:{
        type: Boolean,
        default: false
    },
    create_at:{
        type:Date,
        default:Date.now

    }

})

//hook para crear la categoria "sin categoria", para el nuevo usuario
UserSchema.post('save', async function (user) {
    try {
        // Verificar si ya existe la categoría 'Sin Categoría' asociada a este usuario
        const sinCategoria = await Category.findOne({ name: 'Sin Categoría', userId: user._id });

        // Si no existe, crearla
        if (!sinCategoria) {
            await Category.create({ name: 'Sin Categoría', userId: user._id });
        }
    } catch (error) {
        console.error('Error al crear la categoría predeterminada:', error);
    }
});

UserSchema.plugin(mongoosePaginate);


module.exports = model("User", UserSchema, "users")