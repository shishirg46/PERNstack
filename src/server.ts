import app from './app'
import { Config } from './config'
import { AppDataSource } from './config/data-source'
import logger from './config/logger'

const startServer = async () => {
    const port = Config.PORT
    try {
        await AppDataSource.initialize()
        logger.info('Database connected successfully')
        app.listen(port, () => {
            logger.info(`listening on port`, { port: port })
        })
    } catch (err: unknown) {
        if (err instanceof Error) {
            logger.error(err.message)
            setTimeout(() => {
                process.exit(1)
            }, 1000)
        }
    }
}

void startServer()
