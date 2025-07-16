import { Repository } from 'typeorm'
import { User } from '../entity/User'
import { UserData } from '../types'
import createHttpError from 'http-errors'
import { Roles } from '../constants'
import bcrypt from 'bcrypt'
export class UserService {
    constructor(private userRepository: Repository<User>) {}

    async create({ firstName, lastName, email, password }: UserData) {
        //hash the password before saving
        const saltOrRounds = 10
        const hashedPassword = await bcrypt.hash(password, saltOrRounds)

        // Check if the email already exists
        const existingUser = await this.userRepository.findOne({
            where: { email: email },
        })
        if (existingUser) {
            const err = createHttpError(
                400,
                'Email already exists, please use a different email',
            )
            throw err
        }

        try {
            const newUser = this.userRepository.create({
                firstName,
                lastName,
                email,
                password: hashedPassword,
                role: Roles.CUSTOMER,
            })

            return await this.userRepository.save(newUser)
        } catch (err) {
            console.error('Error creating user:', err) // Debugging

            // Ensure error is an instance of Error before using err.message
            if (err instanceof Error) {
                throw new createHttpError.InternalServerError(err.message)
            } else {
                throw new createHttpError.InternalServerError(
                    'Failed to store data in the database',
                )
            }
        }
    }

    async findByEmail(email: string) {
        return await this.userRepository.findOne({
            where: {
                email,
            },
        })
    }
}
