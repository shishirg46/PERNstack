import app from './app'
import { Config } from './config'

const startServer = () => {
    const port = Config.PORT
    try {
        app.listen(port, () => {
            console.log(`listening on port ${port}`)
        })
    } catch (err) {
        console.log(err)
        process.exit(1)
    }
}

startServer()
