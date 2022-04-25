import Admin from '@entities/Admin'
import { knex } from '@daos/Instance'
import Debug from "debug"
const debug = Debug("ffhcs:admins")
import short from 'short-uuid'
import bcrypt from 'bcrypt'
import { ICRUDRecord, ICRUDDao } from './CRUDDao'

const saltRounds = 11

class AdminDao implements ICRUDDao {

  /**
   * @param id
   */
  public async getOne(id: string): Promise<Admin | null> {
      let admins = await knex.select().from('admins').where('id', id)
      for (let record of admins) {
        delete record.password
      }
      return admins.length > 0 ? admins[0] : null as any
  }

  public async findOne(columnName: string, columnValue: string): Promise<Admin | null> {
    let admins = await knex.select().from('admins').where(columnName, columnValue)
    for (let record of admins) {
      delete record.password
    }
  return admins.length > 0 ? admins[0] : null as any
  }

  /**
   *
   */
  public async getAll(): Promise<Admin[]> {
      let admins = await knex.select().from('admins').orderBy('adminId')
      for (let record of admins) {
        delete record.password
      }
      return admins as any
  }

  /**
   *
   * @param admin
   */
  public async add(admin: ICRUDRecord): Promise<void> {
      if (!admin.id)
          admin.id = short.generate()
      let record = admin as Admin
      if (record.password) {
        debug(`password adding: adminId=${record.adminId} password=${record.password}`)
        let salt = await bcrypt.genSalt(saltRounds)
        record.password = await bcrypt.hash(record.password, salt)
      }
      await knex('admins').insert(record)
      return admin as any
  }

  /**
   *
   * @param admin
   */
  public async update(admin: ICRUDRecord): Promise<void> {
      let record = admin as Admin
      if (record.password) {
        debug(`password changing: adminId=${record.adminId} password=${record.password}`)
        let salt = await bcrypt.genSalt(saltRounds)
        record.password = await bcrypt.hash(record.password, salt)
      }
      await knex('admins').where('id', admin.id).update(admin)
      return {} as any
  }


  /**
   *
   * @param id
   */
  public async delete(id: string): Promise<void> {
    await knex('admins').where('id',id).delete()
    return {} as any
  }

    
  /**
   * @param id
   */
  public async login(adminId: string, password: string): Promise<Admin | null> {
    let admins = await knex.select().from('admins').where('adminId', adminId)
    if (admins.length == 0) {
      debug(`admin not found: adminId=${adminId}`)
      return null
    }
    let admin = admins[0]

    if (!password && !admin.password) {
      debug(`login with no password: id=${adminId}`)
      delete admin.password
      return admin
    } else {
      if (await bcrypt.compare(password, admin.password)) {
        delete admin.password
            return admin
        }
        debug('password not matching:', adminId, password)
      }
    return null
  }

  /**
   * @param id
   */
  public async password(id: string, password: string): Promise<Admin | null> {
    let admins = await knex.select().from('admins').where('id', id)
    if (admins.length == 0) {
      debug(`admin not found: id=${id}`)
      return null
    }

    let admin = { id: id, password: ''}
    if (password) {
      let salt = await bcrypt.genSalt(saltRounds)
      password = await bcrypt.hash(password, salt)
    }

    admin.password = password
    debug(`save password: id=${id} password=${password}`)
    return await knex('admins').where('id', admin.id).update(admin)
  }

}

export default AdminDao
