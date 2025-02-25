import request from 'supertest'
import app from '../../src/app'
describe('POST auth/register', () => {
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
        })
    })
    describe('fields are missing', () => {
        it('', () => {})
    })
})
