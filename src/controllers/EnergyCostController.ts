import { Request, Response } from 'express'
import fs from 'fs'
import path from 'path'
import csv from 'csv-parser'
import { db } from '../config/database'

interface IEnergyCost {
  state: string
  cost: string
}

class EnergyCostController {
  execute(request: Request, response: Response) {
    const results: IEnergyCost[] = []

    fs.createReadStream(path.resolve(__dirname, '..', 'energy_costs.csv'))
      .pipe(csv({ separator: ';', mapHeaders: ({ header }) => header.toLowerCase() }))
      .on('data', async (data) => {
        results.push(data)
      })
      .on('end', async () => {
        const batch = db.batch()
        for (const data of results) {
          const energyCostRef = db.collection('energyCosts').doc(data.state)
          batch.set(energyCostRef, {
            kwh: Number(data.cost)
          })
        }
        await batch.commit()
      })

    return response.status(200).send()
  }
}

export { EnergyCostController }
