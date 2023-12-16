const express = require("express")
const router = express.Router()
const BillController = require("../controller/bills")
const check = require("../middlewares/auth")

//ruta para crear actualizar y elmiminar gastos
router.post("/creargasto",check.auth, BillController.gasto)
router.put("/update/:id",check.auth, BillController.update)
router.delete("/delete/:id",check.auth, BillController.remove)
router.get("/ultimosgastos",check.auth, BillController.listarUltimosGastos)
router.get("/ultimos10",check.auth, BillController.listarUltimos10)

module.exports=router