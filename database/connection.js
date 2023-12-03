const mongoose = require('mongoose')

const connection = async()=>{
    try {
        await mongoose.connect("mongodb://localhost:27017/dbGastos")
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