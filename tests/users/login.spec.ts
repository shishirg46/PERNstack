import { DataSource } from 'typeorm'
import { AppDataSource } from '../../src/config/data-source'
import { User } from '../../src/entity/User'
import request from 'supertest'
import app from '../../src/app'
import bcrypt from 'bcrypt'

describe('POST /auth/login', () => {
    let connection: DataSource

    beforeAll(async () => {
        connection = await AppDataSource.initialize()
    })

    beforeEach(async () => {
        // database truncate
        await connection.dropDatabase()
        await connection.synchronize()
    })

    afterAll(async () => {
        if (connection) {
            await connection.destroy() // ✅ Call destroy only if connection exists
        }
    })

    describe('Given all fields', () => {
        it('should return 401 if email does not exist', async () => {
            const response = await request(app).post('/auth/login').send({
                email: 'nonexistent@example.com',
                password: 'irrelevant',
            })

            expect(response.statusCode).toBe(401)
            expect(response.body).toHaveProperty('errors')
            expect(Array.isArray(response.body.errors)).toBe(true)
            expect(response.body.errors[0].msg.toLowerCase()).toMatch(
                /invalid email or password/i,
            )
        })

        it('should return 401 if password does not match', async () => {
            const password = 'CorrectPassword123'
            const wrongPassword = 'WrongPassword123'

            const hashedPassword = await bcrypt.hash(password, 10)

            const user = connection.getRepository(User).create({
                firstName: 'Shishir',
                lastName: 'Ghimire',
                email: 'wrong@test.com',
                password: hashedPassword,
                role: 'customer',
            })
            await connection.getRepository(User).save(user)

            const response = await request(app).post('/auth/login').send({
                email: 'wrong@test.com',
                password: wrongPassword, // wrong one
            })
            console.log('Response:', response.statusCode)

            expect(response.body.errors[0].msg.toLowerCase()).toMatch(
                /invalid email or password/i,
            )
        })
    })
})
