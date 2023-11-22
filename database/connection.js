const mongoose = require('mongoose')

const connection = async()=>{
    try {
        await mongoose.connect("mongodb://localhost:27017/dbGastos")
        console.log("Connection success BD Gastos")
        
    } catch (error) {
        console.log(error);
        throw new Error("The connection has been refused..");
        
    }
}


module.exports={
    connection
}