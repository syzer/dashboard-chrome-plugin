import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { keys } from 'ramda'
import * as dotenv from 'dotenv'
import path from 'path';
import { Low, JSONFile } from 'lowdb'

const __dirname = dirname(fileURLToPath(import.meta.url));
const __filename = fileURLToPath(import.meta.url);

dotenv.config({ path: __dirname + '/' + '.env' })

// Use JSON file for storage
const file = join(process.env.chartDbDir, 'dbChart.json')
const adapter = new JSONFile(file)
const db = new Low(adapter)

// Read data from JSON file, this will set db.data content
await db.read()

db.data ||= { prod: {}, stage: {}, countsByApp: {} }

export default db

export const getToday = () =>
  new Date().toISOString().split('T')[0]

export const getDayFrom = (date) =>
  new Date(date).toISOString().split('T')[0]

export const upsertCountsByApp = (day, env) => async (countsByApp) => {
  db.data ||= { prod: {}, stage: {} }
  db.data[env][day || getToday()] = countsByApp || {}
  console.debug('saved charts in', file)
  db.write()
}
