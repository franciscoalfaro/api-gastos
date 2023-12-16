//importar modulos
const fs = require("fs")
const path = require("path")
const mongoosePagination = require('mongoose-paginate-v2')

//importar modelo
const User = require("../models/user")
const Category = require("../models/category")
const Bill = require("../models/bills")
const Saldo = require("../models/saldo")

//importar servicio
const validateGasto = require("../helpers/validateGasto")


//end-point para crear el gasto
const gasto = async (req, res) => {

    let params = req.body;


    if (!params.name || !params.description || !params.cantidad || !params.valor || !params.categoria) {
        return res.status(400).json({
            status: "Error",
            message: "Faltan datos por enviar"
        });
    }

    try {
        // Obtener el userId del usuario autenticado desde el token
        const userId = req.user.id;
        console.log(userId)

        // Validar el gasto usando el servicio validateGasto
        validateGasto.validateGasto(params);

        // Buscar la categoría asociada al gasto
        let categoriaExistente = await Category.findOne({ userId, name: params.categoria });

        if (!categoriaExistente) {
            // Si la categoría no existe, crearla
            categoriaExistente = await Category.create({ userId,  name: params.categoria });
        }

        // Crear el nuevo gasto asociado al usuario
        const nuevoGasto = await Bill.create({
            userId: userId, // Asociar el gasto al usuario actual
            name: params.name,
            description: params.description,
            cantidad: params.cantidad,
            valor: params.valor,
            categoria: categoriaExistente._id // Asignar el ID de la categoría existente o recién creada
        });

        // Restar el valor del gasto al saldo del usuario
        const saldoUsuario = await Saldo.findOne({ userId: userId });

        if (saldoUsuario) {
            saldoUsuario.montoMensual -= params.valor; // Restar el valor del gasto al saldo
            await saldoUsuario.save(); // Guardar el saldo actualizado
        } else {
            return res.status(404).json({
                status: 'error',
                message: 'No se encontró el saldo del usuario'
            });
        }

        return res.status(201).json({
            status: "success",
            message: "Gasto guardado de forma correcta",
            gasto: nuevoGasto
        });

    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error al guardar el gasto",
            error: error.message
        });
    }
}


//end-point para actualizar gasto

const update = async (req, res) => {
    const { id } = req.params; // ID del gasto a actualizar
    const { name, description, cantidad, valor, categoria } = req.body; // Nuevos datos del gasto

    try {
        // Buscar la categoría por su nombre
        const categoriaExistente = await Category.findOne({ name: categoria });

        if (!categoriaExistente) {
            return res.status(404).json({
                status: 'error',
                message: 'La categoría no fue encontrada'
            });
        }

        // Buscar el gasto por su ID
        const gastoExistente = await Bill.findById(id);

        if (!gastoExistente) {
            return res.status(404).json({
                status: 'error',
                message: 'El gasto no fue encontrado'
            });
        }

        // Actualizar los campos del gasto
        gastoExistente.name = name || gastoExistente.name;
        gastoExistente.description = description || gastoExistente.description;
        gastoExistente.cantidad = cantidad || gastoExistente.cantidad;
        gastoExistente.valor = valor || gastoExistente.valor;
        gastoExistente.categoria = categoriaExistente._id; // Asignar el ID de la categoría encontrada

        // Guardar los cambios en la base de datos
        await gastoExistente.save();

        return res.status(200).json({
            status: 'success',
            message: 'Gasto actualizado correctamente',
            gasto: gastoExistente
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al actualizar el gasto',
            error: error.message
        });
    }

}


//end-point para eliminar gasto

const remove = async (req, res) => {
    try {
        //se obtiene el id por parametro
        const GastoId = req.params.id
        //se busca el id en la bd para eliminar el gasto
        const gastoDelete = await Bill.findByIdAndDelete(GastoId)
        //en caso de no existir se indica error 
        if (!gastoDelete) {
            return res.status(404).json({
                status: 'error',
                message: 'El gasto no fue encontrado'
            });
        }
        //se retorna exito al eliminar el gasto
        return res.status(200).json({
            status: 'success',
            message: 'Gasto eliminado correctamente',
            gasto: gastoDelete
        });

    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al eliminar el gasto',
            error: error.message
        });

    }

}

//listar los ultimos 30 gastos del mes en curso
const listarUltimosGastos = async (req, res) => {
    const userId = req.user.id; // ID del usuario obtenido del token
   
    const { page = 1, limit = 30 } = req.query;

    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    try {
        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { create_at: -1 },
        };

        // Filtrar los gastos por el mes actual
        const gastos = await Bill.paginate(
            { userId, create_at: { $gte: firstDayOfMonth, $lte: lastDayOfMonth } },
            options
        );

        return res.status(200).json({
            status: 'success',
            message: 'Lista de gastos del mes actual',
            gastos: gastos.docs,
            totalPages: gastos.totalPages,
            currentPage: gastos.page,
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al listar los gastos',
            error: error.message,
        });
    }
};


const listarUltimos10 = async (req, res) => {
    const userId = req.user.id;
    const { page = 1, limit = 4 } = req.query;

    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    try {
        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { create_at: -1 },
            populate: 'categoria', // Aquí especificamos el campo para poblar
        };

        const gastos = await Bill.paginate(
            { userId, create_at: { $gte: firstDayOfMonth, $lte: lastDayOfMonth } },
            options
        );

        return res.status(200).json({
            status: 'success',
            message: 'Lista de gastos del mes actual',
            gastos: gastos.docs,
            totalPages: gastos.totalPages,
            currentPage: gastos.page,
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al listar los gastos',
            error: error.message,
        });
    }
};



module.exports = {
    gasto,
    update,
    remove,
    listarUltimosGastos,
    listarUltimos10
}