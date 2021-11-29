import { Router } from 'express'
import { EnergyCostController } from './controllers/EnergyCostController'
import { IrradiationController } from './controllers/IrradiationController'
import { ResultsController } from './controllers/ResultsController'

const routes = Router()

routes.post('/irradiation', (request, response) => {
  const irradiationController = new IrradiationController()
  return irradiationController.execute(request, response)
})

routes.post('/usersInfo', (request, response) => {
  const resultsController = new ResultsController()
  return resultsController.execute(request, response)
})

routes.post('/energyCost', (request, response) => {
  const energyCostController = new EnergyCostController()
  return energyCostController.execute(request, response)
})

export { routes }
