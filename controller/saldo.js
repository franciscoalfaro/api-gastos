const mongoosePagination = require('mongoose-paginate-v2')

const Saldo = require("../models/saldo")

const registrarSaldo = async (req, res) =>{
    const userId = req.user.id; 
    const { montoMensual, mes, ano } = req.body; // Datos del saldo a crear

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
            mes,
            ano
        });

        // Guardar el nuevo saldo en la base de datos
        await nuevoSaldo.save();

        return res.status(201).json({
            status: 'success',
            message: 'Saldo creado correctamente',
            saldo: nuevoSaldo
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
    const { userId, montoMensual, mes, año } = req.body; // Nuevos datos del saldo a actualizar

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
    const { userId, mes, año } = req.body; // Datos del saldo a eliminar

    try {
        // Buscar y eliminar el registro de saldo para el usuario en el mes y año dados
        const saldoEliminado = await Saldo.findOneAndDelete({ userId, mes, año });

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

    let page = 1
    if (req.params.page) {
        page = req.params.page
    }

    page = parseInt(page)

    let itemPerPage = 6

    const opciones = {
        page: page,
        limit: itemPerPage,
        sort: { _id: -1 },
        select: ("-password -email -role -__v")
    };


    try {

        Saldo.paginate({}, opciones, async (error, total) => {

            if (error || !total) return res.status(404).json({ status: "Error", message: "NO SE HA ENCONTRADO EL USUARIO" })
    
            return res.status(200).send({
                status: "success",
                message: "listado de saldos",
                total

    
            })
        })



    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al listar el saldo',
            error: error.message
        });
    }
};


module.exports = {
    registrarSaldo,
    actualizarSaldo,
    eliminarSaldo,
    listarSaldo
}