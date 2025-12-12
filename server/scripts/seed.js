import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { connectDB } from '../src/config/db.js'
import Athlete from '../src/models/Athlete.js'
import { createBaseAthlete } from '../src/data/baseAthlete.js'

dotenv.config()
const jordanVega = createBaseAthlete()

async function seed() {
  try {
    await connectDB(process.env.MONGODB_URI)
    await Athlete.deleteMany({})
    const doc = await Athlete.create(jordanVega)
    console.log(`Seeded athlete ${doc.profile.name} (${doc.id})`)
    await mongoose.connection.close()
    process.exit(0)
  } catch (error) {
    console.error('Seed failed', error)
    process.exit(1)
  }
}

seed()
