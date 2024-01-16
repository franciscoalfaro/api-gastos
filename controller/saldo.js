const mongoosePagination = require('mongoose-paginate-v2')

const Saldo = require("../models/saldo")
const Total = require("../models/total")

const registrarSaldo = async (req, res) => {
    const userId = req.user.id;
    const { montoMensual, mes, tope1, tope2, ano } = req.body; // Datos del saldo a crear

  

    try {
        // Verificar si ya existe un registro de saldo para el usuario en el mes y año dados
        const saldoExistente = await Saldo.findOne({ userId, mes, ano });
        const saldoExistenteTotal = await Total.findOne({ userId, mes, ano });

        if (saldoExistente && saldoExistenteTotal) {
            // Si hay un saldo existente para el mes y año actual, se suma el monto mensual al saldo actual
            saldoExistente.montoMensual = parseInt(saldoExistente.montoMensual) + parseInt(montoMensual);
            saldoExistenteTotal.montoMensual = parseInt(saldoExistenteTotal.montoMensual) + parseInt(montoMensual);
            await saldoExistente.save();
            await saldoExistenteTotal.save()

            return res.status(200).json({
                status: 'success',
                message: 'Se ha actualizado el saldo existente',
                saldo: saldoExistente,
                total:saldoExistenteTotal

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
    const { montoMensual, mes, ano, tope1, tope2 } = req.body; // Nuevos datos del saldo a actualizar
    

    try {
        // Verificar si ya existe un registro de saldo para el usuario en el mes y año dados
        const saldoExistente = await Saldo.findOne({ userId, mes, ano });
        const saldoExistenteTotal = await Total.findOne({ userId, mes, ano });


        if (!saldoExistente && !saldoExistenteTotal) {
            return res.status(404).json({
                status: 'error',
                message: 'No se encontró un saldo para el usuario en el mes y año dados'
            });
        }

        // Actualizar el registro de saldo existente
        saldoExistente.montoMensual = parseInt(saldoExistente.montoMensual) + parseInt(montoMensual);
        saldoExistenteTotal.montoMensual = parseInt(saldoExistenteTotal.montoMensual) + parseInt(montoMensual);
        // Verificar y actualizar los campos opcionales
        if (tope1 !== undefined) {
            saldoExistente.tope1 = tope1;
        }
        if (tope2 !== undefined) {
            saldoExistente.tope2 = tope2;
        }
        await saldoExistente.save();
        await saldoExistenteTotal.save();

        return res.status(200).json({
            status: 'success',
            message: 'Saldo actualizado correctamente',
            saldo: saldoExistente,
            saldo2:saldoExistenteTotal
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
    const saldoId = req.params.id; // ID del saldo a eliminar obtenido desde los parámetros

    try {
        // Buscar el saldo a eliminar para obtener el mes, año y montoMensual
        const saldoAEliminar = await Saldo.findById(saldoId);

        if (!saldoAEliminar || saldoAEliminar.userId.toString() !== usuarioId) {
            return res.status(404).json({
                status: 'error',
                message: 'No se encontró un saldo para el usuario con el ID proporcionado'
            });
        }

        // Obtiene el mes, año y userId del saldo a eliminar
        const { mes, ano } = saldoAEliminar;

        // Eliminar el saldo del modelo Saldo
        const saldoEliminado = await Saldo.findByIdAndDelete(saldoId);

        if (!saldoEliminado) {
            return res.status(404).json({
                status: 'error',
                message: 'No se encontró un saldo para eliminar'
            });
        }

        // Eliminar los documentos en el modelo Total correspondientes al userId, mes y año
        await Total.deleteMany({ userId: usuarioId, mes, ano });

        return res.status(200).json({
            status: 'success',
            message: 'Saldo y documentos relacionados en Total eliminados correctamente',
            saldo: saldoEliminado
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al eliminar el saldo y documentos relacionados en Total',
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

    const itemPerPage = 4;

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

    try {
        // Obtener la fecha actual
        const fechaActual = new Date();
        const mesActual = fechaActual.getMonth() + 1; // El mes es base cero, por lo que sumamos 1 para obtener el mes actual

        // Buscar el saldo del usuario para el mes actual
        const saldoActualUsuario = await Saldo.findOne({ userId: usuarioId, mes: mesActual });

        if (!saldoActualUsuario) {
            return res.status(404).json({
                status: 'error',
                message: 'No se encontró saldo para el usuario en el mes actual',
            });
        }

        return res.status(200).json({
            status: 'success',
            message: 'Saldo actual del mes encontrado',
            saldoUser: saldoActualUsuario,
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al obtener el saldo actual del mes',
            error: error.message,
        });
    }
};





module.exports = {
    registrarSaldo,
    actualizarSaldo,
    eliminarSaldo,
    listarSaldo,
    saldoActual
}