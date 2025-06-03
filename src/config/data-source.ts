// import { DataSource } from 'typeorm'
// import { User } from '../entity/User'
// import { Config } from '.'

// export const AppDataSource = new DataSource({
//     type: 'postgres',
//     host: Config.DB_HOST,
//     port: Number(Config.DB_PORT),
//     username: Config.DB_USERNAME,
//     password: Config.DB_PASSWORD,
//     database: Config.DB_NAME,
//     synchronize: false,
//     logging: false,
//     entities: [User],
//     migrations: [],
//     subscribers: [],
// })

// src/config/data-source.ts
import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { User } from '../entity/User'

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'el shishir',
    database: process.env.NODE_ENV === 'test' ? 'pizza_test' : 'pizza',
    synchronize: true,
    logging: false,
    entities: [User],
    migrations: [],
    subscribers: [],
})
