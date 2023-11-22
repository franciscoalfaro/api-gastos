//importar modulos
const fs = require("fs")
const path = require("path")
const mongoosePagination = require('mongoose-paginate-v2')

//importar modelo
const User = require("../models/user")
const Category = require("../models/category")
const Bill = require("../models/bills")


const crearCategoria = async (req, res) => {
    let params = req.body;

    if (!params.name || !params.description ) {
        return res.status(400).json({
            status: "Error",
            message: "Faltan datos por enviar"
        });
    }
    try {
        // Comprobar si la categoría ya existe por su nombre
        const categoriaExistente = await Category.findOne({ name: params.name });

        if (categoriaExistente) {
            return res.status(409).json({
                status: "error",
                message: "La categoría ya existe"
            });
        }

        // Si la categoría no existe, crearla
        const nuevaCategoria = await Category.create({
            name: params.name,
            description: params.description
        });

        return res.status(201).json({
            status: "success",
            message: "Categoría creada correctamente",
            categoria: nuevaCategoria
        });

    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error al crear la categoría",
            error: error.message
        });
    }


}


const eliminarCategoria = async (req, res) => {
    try {
        const categoriaId = req.params.id;
        
        // Buscar la categoría por su ID
        const categoriaEliminar = await Category.findById(categoriaId);

        if (!categoriaEliminar) {
            return res.status(404).json({
                status: 'error',
                message: 'La categoría no fue encontrada'
            });
        }

        // Encontrar la categoría predeterminada (por ejemplo, "Sin Categoría")
        const categoriaPredeterminada = await Category.findOne({ name: 'Sin Categoría' });

        // Actualizar los gastos asociados a la categoría que se eliminará
        await Bill.updateMany({ categoria: categoriaId }, { categoria: categoriaPredeterminada._id });

        // Eliminar la categoría
        await Category.findByIdAndDelete(categoriaId);

        return res.status(200).json({
            status: 'success',
            message: 'Categoría eliminada correctamente'
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al eliminar la categoría',
            error: error.message
        });
    }
};

const actualizarCategoria = async (req, res) => {
    const { id } = req.params; // ID de la categoría
    const { name, description } = req.body; // Nuevos datos de la categoría

    try {
        // Buscar la categoría por su nombre
        const categoriaExistente = await Category.findOne({ name });


        // Si existe una categoría con el mismo nombre y un ID diferente al de la categoría que se está actualizando
        if (categoriaExistente && categoriaExistente._id.toString() !== id) {
            return res.status(409).json({
                status: 'error',
                message: 'El nombre de la categoría ya existe'
            });
        }

        // Actualizar la categoría por su ID
        const categoriaActualizada = await Category.findByIdAndUpdate(
            id,
            { name, description },
            { new: true }
        );

        if (!categoriaActualizada) {
            return res.status(404).json({
                status: 'error',
                message: 'La categoría no fue encontrada'
            });
        }

        return res.status(200).json({
            status: 'success',
            message: 'Categoría actualizada correctamente',
            categoria: categoriaActualizada
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al actualizar la categoría',
            error: error.message
        });
    }
};

module.exports={
    crearCategoria,
    eliminarCategoria,
    actualizarCategoria
}