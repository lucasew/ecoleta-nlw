import express, { request, response } from 'express';
import multer from 'multer'
import knex from '../database/connection'
import Router from 'express-promise-router' 
import {celebrate, Joi} from 'celebrate'

import {Item} from './items'
import {multerConfig, throwApiError} from '../config'

const upload = multer(multerConfig)

const routes = Router()

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

routes.post('/', 
    upload.single('image'), 
    celebrate({
        body: Joi.object().keys({
            name: Joi.string().required(),
            email: Joi.string().required().email(),
            whatsapp: Joi.number().required(),
            latitude: Joi.number().required(),
            longitude: Joi.number().required(),
            city: Joi.string().required(),
            uf: Joi.string().required().max(2),
            items: Joi.string().required() // validação interna
        })
    }),
    async (request, response) => {
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
    if (request.file === undefined) {
        await trx.rollback()
        throwApiError(400, "Invalid image or not found")
    }
    const imageURL = `static${request.file.path.slice(4)}`
    const data = {
        image: imageURL,
        name,
        email,
        whatsapp,
        latitude,
        longitude,
        city,
        uf
    }
    const itemIDs = String(items) ? items.split(',').map((n: string) => parseInt(n)) : []
    if (itemIDs.filter(isNaN).length > 0) {
        await trx.rollback()
        throwApiError(400, "invalid numbers passed for item ids")
    }

    let point_id = 0
    try {
        let id: number[] = await trx('points').insert(data)
        point_id = id[0]
    } catch (err) {
        await trx.rollback()
        throwApiError(400, err)
    }
    const point_items: {item_id: number, point_id: number}[] = itemIDs
        .map((item_id: number) => {
        return {
            item_id,
            point_id
        }
    })

    if (point_items.length === 0) {
        await trx.rollback()
        throwApiError(400, "um ponto de coleta precisa coletar alguma coisa")
    }
    try {
        await trx('point_items').insert(point_items)
    } catch (err) {
        await trx.rollback()
        throwApiError(500, err)
    }
    const expandedItems: any[] = await trx('items').select('*').whereIn('id', itemIDs)
    if (expandedItems.length == itemIDs.length) {
        await trx.commit()
        return response.json({
            id: point_id,
            ...data,
            items: expandedItems
        })
    }
    await trx.rollback()
    throwApiError(400, 'item_ids specified that not found in database')
})

routes.get('/:id', async (request, response) => {
    const {id} = request.params
    if (id === undefined) {
        // se bem que n faz grandes diferenças, o sv ja cai na rota do 404 se não especifica
        throwApiError(400, 'missing id in url')
    }
    const numId = parseInt(id)
    if (numId == NaN) {
        throwApiError(400, 'id is not a number')
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
        throwApiError(404, 'point not found')
    }
})

routes.get('/', async (request, response) => {
    const {city, uf, items} = request.query

    let normalizedItems: number[] = []
    if (items !== undefined) {
        let values = String(items)
            .split(',')
        if (!(values.length === 0 || values[0] === '')) {
            values.map(parseInt)
                .forEach(n => normalizedItems.push(n))
            if (normalizedItems.filter(isNaN).length > 0) {
                throwApiError(400, "invalid number specified for items")
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
        throwApiError(500, err)
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