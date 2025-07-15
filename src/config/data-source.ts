import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { User } from '../entity/User'
import dotenv from 'dotenv'
import { RefreshToken } from '../entity/RefreshToken'

dotenv.config()

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: String(process.env.DB_PASSWORD),
    database: process.env.NODE_ENV === 'test' ? 'pizza_test' : 'pizza',
    synchronize: false,
    logging: false,
    entities: [User, RefreshToken],
    migrations: [],
    subscribers: [],
})
