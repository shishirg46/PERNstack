import { JwtPayload, sign } from 'jsonwebtoken'
import fs from 'fs'
import createHttpError from 'http-errors'
import path from 'path'
import { Config } from '../config'
import { User } from '../entity/User'
import { RefreshToken } from '../entity/RefreshToken'
import { Repository } from 'typeorm'

export class TokenService {
    constructor(private refreshTokenRepo: Repository<RefreshToken>) {}

    generateAccessToken(payload: JwtPayload) {
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
            throw error
        }
        const accessToken = sign(payload, privateKey, {
            algorithm: 'RS256',
            expiresIn: '1h',
            issuer: 'auth-service',
        })
        return accessToken
    }

    generateRefreshToken(payload: JwtPayload) {
        const refreshToken = sign(payload, Config.REFRESH_TOKEN_SECRET!, {
            algorithm: 'HS256',
            expiresIn: '1y',
            issuer: 'auth-service',
            jwtid: String(payload.id),
        })
        return refreshToken
    }

    async persistRefreshToken(newUser: User) {
        const RefreshTokenExpiryDate = (): Date => {
            const date = new Date()
            date.setFullYear(date.getFullYear() + 1) // auto-handles leap year
            return date
        }

        const newRefreshToken = await this.refreshTokenRepo.save({
            user: newUser,
            expiresAt: RefreshTokenExpiryDate(),
        })

        return newRefreshToken
    }
}
