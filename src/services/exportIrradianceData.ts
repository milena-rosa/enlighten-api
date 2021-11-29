import csv from 'csv-parser'
import fs from 'fs'
import { api } from '../services/api'

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

export const populateIrradiationsCollection = () => {
  const results: IRecord[] = []

  fs.createReadStream('direct_normal_means.csv')
    .pipe(csv({ separator: ';' }))
    .on('data', async ({ id, lon, lat, name, state, annual }: IRecord) => {
      const data = { id, lon, lat, name, state, annual }
      results.push(data)
      await api.post('irradiations', data)
    })
    .on('end', () => {
      console.log(results)
    })
}
