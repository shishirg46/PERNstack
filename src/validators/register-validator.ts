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
    firstName: {
        in: ['body'],
        notEmpty: {
            errorMessage: 'First name is required',
        },
        trim: true,
    },
    lastName: {
        in: ['body'],
        notEmpty: {
            errorMessage: 'Last name is required',
        },
        trim: true,
    },
    password: {
        in: ['body'],
        notEmpty: {
            errorMessage: 'Password is required',
        },
        isLength: {
            options: { min: 8 },
            errorMessage: 'Password must be at least 8 characters long',
        },
    },
})
