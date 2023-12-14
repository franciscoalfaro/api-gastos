const Total = require('../models/total');
const Bill = require("../models/bills")
const Saldo = require("../models/saldo")


//obtener el total por mes y ano para el historico si lo desea el usuario
const obtenerTotalPorMesYAno = async (req, res) => {
    const usuarioId = req.user.id; // Suponiendo que tienes el ID del usuario en el token

    const { mes, ano } = req.body; // Mes y año proporcionados en la URL
    

    try {
        // Buscar el total utilizado por el usuario en el mes y año dados
        const totalUsuario = await Total.findOne({ userId: usuarioId, mes, ano });

        if (!totalUsuario) {
            return res.status(404).json({
                status: 'error',
                message: 'No se encontró el total utilizado para el usuario en el mes y año dados'
            });
        }

        return res.status(200).json({
            status: 'success',
            total: totalUsuario
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al obtener el total utilizado',
            error: error.message
        });
    }
};

//generar el total de gastos se debe de generar este end-point para que se refleje en el ultimo 12 meses
const generarTotalGastos = async (req, res) => {
    const { mes, ano } = req.body;
    const userId = req.user.id;

    try {
        // Encontrar el saldo inicial del usuario
        const saldoInicial = await Total.findOne({ userId, mes, ano });

        if (!saldoInicial) {
            return res.status(404).json({
                status: 'error',
                message: 'No se encontró el saldo inicial del usuario'
            });
        }

        // Buscar los gastos asociados al usuario para el mes y año dados
        const gastos = await Bill.find({
            userId: userId,
            create_at: { $gte: new Date(ano, mes - 1, 1), $lt: new Date(ano, mes, 1) }
        });

        // Calcular el total de gastos sumando los valores de los gastos encontrados
        const totalGastos = gastos.reduce((total, gasto) => total + gasto.valor, 0);

        // Crear o actualizar el registro de Total de Gastos
        // ... (código de creación/actualización de Total de Gastos)
        saldoInicial.gastoUtilizado = totalGastos;
        await saldoInicial.save();

        return res.status(200).json({
            status: 'success',
            message: 'Total de gastos generado correctamente',
            total: {
                saldoInicial: saldoInicial.montoMensual,
                gastoUtilizado: totalGastos
                // Puedes agregar más detalles del total si es necesario
            }
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al generar el total de gastos',
            error: error.message
        });
    }
};


//obtener los ultimos 12 meses de gastos
const obtenerConsumosUltimos12Meses = async (req, res) => {
    const userId = req.user.id; // ID del usuario obtenido del token


    try {
        // Obtener la fecha actual
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;


        // Crear un arreglo para almacenar los consumos de los últimos 12 meses
        const consumosUltimos12Meses = [];

        // Iterar sobre los últimos 12 meses y buscar los consumos del usuario
        for (let i = 0; i < 12; i++) {
            const year = currentYear - Math.floor((currentMonth - i - 1) / 12);
            const month = ((currentMonth - i - 1) % 12) + 1;

            const totalUsuario = await Total.findOne({ userId, mes: month, ano: year });

            if (!totalUsuario) {
                consumosUltimos12Meses.push({ month, year, total: 0 });
            } else {
                consumosUltimos12Meses.push({ month, year, total: totalUsuario.gastoUtilizado });
            }
        }

        // Obtener los gastos hasta la fecha actual
        const gastos = await Bill.find({
            userId: userId,
            create_at: { $lt: new Date(currentYear, currentMonth, 1) }
        });
        const totalGastosHastaFechaActual = gastos.reduce((total, gasto) => total + gasto.valor, 0);

        res.status(200).json({
            status: 'success',
            consumosUltimos12Meses,
            totalGastosHastaFechaActual
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error al obtener los consumos de los últimos 12 meses',
            error: error.message
        });
    }
};

//generar end-point para obtener el detalle de lo que ga


module.exports = {
    obtenerTotalPorMesYAno,
    generarTotalGastos,
    obtenerConsumosUltimos12Meses
};
