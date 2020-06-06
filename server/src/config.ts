import multer from 'multer'
import {createHash} from 'crypto'

import getenv from 'getenv';
import {resolve} from 'path'

import dotenv from 'dotenv'
dotenv.config()

function getenv_path(key: string, fallback: string): string {
    let value = getenv.string(key, fallback)
    let separated: string[] = []
    value.split('/').map(part => part.split('\\').forEach((part) => separated.push(part)))
    return resolve(...separated)
}

export const data_folder = getenv.string("DATA_FOLDER", "data")
export const port = getenv.int("HTTP_PORT", 3001)
export const knex = (() => {
    const client = getenv.string('KNEX_CLIENT', 'sqlite3')
    const connection = ((client: string) => {
        if (client === 'sqlite3') {
            return {
                filename: getenv_path('KNEX_SQLITE_FILENAME', `${data_folder}/database.db`),
            }
        }
        throw new Error("undefined database backend config")
    })(client)
    return {
        client, 
        connection, 
        useNullAsDefault: true
    }
})()
export const multerConfig: multer.Options = {
    fileFilter(request, file, cb) {
        if (file.mimetype.startsWith('image')) {
            if (file.mimetype.endsWith('jpeg')) {
                return cb(null, true)
            }
            if (file.mimetype.endsWith('png')) {
                return cb(null, true)
            }
        }
        return cb(null, false)
    },
    storage: multer.diskStorage({
        destination: `${data_folder}/resources/uploads`,
        filename (request, file, callback) {
            const data = JSON.stringify(request.body)
            const hash = createHash('sha1').update(data).digest('hex')
            const extension = file.mimetype.split('/')[1]
            callback(null, `${hash}.${extension}`)
        }
    })
}

export function throwApiError(status: number, message: string) {
    throw {
        status,
        message
    }
}

export default {
    data_folder,
    port,
    knex,
    multerConfig,
    throwApiError
}