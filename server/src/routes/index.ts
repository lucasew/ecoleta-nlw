import express from 'express'
import {resolve} from 'path'
import Router from 'express-promise-router' 

import config from '../config'
import api_items from './items'
import api_points from './points'

const router = Router()
// data serve route
router.use('/static/resources', express.static(resolve(config.data_folder, 'resources')))


const apiRouter = express.Router()
// routes api here
apiRouter.use('/items', api_items)
apiRouter.use('/points', api_points)


router.use('/api', apiRouter)


// default route, let it be the last
router.use((request, response) => {
    throw config.throwApiError(404, 'route not found')
})

export default router