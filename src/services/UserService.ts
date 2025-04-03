import { Repository } from 'typeorm'
import { User } from '../entity/User'
import { UserData } from '../types'
import createHttpError from 'http-errors'

export class UserService {
    constructor(private userRepository: Repository<User>) {}

    async create({ firstName, lastName, email, password }: UserData) {
        try {
            const newUser = this.userRepository.create({
                firstName,
                lastName,
                email,
                password,
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
}
