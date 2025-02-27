import request from 'supertest'
import app from '../../src/app'
import { DataSource } from 'typeorm'
import { AppDataSource } from '../../src/config/data-source'
import { User } from '../../src/entity/User'
import truncateTables from '../utils/index'
describe('POST auth/register', () => {
    let connection: DataSource

    beforeAll(async () => {
        connection = await AppDataSource.initialize()
    })

    beforeEach(async () => {
        // database truncate
        await truncateTables(connection)
    })

    afterAll(async () => {
        if (connection) {
            await connection.destroy() // ✅ Call destroy only if connection exists
        }
    })
    describe('given all feilds', () => {
        it('should return 201 status code', async () => {
            const userData = {
                firstName: 'Rakesh',
                lastName: 'k',
                email: 'hello@gmail.com',
                password: 'secret',
            }

            const response = await request(app)
                .post('/auth/register')
                .send(userData)

            expect(response.statusCode).toBe(201)
        })

        it('should return valis json response', async () => {
            const userData = {
                firstName: 'Rakesh',
                lastName: 'k',
                email: 'hello@gmail.com',
                password: 'secret',
            }

            const response = await request(app)
                .post('/auth/register')
                .send(userData)

            expect(
                (response.headers as Record<string, string>)['content-type'],
            ).toEqual(expect.stringContaining('json'))
        })

        it('should persist the user in the database', async () => {
            const userData = {
                firstName: 'Rakesh',
                lastName: 'k',
                email: 'hello@gmail.com',
                password: 'secret',
            }

            const response = await request(app)
                .post('/auth/register')
                .send(userData)

            const userRepository = connection.getRepository(User)
            const users = await userRepository.find()
            expect(users).toHaveLength(1)
            expect(users[0].firstName).toBe(userData.firstName)
            expect(users[0].lastName).toBe(userData.lastName)
            expect(users[0].email).toBe(userData.email)
            expect(users[0].password).toBe(userData.password)
        })
    })
    describe('fields are missing', () => {
        it('', () => {})
    })
})
