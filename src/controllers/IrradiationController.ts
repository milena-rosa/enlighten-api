import { Request, Response } from 'express'
import fs from 'fs'
import path from 'path'
import csv from 'csv-parser'

import { db } from '../config/database'

interface IRecord {
  id: string
  lon: number
  lat: number
  name: string
  class?: string
  state: string
  annual: number
  jan?: number
  feb?: number
  mar?: number
  apr?: number
  may?: number
  jun?: number
  jul?: number
  aug?: number
  sep?: number
  oct?: number
  nov?: number
  dec?: number
}

class IrradiationController {
  execute(request: Request, response: Response) {
    // const { state } = request.params
    const results: IRecord[] = []

    fs.createReadStream(path.resolve(__dirname, '..', 'direct_normal_means.csv'))
      .pipe(csv({ separator: ';', mapHeaders: ({ header }) => header.toLowerCase() }))
      .on('data', async (data) => {
        results.push(data)
      })
      .on('end', async () => {
        // const dataToBeSaved = results.filter((result) => result.state === state)
        let count = 0
        let index = 0

        while (index < results.length) {
          const batch = db.batch()

          while (count < 500) {
            const irradiationRef = db.collection('irradiation').doc()
            const data = results[index]

            if (results[index]) {
              batch.set(irradiationRef, {
                lon: Number(data.lon),
                lat: Number(data.lat),
                city: data.name,
                state: data.state,
                annual: Number(data.annual)
              })
            }
            count++
            index++
          }

          await batch.commit()
          count = 0
        }
      })

    return response.status(201).send()
  }
}

export { IrradiationController }
