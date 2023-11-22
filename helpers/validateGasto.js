const validator = require("validator")

const validateGasto = (params) => {
    let name = !validator.isEmpty(params.name) &&
        validator.isLength(params.name, { min: 3, max: undefined }) &&
        validator.isAlpha(params.name, "es-ES")

    let description = !validator.isEmpty(params.description) &&
        validator.isLength(params.description, { min: 3, max: undefined })

    let cantidad = !validator.isEmpty(params.cantidad) &&
        validator.isNumeric(params.cantidad, { min: 1, max: undefined })

    let valor = !validator.isEmpty(params.valor) &&
        validator.isNumeric(params.valor, { min: 1, max: undefined })

    let categoria = !validator.isEmpty(params.categoria) &&
        validator.isLength(params.categoria, { min: 3, max: undefined }) &&
        validator.isAlpha(params.categoria, "es-ES")


    if (!name || !description || !cantidad || !valor || !categoria) {
        throw new Error("No se ha superado validacion")

    } else {
        console.log("validacion superada.")
    }
}

module.exports = {
    validateGasto

}