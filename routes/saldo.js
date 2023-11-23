const express = require("express")
const router = express.Router()
const SaldoController = require("../controller/saldo")
const check = require("../middlewares/auth")


router.post("/register",check.auth, SaldoController.registrarSaldo)
router.put("/update",check.auth, SaldoController.actualizarSaldo)
router.delete("/delete",check.auth, SaldoController.eliminarSaldo)
router.get("/list/:page?",check.auth, SaldoController.listarSaldo)

module.exports=router