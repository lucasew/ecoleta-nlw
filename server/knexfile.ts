import {resolve} from 'path'
import cfg from './src/config'

module.exports = {
    ...cfg.knex,
    migrations: {
        directory: resolve(__dirname, 'src', 'database', 'migrations')
    },
    seeds: {
        directory: resolve(__dirname, 'src', 'database', 'seeds')
    }
}