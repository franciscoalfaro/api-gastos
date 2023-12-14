const mongoosePagination = require('mongoose-paginate-v2')

const Saldo = require("../models/saldo")
const Total = require("../models/total")

const registrarSaldo = async (req, res) => {
    const userId = req.user.id;
    const { montoMensual, mes, tope1, tope2, ano } = req.body; // Datos del saldo a crear

    try {
        // Verificar si ya existe un registro de saldo para el usuario en el mes y año dados
        const saldoExistente = await Saldo.findOne({ userId, mes, ano });

        if (saldoExistente) {
            return res.status(409).json({
                status: 'error',
                message: 'Ya existe un saldo para el usuario en el mes y año dados'
            });
        }

        // Crear un nuevo registro de saldo
        const nuevoSaldo = new Saldo({
            userId,
            montoMensual,
            tope1,
            tope2,
            mes,
            ano
        });

        const saldoIniTotal = new Total({
            userId,
            montoMensual,
            gastoUtilizado: 0,
            mes,
            ano

        })

        // Guardar el nuevo saldo en la base de datos
        await nuevoSaldo.save();
        await saldoIniTotal.save()

        return res.status(201).json({
            status: 'success',
            message: 'Saldo creado correctamente',
            saldo: nuevoSaldo,
            saldoInicial: saldoIniTotal
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al crear el saldo',
            error: error.message
        });
    }
}

const actualizarSaldo = async (req, res) => {
    const userId = req.user.id;
    const { montoMensual, mes, año, tope1, tope2 } = req.body; // Nuevos datos del saldo a actualizar

    try {
        // Verificar si ya existe un registro de saldo para el usuario en el mes y año dados
        const saldoExistente = await Saldo.findOne({ userId, mes, año });

        if (!saldoExistente) {
            return res.status(404).json({
                status: 'error',
                message: 'No se encontró un saldo para el usuario en el mes y año dados'
            });
        }

        // Actualizar el registro de saldo existente
        saldoExistente.montoMensual = montoMensual;
        // Verificar y actualizar los campos opcionales
        if (tope1 !== undefined) {
            saldoExistente.tope1 = tope1;
        }
        if (tope2 !== undefined) {
            saldoExistente.tope2 = tope2;
        }
        await saldoExistente.save();

        return res.status(200).json({
            status: 'success',
            message: 'Saldo actualizado correctamente',
            saldo: saldoExistente
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al actualizar el saldo',
            error: error.message
        });
    }
};


const eliminarSaldo = async (req, res) => {
    const usuarioId = req.user.id; // ID del usuario autenticado desde el token
    const { mes, año } = req.body; // Datos del saldo a eliminar (mes y año)

    try {
        // Buscar y eliminar el saldo del usuario identificado para el mes y año dados
        const saldoEliminado = await Saldo.findOneAndDelete({ userId: usuarioId, mes, año });

        if (!saldoEliminado) {
            return res.status(404).json({
                status: 'error',
                message: 'No se encontró un saldo para el usuario en el mes y año dados'
            });
        }

        return res.status(200).json({
            status: 'success',
            message: 'Saldo eliminado correctamente',
            saldo: saldoEliminado
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al eliminar el saldo',
            error: error.message
        });
    }
};



//este end-poit es para listar el historico del saldo del usuario 
const listarSaldo = async (req, res) => {
    const usuarioId = req.user.id; // Obtener el ID del usuario autenticado desde el token
    let page = 1;

    if (req.params.page) {
        page = parseInt(req.params.page);
    }

    const itemPerPage = 6;

    const opciones = {
        page: page,
        limit: itemPerPage,
        sort: { _id: -1 },
        select: ("-password -email -role -__v")
    };

    try {
        // Filtrar el saldo por el ID del usuario
        const total = await Saldo.paginate({ userId: usuarioId }, opciones);

        if (!total || total.docs.length === 0) {
            return res.status(404).json({
                status: "Error",
                message: "No se encontró saldo para este usuario"
            });
        }

        return res.status(200).send({
            status: "success",
            message: "Listado de saldos del usuario",
            total: total.docs,
            totalDocs: total.totalDocs,
            itempage: total.limit,
            page: total.page
        });

    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al listar el saldo',
            error: error.message
        });
    }
};

const saldoActual = async (req, res) => {
    const usuarioId = req.user.id;
    console.log(usuarioId)

    try {
        const saldoUser = await Saldo.findOne({ userId: usuarioId })
    
        return res.status(200).send({
            status: "success",
            message: "monto actual",
            saldoUser,


        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al listar el saldo',
            error: error.message
        });
    }

}



module.exports = {
    registrarSaldo,
    actualizarSaldo,
    eliminarSaldo,
    listarSaldo,
    saldoActual
}