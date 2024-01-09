const express = require("express")
const router = express.Router()
const IndicadorController = require("../controller/indicador")
const check = require("../middlewares/auth")

//ruta para crear actualizar y elmiminar gastos
router.get("/economico", IndicadorController.dolarobservador)

module.exports=router