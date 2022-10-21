import { join, dirname } from 'path'
import { Low, JSONFile } from 'lowdb'
import { fileURLToPath } from 'url'
import { keys } from 'ramda'

const __dirname = dirname(fileURLToPath(import.meta.url));

// Use JSON file for storage
const file = join(__dirname, './data/db.json')
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
  db.data ||= { prod: {}, stage: {}, countsByApp: {
    prod: {}, stage: {}
  }}
  db.data.countsByApp = {
    prod: {},
    stage: {},
    ...db.data.countsByApp,
  }
  db.data.countsByApp[env][day || getToday()] = countsByApp
}
