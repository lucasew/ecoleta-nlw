import express, {ErrorRequestHandler} from 'express';
import morgan from 'morgan'
import cors from 'cors'

import routes from './routes'
import config from './config'

const errorHandler: ErrorRequestHandler = function(err, request, response, next) {
    // console.log(require('util').inspect(err))
    let {status, message, stack, joi} = err
    if (joi) { // joi n é banco pra dar pau no servidor, só da erro quando é validação que n passa
        status = 400
    }
    console.log(`ERROR ${status} - ${message} \n ${stack}`)
    response.status(status || 500).json({
        error: message
    })
}

const app = express();

app.use(cors())
app.use(express.json())
app.use(morgan('tiny'))

app.use(routes)

// GET: Buscar
// POST: Criar
// PUT: Atualizar alguma coisa que já existe
// DELETE: Remover alguma coisa

// app.use(errors())

app.use(errorHandler)

app.listen(config.port, () => console.log(`Running server at port ${config.port}. Make sure you are exporting the port properly ;)`))