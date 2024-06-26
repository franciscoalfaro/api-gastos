//importar modulos
const fs = require("fs")
const path = require("path")
const mongoosePagination = require('mongoose-paginate-v2')

//importar modelo
const User = require("../models/user")
const Category = require("../models/category")
const Bill = require("../models/bills")
const Saldo = require("../models/saldo")
const Total = require("../models/total")

//importar servicio
const validateGasto = require("../helpers/validateGasto")


//end-point para crear el gasto
const gasto = async (req, res) => {
    let params = req.body;
      
    if (!params.name || !params.description || !params.cantidad || !params.valor || !params.categoria || !params.fechagasto) {
      return res.status(400).json({
        status: "Error",
        message: "Faltan datos por enviar"
      });
    }
  
    try {
      const userId = req.user.id;
      const fechaGasto = new Date(params.fechagasto); // Convertir la fecha de string a objeto Date
      const gastoMes = fechaGasto.getMonth() + 1; // Obtener el mes del gasto
      const gastoAno = fechaGasto.getFullYear(); // Obtener el año del gasto
  
      validateGasto.validateGasto(params);
  
      let categoriaExistente = await Category.findOne({ userId, name: params.categoria });
  
      if (!categoriaExistente) {
        categoriaExistente = await Category.create({ userId, name: params.categoria });
      }
  
      const nuevoGasto = await Bill.create({
        userId: userId,
        name: params.name,
        description: params.description,
        cantidad: params.cantidad,
        valor: params.valor,
        fechagasto: params.fechagasto,
        categoria: categoriaExistente._id
      });
  
      const saldoUsuario = await Saldo.findOne({ userId: userId });
  
      if (saldoUsuario) {
        // Verificar si el saldo es del mes del gasto
        if (saldoUsuario.mes === gastoMes && saldoUsuario.ano === gastoAno) {
          saldoUsuario.montoMensual -= params.valor;
          await saldoUsuario.save();
        } else {
          // Si el saldo no es del mes del gasto, buscar y actualizar el saldo correspondiente al mes del gasto
          const saldoGastoMes = await Saldo.findOne({ userId: userId, mes: gastoMes, ano: gastoAno });
          if (saldoGastoMes) {
            saldoGastoMes.montoMensual -= params.valor;
            await saldoGastoMes.save();
          } else {
            // Si no existe el saldo para el mes del gasto, crear uno nuevo
            await Saldo.create({ userId: userId, mes: gastoMes, ano: gastoAno, montoMensual: -params.valor });
          }
        }
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
};
  


//end-point para actualizar gasto

const update = async (req, res) => {
    const { id } = req.params; // ID del gasto a actualizar
    const { name, description, cantidad, valor, categoria, fechagasto } = req.body; // Nuevos datos del gasto
  

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
        gastoExistente.fechagasto = fechagasto || gastoExistente.fechagasto
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

//listar los ultimos 30/10/5 gastos del mes en curso
const listarUltimosGastos = async (req, res) => {
    const userId = req.user.id; // ID del usuario obtenido del token
   
    let page = 1
    if (req.params.page) {
        page = req.params.page
    }
    let itemsPerPage = 5

    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    try {
        const options = {
            page: page,
            limit: itemsPerPage,
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
            page:gastos.page,
            
            
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


const listarUltimos5 = async (req, res) => {
    const userId = req.user.id;
    const { page = 1, limit = 5 } = req.query;

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

//generar end-point para obtener el detalle de lo que ga
const obtenerDetalleGastos = async (req, res) => {
    const userId = req.user.id;

    try {
        const fechaActual = new Date();
        const detalleGastos = [];

        // Obtener el detalle de gastos para los últimos 6 meses
        for (let i = 0; i < 6; i++) {
            const primerDiaMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth() - i, 1);
            const ultimoDiaMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth() - i + 1, 0);

            const gastosMes = await Bill.find({
                userId: userId,
                fechagasto: { $gte: primerDiaMes, $lte: ultimoDiaMes }
            });

            const total = await Total.findOne({
                userId: userId,
                mes: primerDiaMes.getMonth() + 1, // Mes está indexado desde 0, se suma 1 para igualar
                ano: primerDiaMes.getFullYear()
            });

            detalleGastos.push({
                mes: primerDiaMes.toLocaleString('es-ES', { month: 'long' }),
                ano: primerDiaMes.getFullYear(),
                totalGastos: gastosMes.reduce((total, gasto) => total + gasto.valor, 0),
                gastos: gastosMes,
                saldoInicial: total ? total.montoMensual : 0,
            });
        }

        return res.status(200).json({
            status: 'success',
            message: 'Detalle de gastos de los últimos 6 meses obtenido correctamente',
            detalleGastos
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al obtener el detalle de gastos de los últimos 6 meses',
            error: error.message
        });
    }
};


//gastos de react-native





module.exports = {
    gasto,
    update,
    remove,
    listarUltimosGastos,
    listarUltimos10,
    listarUltimos5,
    obtenerDetalleGastos
}