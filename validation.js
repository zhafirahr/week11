const Joi = require('@hapi/joi');

const registerValidation = (data) => {
    const schema = Joi.object({
        Email: Joi.string().required().email(),
        Password: Joi.string().min(6).required()
    });

    return schema.validate(data);
}

const loginValidation = (data) => {
    const schema = Joi.object({
        Email: Joi.string().required().email(),
        Password: Joi.string().min(6).required()
    });

    return schema.validate(data);
}

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
