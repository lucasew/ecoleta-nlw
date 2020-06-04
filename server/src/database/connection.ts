import knex from 'knex'
import config from '../config'

const connection = knex(config.knex)

export default connection