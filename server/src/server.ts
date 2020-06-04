import express, { response } from 'express';
import morgan from 'morgan'
import cors from 'cors'

import routes from './routes'
import config from './config'

const app = express();

app.use(cors())
app.use(express.json())
app.use(morgan('tiny'))

app.use(routes)

// GET: Buscar
// POST: Criar
// PUT: Atualizar alguma coisa que já existe
// DELETE: Remover alguma coisa


app.listen(config.port, () => console.log(`Running server at port ${config.port}. Make sure you are exporting the port properly ;)`))