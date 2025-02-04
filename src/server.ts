import app from './app'
import { Config } from './config'
import logger from './config/logger'

const startServer = () => {
    const port = Config.PORT
    try {
        app.listen(port, () => {
            logger.info(`listening on port`, { port: port })
        })
    } catch (err) {
        console.log(err)
        process.exit(1)
    }
}

startServer()
