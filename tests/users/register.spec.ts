import request from 'supertest'
import app from '../../src/app'
import { DataSource } from 'typeorm'
import { AppDataSource } from '../../src/config/data-source'
import { User } from '../../src/entity/User'
import { Roles } from '../../src/constants'
import { isJwt } from '../utils/index'
import exp from 'constants'
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
                password: 'secret123',
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
                password: 'secret123',
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
                password: 'secret123',
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
            expect(users[0].password).not.toBe(userData.password)
            expect(users[0].role).toBe(userData.role)
        })
        it('should return user ID', async () => {
            const userData = {
                firstName: 'Rakesh',
                lastName: 'k',
                email: 'hello@gmail.com',
                password: 'secret123',
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
                password: 'secret123',
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

        it('should hash the password', async () => {
            const userData = {
                firstName: 'Rakesh',
                lastName: 'k',
                email: 'hello@gmail.com',
                password: 'secret123',
                role: 'customer',
            }
            await request(app).post('/auth/register').send(userData)
            const userRepository = connection.getRepository(User)
            const users = await userRepository.find()
            expect(users[0].password).not.toBe(userData.password)
            expect(users[0].password).toHaveLength(60)
            expect(users[0].password).toMatch(/^\$2[ayb]\$.{56}$/) // bcrypt hash format
        })

        it('should return 400 if email already exists', async () => {
            const userData = {
                firstName: 'Rakesh',
                lastName: 'k',
                email: 'hello@gmail.com',
                password: 'secret123',
            }
            const userRepository = connection.getRepository(User)
            await userRepository.save({ ...userData, role: Roles.CUSTOMER })
            const response = await request(app)
                .post('/auth/register')
                .send(userData)

            const users = await userRepository.find()

            expect(response.statusCode).toBe(400)
            expect(users).toHaveLength(1)
        })

        it('should return access token and refresh token inside the cookie', async () => {
            //Arrange
            const userData = {
                firstName: 'Shishir',
                lastName: 'Ghimire',
                email: 'shishirghimire123@gmail.com',
                password: 'secret123',
            }

            //Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData)

            interface Headers {
                ['set-cookie']: string[]
            }
            //Assert
            let accessToken: string | null = null
            let refreshToken: string | null = null

            const cookies =
                (response.headers as unknown as Headers)['set-cookie'] || []
            cookies.forEach((cookie) => {
                if (cookie.startsWith('accessToken=')) {
                    accessToken = cookie.split(';')[0].split('=')[1]
                }

                if (cookie.startsWith('refreshToken=')) {
                    refreshToken = cookie.split(';')[0].split('=')[1]
                }
            })

            expect(accessToken).not.toBeNull()
            expect(refreshToken).not.toBeNull()
            console.log(accessToken)
            expect(isJwt(accessToken)).toBeTruthy()
            expect(isJwt(refreshToken)).toBeTruthy()
        })
    })
    describe('fields are missing', () => {
        it('should return 400 status code if email field is missing', async () => {
            //Arrange
            const userData = {
                firstName: 'Rakesh',
                lastName: 'k',
                email: '',
                password: 'secret123',
            }
            const userRepository = connection.getRepository(User)
            const users = await userRepository.find()
            //Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData)
            //Assert
            expect(response.statusCode).toBe(400)
            expect(users).toHaveLength(0)
        })

        it('should return 400 status code if firstName is missing', async () => {
            const userData = {
                firstName: '',
                lastName: 'k',
                email: 'email@gmail.com',
                password: 'secret123',
            }

            const response = await request(app)
                .post('/auth/register')
                .send(userData)
            const userRepository = connection.getRepository(User)
            const users = await userRepository.find()
            expect(response.statusCode).toBe(400)
            expect(users).toHaveLength(0)
        })

        it('should return 400 status code if lastName is missing', async () => {
            const userData = {
                firstName: 'helllo',
                lastName: '',
                email: 'email@gmail.com',
                password: 'secret123',
            }

            const response = await request(app)
                .post('/auth/register')
                .send(userData)
            const userRepository = connection.getRepository(User)
            const users = await userRepository.find()
            expect(response.statusCode).toBe(400)
            expect(users).toHaveLength(0)
        })
        it('should return 400 status code if password is missing', async () => {
            const userData = {
                firstName: 'Shishir',
                lastName: 'k',
                email: 'email@gmail.com',
                password: '',
            }

            const response = await request(app)
                .post('/auth/register')
                .send(userData)
            const userRepository = connection.getRepository(User)
            const users = await userRepository.find()
            expect(response.statusCode).toBe(400)
            expect(users).toHaveLength(0)
        })
    })

    describe('Fields are not in proper format', () => {
        it('should trim the email field', async () => {
            const userData = {
                firstName: 'Hello',
                lastName: 'world',
                email: ' ggg12@gmail.com ',
                password: 'secret122',
                // no role sent
            }

            const response = await request(app)
                .post('/auth/register')
                .send(userData)

            expect(response.statusCode).toBe(201)

            const userRepository = connection.getRepository(User)
            const users = await userRepository.find()

            expect(users.length).toBeGreaterThan(0) // make sure user exists
            expect(users[0].email).toBe('ggg12@gmail.com') // trimmed email check
        })
        it('should return 400 status code if password is less than 8 characters', async () => {
            const userData = {
                firstName: 'Shishir',
                lastName: 'Ghimire',
                email: 'shortpass@gmail.com',
                password: 'short', // only 5 characters
                role: 'customer',
            }

            const response = await request(app)
                .post('/auth/register')
                .send(userData)

            const userRepository = connection.getRepository(User)
            const users = await userRepository.find()

            expect(response.statusCode).toBe(400)
            expect(users).toHaveLength(0)
        })
    })
})
