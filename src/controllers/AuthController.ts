import fs from 'fs'
import { NextFunction, Response } from 'express'
import { RegisterUserRequest } from '../types'
import { UserService } from '../services/UserService'
import { Logger } from 'winston'
import { Roles } from '../constants'
import { validationResult } from 'express-validator'
import { JwtPayload, sign } from 'jsonwebtoken'
import path from 'path'
import createHttpError from 'http-errors'
import { Config } from '../config'

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
            let privateKey: Buffer
            try {
                privateKey = fs.readFileSync(
                    path.join(__dirname, '../../certs/private.pem'),
                )
            } catch (err) {
                const error = createHttpError(
                    500,
                    `Error while reading private key: ${(err as Error).message}`,
                )
                next(error)
                return
            }

            const payload: JwtPayload = {
                sub: String(newUser.id),
                role: newUser.role,
            }

            const accessToken = sign(payload, privateKey, {
                algorithm: 'RS256',
                expiresIn: '1hr',
                issuer: 'auth-service',
            })
            const refreshToken = sign(payload, Config.REFRESH_TOKEN_SECRET!, {
                algorithm: 'HS256',
                expiresIn: '1y',
                issuer: 'auth-service',
            })

            res.cookie('accessToken', accessToken, {
                domain: 'localhost',
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60, //1hr
                httpOnly: true, // very important
            })

            res.cookie('refreshToken', refreshToken, {
                domain: 'localhost',
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60 * 24 * 365, //1y
                httpOnly: true, // very important
            })
            res.status(201).json({ id: newUser.id })
        } catch (err) {
            next(err)
        }
    }
}
