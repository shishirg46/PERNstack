import { AppDataSource } from './config/data-source'
import { User } from './entity/User'

AppDataSource.initialize()
    .then(async () => {
        console.log('Inserting a new user into the database...')
        const user = new User()
        user.firstName = 'Shishir'
        user.lastName = 'Ghimire'
        user.email = 'shishir@example.com'
        user.password = 'securepassword'
        user.role = 'customer'

        await AppDataSource.manager.save(user) // ✅ Now it works

        console.log('Saved a new user with id: ' + user.id)

        console.log('Loading users from the database...')
        const users = await AppDataSource.manager.find(User)
        console.log('Loaded users: ', users)

        console.log(
            'Here you can setup and run express / fastify / any other framework.',
        )
    })
    .catch((error) => console.log(error))
