const mongoose = require('mongoose')
require('dotenv').config();

const connection = async()=>{
    try {
        //await mongoose.connect("mongodb://localhost:27017/dbGastos")
        await mongoose.connect(process.env.MONGODB_URI,)
        console.log("Connection success BD Gastos")
        
    } catch (error) {
        console.log(error);
        console.log('Intentando nuevamente la conexión en 5 segundos...');
        setTimeout(connection, 5000);
        
    }
}


module.exports={
    connection
}