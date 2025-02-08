/*   */
import request from 'supertest'
import { sum } from './src/utils'
import app from './src/app'

describe('app', () => {
    it('should add', () => {
        const add = sum(1, 2)
        expect(add).toBe(3)
    })

    it('should return 200 ok status', async () => {
        const response = await request(app).get('/').send()
        expect(response.statusCode).toBe(200)
    })
})
