import express from 'express'
import knex from '../database/connection'

const routes = express.Router()

export interface Item {
    id: number,
    image: string,
    title: string
}

routes.get('', async (request, response) => {
    knex('items').select<Item[]>('*')
        .then(items => {
            return items.map(item => {
                return {
                ...item, 
                image: `/static/resources/items/${item.image}`
                }
            })
        })
        .catch((err) => response.status(500).send({error: err}))
        .then((items) => response.json({
            data: items
        }))
})

export default routes