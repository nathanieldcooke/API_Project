const { validationResult } = require("express-validator");


const handleValidationErros = (req, res, next) => {
    const validationErrors = validationResult(req);
    const errors = validationErrors.array().map((error) => error.msg);
    if (errors.length) {
        const err = Error("Bad request.");
        err.errors = errors;
        err.status = 400;
        err.title = "Bad request.";
        next(err);
    } else {
        next()
    }
}

module.exports = {
    handleValidationErros
}