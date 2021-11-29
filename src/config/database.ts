/* eslint-disable import/no-unresolved */
import { initializeApp, ServiceAccount, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

import serviceAccount from './enlighten-firebase.json'

initializeApp({
  credential: cert(serviceAccount as ServiceAccount)
})

const db = getFirestore()

export { db }
