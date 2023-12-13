import { MongoClient } from 'mongodb'
import express, { Application, Request, Response } from 'express'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'
import cors from 'cors'
//Import Swagger UI and the generated Swagger documentation options.
import swaggerUi from 'swagger-ui-express'
import swaggerDocs from './docs' // Adjust the path as per our project structure
import routes from './routes'
import { DB } from './db/db'
dotenv.config()

const app: Application = express()

app.use(bodyParser.json())
const allowList: string[] = []
if (process.env.FRONTEND_ORIGIN) {
  allowList.push(
    process.env.FRONTEND_ORIGIN.lastIndexOf('/') ===
      process.env.FRONTEND_ORIGIN.length - 1
      ? process.env.FRONTEND_ORIGIN.slice(0, -1)
      : process.env.FRONTEND_ORIGIN,
  )
}
if (process.env.FRONTEND_ORIGIN !== 'http://localhost:3000/') {
  allowList.push('http://localhost:3000')
}
console.log(allowList)
app.use(
  cors({
    origin: allowList,
  }),
)
app.use(bodyParser.urlencoded({ extended: true }))

// Serve Swagger documentation at /swagger.json
app.get('/swagger.json', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json')
  res.send(swaggerDocs)
})

// Serve Swagger UI at /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs))

// Your existing API routes
app.use('/', routes)

const PORT = process.env.NODE_PORT || 8000
DB.connect()

app.listen(PORT, async () => {
  console.log(`Server is running on PORT http://localhost:${PORT}/`)
  const uri = process.env.MONGODB_URL
  console.log(uri)
  const client = new MongoClient(uri as string)
  try {
    await client.connect()
    const databasesList = await client.db().admin().listDatabases()

    console.log('Databases:')
    databasesList.databases.forEach((db) => console.log(` - ${db.name}`))
    await client.db('Citric').collection('Users').insertOne({
      name: 'test',
      email: 'test',
      password: 'test',
    })
  } catch (error) {
    console.error(error)
  } finally {
    await client.close()
  }
})
