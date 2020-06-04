import express, { request, response } from 'express';
import knex from '../database/connection'
import {Item} from './items'
import { parse } from 'dotenv/types';
import { string } from 'getenv';
const routes = express.Router()

export interface Point {
    id: number,
    image: string,
    name: string,
    email: string,
    whatsapp: string,
    city: string,
    uf: string,
    latitude: number,
    longitude: number
}

routes.post('', async (request, response) => {
    const trx = await knex.transaction()
    const {
        name,
        email,
        whatsapp,
        latitude,
        longitude,
        city,
        uf,
        items
    } = request.body

    const data = {
        image: "https://s2.glbimg.com/vmo9jpOdJ51CkO8NMtjPK5RNIHg=/512x320/smart/e.glbimg.com/og/ed/f/original/2018/10/11/como-gastar-menos-no-mercado.jpg",
        name,
        email,
        whatsapp,
        latitude,
        longitude,
        city,
        uf
    }
    let point_id = 0
    try {
        let id: number[] = await trx('points').insert(data)
        point_id = id[0]
    } catch (err) {
        trx.rollback()
        return response.status(400).json({
            error: `bad request: ${err}`
        })
    }
    const point_items: any[] = items ? items.map((item_id: number) => {
        return {
            item_id,
            point_id
        }
    }) : []

    if (point_items.length === 0) {
        trx.rollback()
        return response.status(400).json({
            error: 'bad request: um ponto de coleta precisa coletar alguma coisa'
        })
    }
    try {
        await trx('point_items').insert(point_items)
    } catch (err) {
        trx.rollback()
        return response.status(500).json({
            error: `internal server error: ${err}`
        })
    }
    const expandedItems: any[] = await trx('items').select('*').whereIn('id', items)
    if (expandedItems.length == items.length) {
        trx.commit()
        return response.json({
            id: point_id,
            ...data,
            items: expandedItems
        })
    }
    trx.rollback()
    return response.status(400).json({
        error: 'bad request: item_ids specified that not found in database'
    })
})

routes.get('/:id', async (request, response) => {
    const {id} = request.params
    if (id === undefined) {
        return response.status(400).json({
            error: 'bad request: missing id in url'
        })
    }
    const numId = parseInt(id)
    if (numId == NaN) {
        return response.status(400).json({
            error: 'bad request: id is not a number'
        })
    }
    let point = await knex<Point>('points').select('*').where('id', id).first()
    if (point) {
        const items: Item[] = await knex<Item>('items')
            .join('point_items', 'items.id', '=', 'point_items.item_id')
            .where('point_items.point_id', point.id)
            .select('items.title', 'items.image')
        return response.json({
            data: {
                ...point,
                items
            }
        })
    } else {
        return response.status(404).json({
            error: 'point not found'
        })
    }
})

routes.get('', async (request, response) => {
    const {city, uf, items} = request.query

    let normalizedItems: number[] = []
    if (items !== undefined) {
        let values = String(items)
            .split(',')
        if (!(values.length === 0 || values[0] === '')) {
            values.map(parseInt)
                .forEach(n => normalizedItems.push(n))
            if (normalizedItems.filter(isNaN).length > 0) {
                return response.status(400).json({
                    error: `bad request: invalid number specified for items`
                })
            }
        }
    }
    let query = knex<Point>('points')
        .join('point_items', 'points.id', '=', 'point_items.point_id')
    if (normalizedItems.length > 0) {
        query = query.whereIn('point_items.item_id', normalizedItems)
    }
    if (city) {
        query = query.where('points.city', 'like', `%${city as string}%`)
    }    
    if (uf) {
        query = query.where('points.uf', 'like', `%${uf as string}%`)
    }
    let points: Point[] = []
    try {
        points = await query.distinct()
            .select('points.*')
    } catch (err) {
        return response.status(500).json({
            error: `internal server error: ${err}`
        })
    }

    let processedPoints = Promise.all(points.map(async point => {
        return {
            ...point,
            items: await knex<Item>('items')
                .join('point_items', 'items.id', '=', 'point_items.item_id')
                .where('point_items.point_id', point.id)
                .select('items.title', 'items.image')
        }
    }))

    return response.json({
        data: await processedPoints
    })
})
export default routes