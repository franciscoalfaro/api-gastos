const express = require("express")
const router = express.Router()
const TotalController = require("../controller/total")
const check = require("../middlewares/auth")


router.get("/consumo",check.auth, TotalController.obtenerTotalPorMesYAno)
router.post("/generartotal",check.auth, TotalController.generarTotalGastos)
router.get("/ultimosmeses", check.auth, TotalController.obtenerConsumosUltimos12Meses);
router.post("/fechas", check.auth, TotalController.listarGastosEntreFechas)




module.exports=router