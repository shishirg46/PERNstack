import { checkSchema } from 'express-validator'

export default checkSchema({
    email: {
        in: ['body'],
        trim: true,
        isEmail: {
            errorMessage: 'Invalid email format',
        },
        notEmpty: {
            errorMessage: 'Email is required',
        },
        normalizeEmail: true,
    },
    password: {
        in: ['body'],
        notEmpty: {
            errorMessage: 'Password is required',
        },
    },
})
