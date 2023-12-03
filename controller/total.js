const Total = require('../models/total');
const Bill = require("../models/bills")
const Saldo = require("../models/saldo")

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


module.exports = {
    obtenerTotalPorMesYAno,
    generarTotalGastos
};
