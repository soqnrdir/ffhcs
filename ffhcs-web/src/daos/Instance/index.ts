import DataProvider from './DataProvider'
import Knex from 'knex'

export var knex : Knex

export async function openDatabase(dbClient: string) {
  knex = await DataProvider.create(dbClient)
  return knex
}
