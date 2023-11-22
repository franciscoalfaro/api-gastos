//importar dependencia de conexion
const {connection} = require("./database/connection");
const express = require("express");
const cors = require ("cors")


console.log("API Connection success")
// efectuar conexion a BD
connection();

const app = express();
const puerto = 3000;

//configurar cors
app.use(cors());

//conertir los datos del body a obj js
app.use(express.json());
app.use(express.urlencoded({extended:true}));


//cargar rutas
const UserRoutes = require("./routes/user")
const CategoryRoutes = require("./routes/category")
const BillsRoutes = require("./routes/bills")

app.use("/api/user" ,UserRoutes)
app.use("/api/bills",BillsRoutes)
app.use("/api/category",CategoryRoutes )

//escuchar peticiones 
app.listen(puerto, ()=> {
    console.log("Server runing in port :" +puerto)
})