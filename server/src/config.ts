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

const data_folder = getenv.string("DATA_FOLDER", "data")

let config =  {
    data_folder: data_folder,
    port: getenv.int("HTTP_PORT", 3001),
    knex: (() => {
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
}

export default config