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

    if (!params.name) {
        return res.status(400).json({
            status: "Error",
            message: "Faltan datos por enviar"
        });
    }

    try {
        // Obtener el userId del usuario autenticado desde el token
        const userId = req.user.id;

        // Comprobar si la categoría ya existe por su nombre para el usuario actual
        const categoriaExistente = await Category.findOne({ name: params.name, userId: userId });

        if (categoriaExistente) {
            return res.status(409).json({
                status: "error",
                message: "La categoría ya existe para este usuario"
            });
        }

        // Si la categoría no existe para el usuario actual, crearla asociada a ese usuario
        const nuevaCategoria = await Category.create({
            name: params.name,
            description: params.description,
            userId: userId // Asociar la categoría al usuario actual
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
        const userId = req.user.id; // Obtener el ID del usuario autenticado desde el token

        // Buscar la categoría por su ID y el usuario que la creó
        const categoriaEliminar = await Category.findOne({ _id: categoriaId, userId: userId });

        if (!categoriaEliminar) {
            return res.status(404).json({
                status: 'error',
                message: 'La categoría no fue encontrada o no tiene permisos para eliminarla'
            });
        }

        // Encontrar la categoría predeterminada (por ejemplo, "Sin Categoría") asociada al usuario
        let categoriaPredeterminada = await Category.findOne({ name: 'Sin Categoría', userId: userId });

        // Si no se encuentra la categoría predeterminada, crearla asociada al usuario
        if (!categoriaPredeterminada) {
            categoriaPredeterminada = await Category.create({ name: 'Sin Categoría', userId: userId });
        }

        // Actualizar los gastos asociados a la categoría que se eliminará
        await Bill.updateMany({ categoria: categoriaId, userId: userId }, { categoria: categoriaPredeterminada._id });

        // Eliminar la categoría asociada al usuario
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


const listarCategorias = async (req, res) => {
    const userId = req.user.id; // Suponiendo que tienes el ID del usuario en el token
    let page = 1;

    if (req.params.page) {
        page = parseInt(req.params.page);
    }

    const itemPerPage = 4;

    try {
        const options = {
            page: page,
            limit: itemPerPage,
            
        };
        // Buscar todas las categorías asociadas al usuario
        const categorias = await Category.paginate({ userId},options );

        return res.status(200).json({
            status: 'success',
            message: 'Categorías encontradas',
            categorias:categorias.docs,
            totalPages: categorias.totalPages,
            totalCategories: categorias.totalCategoria,
            itempage: categorias.limit,
            page: categorias.page,
            totalDocs:categorias.totalDocs
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al listar las categorías',
            error: error.message
        });
    }
};


const listarCategoriasDrop = async (req, res) => {
    const userId = req.user.id; // Suponiendo que tienes el ID del usuario en el token

    try {

        // Buscar todas las categorías asociadas al usuario
        const categorias = await Category.paginate({ userId} );

        return res.status(200).json({
            status: 'success',
            message: 'Categorías encontradas',
            categorias:categorias.docs
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al listar las categorías',
            error: error.message
        });
    }
};

module.exports={
    crearCategoria,
    eliminarCategoria,
    actualizarCategoria,
    listarCategorias,
    listarCategoriasDrop
}