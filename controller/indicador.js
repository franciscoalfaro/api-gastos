//importar dependencias y modulos
const fs = require("fs")
const bcrypt = require("bcrypt")
const mongoosePagination = require('mongoose-paginate-v2')
const path = require("path")
const moment = require('moment');
// importar modelo
const Indicador = require("../models/indicador")
const cron = require('node-cron');
const fetch = require('node-fetch')




// acciones de prueba
const usd = async () => {
    try {
        const today = moment().format('YYYY-MM-DD');
        const yesterday = moment().subtract(1, 'day').format('YYYY-MM-DD');
        console.log('hoy', today);
        console.log('ayer', yesterday);
   
        const isWeekend = moment().isoWeekday() > 5;

        if (isWeekend) {
            console.log('Fin de semana, no se efectúan cargas de datos');
            return;
        }

        const url = `https://si3.bcentral.cl/SieteRestWS/SieteRestWS.ashx?user=franciscoalfar@gmail.com&pass=Tito2811&firstdate=${yesterday}&lastdate=${today}&timeseries=F073.TCO.PRE.Z.D&function=GetSeries`;

        const response = await fetch(url);
        const data = await response.json();
        console.log(data);

        const obsData = data.Series.Obs.map(obs => ({
            indexDateString: obs.indexDateString,
            value: obs.value,
            statusCode: obs.statusCode
        }));

        const indicador = new Indicador({
            descripEsp: data.Series.descripEsp,
            seriesId: data.Series.seriesId,
            Obs: obsData
        });

        await indicador.save();
        console.log('Datos guardados en la base de datos');
    } catch (error) {
        console.error('Error al actualizar los datos:', error);
        throw error; // Propaga el error para que pueda ser capturado por el cronjob
    }
};


cron.schedule('30 17  * * *', async () => {
    try {
        console.log('Ejecutando actualización de datos...');
        await usd();
        console.log('Tarea programada completada');
    } catch (error) {
        console.error('Error en la tarea programada:', error);
    }
}, {
    timezone: 'America/Santiago' // Configura la zona horaria a 'America/Santiago' para Chile
});


const dolarobservador = async (req, res) => {
    let page = 1;

    if (req.params.page) {
        page = parseInt(req.params.page);
    }

    const itemsPerPage = 4;

    const options = {
        page: page,
        limit: itemsPerPage,
        sort: { _id: -1 }
    };

    try {
        const indicadores = await Indicador.paginate({}, options);

        // Obtener fechas y valores únicos para hoy y ayer
        const dolarObsHoy = {};
        const dolarObsAyer = {};

        indicadores.docs.forEach(indicador => {
            indicador.Obs.forEach(obs => {
                const { indexDateString, value } = obs;
                if (!dolarObsHoy[indexDateString] && !dolarObsAyer[indexDateString]) {
                    if (indexDateString === moment().format('DD-MM-YYYY')) {
                        dolarObsHoy[indexDateString] = value;
                    } else if (indexDateString === moment().subtract(2, 'day').format('DD-MM-YYYY')) {
                        dolarObsAyer[indexDateString] = value;
                    }
                }
            });
        });

        return res.status(200).send({
            status: 'success',
            message: 'Valores del dólar observado de hoy y ayer',
            dolarObsHoy: dolarObsHoy,
            dolarObsAyer: dolarObsAyer
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            status: 'error',
            message: 'Error al obtener valores del dólar observado'
        });
    }
};


module.exports = {
    usd,
    dolarobservador
}
