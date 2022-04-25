import parseDbUrl from 'parse-database-url'
import dotenv from 'dotenv'
import Debug from "debug"
const debug = Debug("ffhcs:config")

dotenv.config()

/*
  * parse-database-url usage:
  parseDbUrl('sqlite3://./db.sqlite3') ==> 
  driver: 'sqlite3',
  user: 'api-user',
  password: 'api-user-password',
  filename: './db.sqlite3'
*/
export namespace Database {
  export const schema = 'api'
  export const url = process.env.DATABASE_URL || 'sqlite3://./db/ffhcs.db'
  export const config = parseDbUrl(url)
  export const {driver, user, password, hostname, host, port, database, filename} = config
  export const poolMin = Number(process.env.DATABASE_POOL_MIN || '0')
  export const poolMax = Number(process.env.DATABASE_POOL_MAX || '10')
  export const poolIdle = Number(process.env.DATABASE_POOL_IDLE || '10000')
}

export namespace Server {
  export const port = Number(process.env.PORT || '8000')
  export const bodyLimit = '100kb'
  export const corsHeaders = ['Link']
  export const isDev = process.env.NODE_ENV === 'development'
  export const datasetPath = process.env.DATASET_PATH || './dataset'
}

export namespace API {
  export const authSecret : string = process.env.AUTH_SECRET || "My.Secret.1234"
  export const authDisabled : boolean = parseInt(process.env.AUTH_DISABLED || '0') != 0
  export const VWorldApiKey : string = process.env.VWORLD_API_KEY || ''
  export const GISAddr : string = process.env.GIS_ADDR || ''
  export const GISUpdateInterval = parseInt(process.env.GIS_UPDATE_INTERVAL || '30')
  debug(`authDisabled=${authDisabled} AUTH_DISABLED=${process.env.AUTH_DISABLED}`)
}

export namespace VMS {
  export const servers = [
    { server: process.env.VMS_SERVER1, addr: process.env.VMS_ADDR1, id: process.env.VMS_ID1, password: process.env.VMS_PASSWORD1}
  ]
  debug(`VMS servers=${JSON.stringify(servers)}`)
  export const updateInterval = parseInt(process.env.VMS_UPDATE_INTERVAL || '120')
}

export namespace Knex {
  export const config = {
    client: Database.driver,
    connection: {
      host: process.env.DATABASE_HOSTNAME || Database.host,
      database: process.env.DATABASE_NAME || Database.database,
      user: process.env.DATABASE_USERNAME || Database.user,
      password: process.env.DATABASE_PASSWORD || Database.password,
      port: process.env.DATABASE_PORT || Database.port,
    },
    pool: {
      min: process.env.DATABASE_POOL_MIN,
      max: process.env.DATABASE_POOL_MAX,
      idle: process.env.DATABASE_POOL_IDLE,
    },
    migrations: {
      tableName: 'KnexMigrations',
    },
  }
}

export default {Database, Server, API, VMS, Knex}
