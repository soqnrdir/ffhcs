import Knex from 'knex'
import fs from 'fs'
import path from 'path'
import logger from '@shared/Logger'
import Debug from "debug"
const debug = Debug("ffhcs:daos")
import {Database} from '../../Config'
import short from 'short-uuid'

/**
 * Initialize a new Sqlite3 provider
 */
export async function create () {
  // create DB folder in case of not exist
  debug(`sqlite3: filename=${Database.filename}`)
  var dbDir = path.dirname(Database.filename)
  fs.mkdirSync(dbDir, { recursive: true })

  const knex = Knex({
    client: 'sqlite3',
    connection: {
      filename: Database.filename
    },
    useNullAsDefault: true
  })

  try {
    // Verify the connection before proceeding
    //await knex.raw('SELECT date("now")')

    if (!(await knex.schema.hasTable('cameraGroups'))) {
      debug("table creating: 'cameraGroups'")
      await knex.schema.createTable('cameraGroups', (table) => {
        table.uuid('id').notNullable().primary()
        table.dateTime('createdAt').notNullable()
        table.dateTime('removedAt')
        table.boolean('disabled').defaultTo(false)
        table.string('category').defaultTo('')
        table.string('vmsServer').notNullable()
        table.string('vmsGroupKey').notNullable()
        table.string('vmsGroupName').notNullable()
        table.integer('status').defaultTo(0)
        table.dateTime('onlineAt')
        table.dateTime('offlineAt')
        table.string('fcno')  // 헬기 호기
        table.unique(['vmsServer', 'vmsGroupKey'])
      })
    }

    if (!(await knex.schema.hasTable('cameras'))) {
      debug("table creating: 'cameras'")
      await knex.schema.createTable('cameras', (table) => {
        table.uuid('id').notNullable().primary()
        table.dateTime('createdAt').notNullable()
        table.dateTime('removedAt')
        table.integer('chType').defaultTo(0)      // 1: 계기판, 2: 승객(환자), 3: 전방, 4: 호이스트
        table.string('vmsKey').notNullable()
        table.boolean('vmsEnable').notNullable()
        table.string('vmsName').notNullable()
        table.string('vmsUrl1')
        table.string('vmsUrl2')
        table.uuid('cameraGroupId').notNullable()
        table.unique(['cameraGroupId', 'chType'])
        table.foreign('cameraGroupId').references('cameraGroups.id')
      })
    }

    if (!(await knex.schema.hasTable('users'))) {
      debug("table creating: 'users'")
      await knex.schema.createTable('users', (table) => {
        table.uuid('id').notNullable().primary()
        table.dateTime('createdAt').notNullable()
        table.string('userId').notNullable()
        table.string('name').notNullable()
        table.string('email').defaultTo('')
        table.string('password').defaultTo('')
        table.string('division').defaultTo('')
        table.string('phone').notNullable()
        table.string('level').defaultTo('')
        table.dateTime('lastLogin')
        table.unique(['userId'])
      })
      await knex('users').insert({ 
        id: short.generate(),
        createdAt: new Date(),
        userId: 'test1',
        name: '시험자',
        level: '',
        phone: '01012345678',
        })
    }
    if (!(await knex.schema.hasTable('admins'))) {
      debug("table creating: 'admins'")
      await knex.schema.createTable('admins', (table) => {
        table.uuid('id').notNullable().primary()
        table.string('adminId').notNullable()
        table.string('name').notNullable()
        table.string('email').defaultTo('')
        table.string('password').defaultTo('')
        table.string('phone').defaultTo('')
        table.string('level').defaultTo('')
        table.unique(['adminId'])
      })
      await knex('admins').insert({ 
        id: short.generate(),
        adminId: 'admin',
        name: '관리자',
        level: ''
        })
    }

    if (!(await knex.schema.hasTable('playlogs'))) {
      debug("table creating: 'playlogs'")
      await knex.schema.createTable('playlogs', (table) => {
        table.uuid('id').notNullable().primary()
        table.uuid('userId').notNullable()
        table.uuid('cameraId').notNullable()
        table.integer('statusCode').notNullable()
        table.dateTime('startAt').notNullable()
        table.dateTime('stopAt')
        table.index('startAt')
        table.foreign('userId').references('users.id')
        table.foreign('cameraId').references('cameras.id')
      })
    }

    return knex
  } catch (error) {
    logger.error('DB connect error:', error)
    throw new Error(`Unable to connect to sqlite3. ${error}`)
  }
}

export default {create}
