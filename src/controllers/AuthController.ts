import { NextFunction, Response } from 'express'
import { RegisterUserRequest } from '../types'
import { UserService } from '../services/UserService'
import { Logger } from 'winston'
import { Roles } from '../constants'
import { validationResult } from 'express-validator'

export class AuthController {
    constructor(
        private userService: UserService,
        private logger: Logger,
    ) {}
    async register(
        req: RegisterUserRequest,
        res: Response,
        next: NextFunction,
    ) {
        const result = validationResult(req)
        if (!result.isEmpty()) {
            return next(
                Object.assign(new Error('Validation failed'), {
                    statusCode: 400,
                    errors: result.array(),
                }),
            )
        }

        const { firstName, lastName, email, password } = req.body
        this.logger.debug('new request to register a user', {
            firstName,
            lastName,
            email,
            password: '*****',
            role: Roles.CUSTOMER,
        })
        try {
            const newUser = await this.userService.create({
                firstName,
                lastName,
                email,
                password,
            })
            this.logger.info('User has been registered ', { id: newUser.id })
            res.status(201).json({ id: newUser.id })
        } catch (err) {
            next(err)
        }
    }
}
