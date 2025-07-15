import { NextFunction, Response } from 'express'
import { RegisterUserRequest } from '../types'
import { UserService } from '../services/UserService'
import { Logger } from 'winston'
import { Roles } from '../constants'
import { validationResult } from 'express-validator'
import { JwtPayload } from 'jsonwebtoken'

import { AppDataSource } from '../config/data-source'
import { RefreshToken } from '../entity/RefreshToken'
import { TokenService } from '../services/TokenService'

export class AuthController {
    constructor(
        private userService: UserService,
        private logger: Logger,
        private tokenService: TokenService,
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

            const payload: JwtPayload = {
                sub: String(newUser.id),
                role: newUser.role,
            }

            const accessToken = this.tokenService.generateAccessToken(payload)

            //persist refresh token
            const RefreshTokenExpiryDate = (): Date => {
                const date = new Date()
                date.setFullYear(date.getFullYear() + 1) // auto-handles leap year
                return date
            }

            const refreshTokenRepo = AppDataSource.getRepository(RefreshToken)
            const newRefreshToken = refreshTokenRepo.save({
                user: newUser,
                expiresAt: RefreshTokenExpiryDate(),
            })

            // const refreshToken = sign(payload, Config.REFRESH_TOKEN_SECRET!, {
            //     algorithm: 'HS256',
            //     expiresIn: '1y',
            //     issuer: 'auth-service',
            //     jwtid: String((await newRefreshToken).id)
            // })

            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id: String((await newRefreshToken).id),
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
