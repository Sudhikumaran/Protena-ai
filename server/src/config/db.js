import mongoose from 'mongoose'

export async function connectDB(uri) {
  if (!uri) throw new Error('Missing MongoDB connection string')

  mongoose.set('strictQuery', true)

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 8000,
  })

  console.log('MongoDB connected')
}
