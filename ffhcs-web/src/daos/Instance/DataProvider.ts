import Knex from 'knex'
import PostgresProvider from './PostgresProvider'
import Sqlite3Provider from './Sqlite3Provider'

export async function create (dbClient: string) : Promise<Knex> {
  if (dbClient === "sqlite3")
    return await Sqlite3Provider.create()
  else
    return await PostgresProvider.create()
}

export default {create}
