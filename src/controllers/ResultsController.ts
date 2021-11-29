import { Request, Response } from 'express'
import fs from 'fs'
import path from 'path'
import csv from 'csv-parser'
import type { IEnergyCost } from '../models/EnergyCost'
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

interface IIrradiationResponse {
  lon: number
  lat: number
  city: string
  state: string
  annual: number
}

class ResultsController {
  async execute(request: Request, response: Response) {
    const { city, state, averageConsumption } = request.body

    if (!city || !state || !averageConsumption) {
      return response.status(404).json({ error: 'Lacks information.' })
    }

    const irradiationRef = db.collection('irradiation')
    const cityRef = await irradiationRef.limit(1).where('state', '==', state).where('city', '==', city).get()

    if (cityRef.empty) {
      return response.status(400).json({ message: 'city not found.' })
    }

    const cityData = cityRef.docs[0].data() as IIrradiationResponse
    const dailyIrradiation = cityData.annual / 365

    const energyCostsRef = await db.collection('energyCosts').doc(state).get()
    const cost = (energyCostsRef.data() as IEnergyCost).kwh

    // irradiação média diária * área do painel * eficiência do painel * 75% * 30
    const monthlyEnergyPerPanel = dailyIrradiation * 1.825 * 0.186 * 0.75 * 30

    const numberOfPanels = Math.trunc(averageConsumption / monthlyEnergyPerPanel)

    const initialCosts = numberOfPanels * 900
    const monthlyEnergySystem = numberOfPanels * monthlyEnergyPerPanel

    const payback = Math.round(initialCosts / (monthlyEnergySystem * cost))

    console.log(`nPanels: ${numberOfPanels}, payback: ${payback}`)
    await db.collection('results').add({
      numberOfPanels,
      payback
    })

    return response.status(200).json({ numberOfPanels, payback })
  }
}

export { ResultsController }
