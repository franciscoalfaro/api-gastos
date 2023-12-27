const Total = require('../models/total');
const Bill = require("../models/bills")
const Saldo = require("../models/saldo")


//obtener el total por mes y ano para el historico si lo desea el usuario
const obtenerTotalPorMesYAno = async (req, res) => {
    const usuarioId = req.user.id; // Suponiendo que tienes el ID del usuario en el token

    try {
        // Buscar el total utilizado por el usuario en el mes y año dados
        const totalUsuario = await Total.findOne({ userId: usuarioId});

        if (!totalUsuario) {
            return res.status(404).json({
                status: 'error',
                message: 'No se encontró el total utilizado para el usuario en el mes y año dados'
            });
        }

        return res.status(200).json({
            status: 'success',
            totalUsuario,
            monto_mensual:totalUsuario.montoMensual,
            monto_utilizado:totalUsuario.gastoUtilizado
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
    const userId = req.user.id;
  
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1; // Mes actual
      const currentYear = currentDate.getFullYear(); // Año actual
  
      let totalGastos = 0;
      let saldoInicial = null;
  
      // Recorrer desde enero hasta el mes actual para calcular los gastos
      for (let month = 1; month <= currentMonth; month++) {
        // Mostrar el mes actual en el console.log
        //console.log('Procesando el mes:', month);
  
        // Encontrar el saldo inicial del usuario para el mes y año actuales del bucle
        saldoInicial = await Total.findOne({ userId, mes: month, ano: currentYear });
  
        // Si no hay saldo inicial, se salta al siguiente mes
        if (!saldoInicial) continue;
  
        // Buscar los gastos asociados al usuario para el mes y año actuales del bucle
        const gastos = await Bill.find({
          userId: userId,
          fechagasto: { $gte: new Date(currentYear, month - 1, 1), $lt: new Date(currentYear, month, 1) }
        });
  
        // Si es el mes actual, calcular el total de gastos para este mes
        if (month === currentMonth) {
          totalGastos = gastos.reduce((total, gasto) => total + gasto.valor, 0);
        }
  
        // Calcular el total de gastos para este mes y sumarlo al total general
        const totalGastosMes = gastos.reduce((total, gasto) => total + gasto.valor, 0);
  
        // Actualizar el saldo inicial con el gasto utilizado para este mes
        saldoInicial.gastoUtilizado = totalGastosMes;
        await saldoInicial.save();
      }
  
      return res.status(200).json({
        status: 'success',
        message: 'Total de gastos generado correctamente',
        total: {
          saldoInicial: saldoInicial ? saldoInicial.montoMensual : 0,
          gastoUtilizado: totalGastos,
          saldoActual: (saldoInicial ? saldoInicial.montoMensual : 0) - totalGastos // Calcular el saldo actual
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
            fechagasto: { $lt: new Date(currentYear, currentMonth, 1) }
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


const listarGastosEntreFechas = async (req, res) => {
    const userId = req.user.id;
  
    // Obtener las fechas de inicio y fin desde la solicitud
    const { fechaInicio, fechaFin } = req.body;
      
    try {
      // Convertir las fechas de string a objetos Date
      const startDate = new Date(fechaInicio);
      const endDate = new Date(fechaFin);
  
      // Verificar si las fechas son válidas
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({
          status: 'error',
          message: 'Formato de fecha inválido. Se espera un formato válido.'
        });
      }
  
      // Buscar los gastos asociados al usuario entre las fechas dadas
      const gastos = await Bill.find({
        userId: userId,
        fechagasto: { $gte: startDate.toISOString(), $lte: endDate.toISOString() }
      }).populate('categoria');
  
      return res.status(200).json({
        status: 'success',
        message: 'Gastos encontrados correctamente entre las fechas',
        gastos: gastos
      });
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Error al buscar los gastos entre las fechas',
        error: error.message
      });
    }
  };
  
  




module.exports = {
    obtenerTotalPorMesYAno,
    generarTotalGastos,
    obtenerConsumosUltimos12Meses,
    listarGastosEntreFechas
};
