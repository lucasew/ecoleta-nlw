import express, { response } from 'express';

import cfg from './config'

const app = express();

app.use(express.json())
// GET: Buscar
// POST: Criar
// PUT: Atualizar alguma coisa que já existe
// DELETE: Remover alguma coisa

var users: string[] = []

app.get('/users', (request, response) => {
    const search = request.query.search
    if (search && typeof search != 'string') {
        return response.status(400).json({error: 'bad request: only one search allowed'})
    }
    const ret = search ? users.filter(user => user.includes(search.toLowerCase())) : users
    response.json(users);
});

app.get('/users/:id', (request, response) => {
    const id = parseInt(request.params.id)
    if (isNaN(id)) {
        return response.status(400).json({error: 'bad request: id is not a number'})
    }
    if (users.length <= id || users.length == 0) {
        return response.status(404).json({error: 'user not found'})
    }
    const user = users[id]
    return response.json({
        data: user
    })
})

app.post('/users/:name', (request, response) => {
    if (request.params.name.length == 0) {
        return response.status(400).json({error: 'bad request'})
    }
    const id = users.push(request.params.name)
    response.status(200).json({data: {id: id - 1}})
})

app.use((request, reponse) => {
    return response.status(404).json({error: 'route not found'})
})
app.listen(cfg.port, () => console.log(`Running server at port ${cfg.port}. Make sure you are exporting the port properly ;)`))