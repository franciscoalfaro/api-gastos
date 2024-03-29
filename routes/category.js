const express = require("express")
const router = express.Router()
const CategoryController = require("../controller/category")
const check = require("../middlewares/auth")

//ruta para crear actualizar y elmiminar gastos
router.post("/crearcategoria",check.auth, CategoryController.crearCategoria)
router.put("/update/:id",check.auth, CategoryController.actualizarCategoria)
router.delete("/delete/:id",check.auth, CategoryController.eliminarCategoria)
router.get("/list/:page?",check.auth, CategoryController.listarCategorias)
router.get("/listcategoria/",check.auth, CategoryController.listarCategoriasDrop)

module.exports=router