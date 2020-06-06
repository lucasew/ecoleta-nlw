import knex from '../database/connection'
import Router from 'express-promise-router' 

import config from '../config'

const routes = Router()

export interface Item {
    id: number,
    image: string,
    title: string
}

routes.get('/', async (request, response) => {
    await knex('items').select<Item[]>('*')
        .then(items => {
            return items.map(item => {
                return {
                ...item, 
                image: `/static/resources/items/${item.image}`
                }
            })
        })
        .catch((err) => config.throwApiError(500, err))
        .then((items) => response.json({
            data: items
        }))
})

export default routes