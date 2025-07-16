import { NextFunction, Response } from 'express'
import { RegisterUserRequest } from '../types'
import { UserService } from '../services/UserService'
import { Logger } from 'winston'
import { Roles } from '../constants'
import { validationResult } from 'express-validator'
import { JwtPayload } from 'jsonwebtoken'
import { TokenService } from '../services/TokenService'
import createHttpError from 'http-errors'
import { CredentialService } from '../services/CredentialService'

export class AuthController {
    constructor(
        private userService: UserService,
        private logger: Logger,
        private tokenService: TokenService,
        private credentialService: CredentialService,
    ) {}
    async register(
        req: RegisterUserRequest,
        res: Response,
        next: NextFunction,
    ) {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return next(
                createHttpError(400, 'Validation failed', {
                    errors: errors.array(),
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

            const newRefreshToken =
                await this.tokenService.persistRefreshToken(newUser)

            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id: String(newRefreshToken.id),
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

    async login(req: RegisterUserRequest, res: Response, next: NextFunction) {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return next(
                createHttpError(400, 'Validation failed', {
                    errors: errors.array(),
                }),
            )
        }

        const { email, password } = req.body
        this.logger.debug('new request to login a user', {
            email,
            password: '*****',
            role: Roles.CUSTOMER,
        })

        //check if email exist - done
        //compare password
        //generate tokens
        //add token to cookies
        //return the response

        try {
            const user = await this.userService.findByEmail(email)

            if (!user) {
                const error = createHttpError(401, 'invalid email or password')
                next(error)
                return
            }

            const passwordMatch = await this.credentialService.comparePassword(
                password,
                user.password,
            )

            if (!passwordMatch) {
                const error = createHttpError(401, 'invalid email or password')
                next(error)
                return
            }
            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            }
            const accessToken = this.tokenService.generateAccessToken(payload)

            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user)

            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id: String(newRefreshToken.id),
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
            res.status(201).json({ id: user.id })
        } catch (err) {
            console.log(err)
        }
    }
}
