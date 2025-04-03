import request from 'supertest'
import app from '../../src/app'
import { DataSource } from 'typeorm'
import { AppDataSource } from '../../src/config/data-source'
import { User } from '../../src/entity/User'
import truncateTables from '../utils/index'
import { Roles } from '../../src/constants'
describe('POST auth/register', () => {
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
    describe('given all feilds', () => {
        it('should return 201 status code', async () => {
            const userData = {
                firstName: 'Rakesh',
                lastName: 'k',
                email: 'hello@gmail.com',
                password: 'secret',
                role: 'customer',
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
                role: 'customer',
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
                role: 'customer',
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
            expect(users[0].role).toBe(userData.role)
        })
        it('should return user ID', async () => {
            const userData = {
                firstName: 'Rakesh',
                lastName: 'k',
                email: 'hello@gmail.com',
                password: 'secret',
                role: 'customer',
            }

            const response = await request(app)
                .post('/auth/register')
                .send(userData)

            expect(response.body.id).toBeDefined()
            expect(typeof response.body.id).toBe('number')
        })
        it('should assign a customer role', async () => {
            const userData = {
                firstName: 'Rakesh',
                lastName: 'k',
                email: 'hello@gmail.com',
                password: 'secret',
                role: 'customer',
            }

            const response = await request(app)
                .post('/auth/register')
                .send(userData)

            const userRepository = connection.getRepository(User)
            const users = await userRepository.find()
            expect(users[0]).toHaveProperty('role')
            expect(users[0].role).toBe(Roles.CUSTOMER)
        })
    })
    describe('fields are missing', () => {
        it('', () => {})
    })
})
