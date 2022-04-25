import User from '@entities/User'
import { knex } from '@daos/Instance'
import Debug from "debug"
const debug = Debug("ffhcs:dao")
import short from 'short-uuid'
import bcrypt from 'bcrypt'
import { ICRUDRecord, ICRUDDao } from './CRUDDao'

const saltRounds = 11

class UserDao implements ICRUDDao {

  /**
   * @param id
   */
  public async getOne(id: string): Promise<User | null> {
      let users = await knex.select().from('users').where('id', id)
      for (let record of users) {
        delete record.password
      }
      return users.length > 0 ? users[0] : null as any
  }

  public async findOne(columnName: string, columnValue: string): Promise<User | null> {
    let users = await knex.select().from('users').where(columnName, columnValue)
    for (let record of users) {
      delete record.password
    }
    return users.length > 0 ? users[0] : null as any
  }

  /**
   *
   */
  public async getAll(): Promise<User[]> {
    let users = await knex.select().from('users').orderBy('userId')
    for (let record of users) {
      delete record.password
    }
    return users as any
  }

  /**
   *
   * @param user
   */
  public async add(user: ICRUDRecord): Promise<void> {
    let count = await knex.count('id as numUsers').from('users')
    debug(`count=${JSON.stringify(count)}`)
    if (count[0]['numUsers'] >= 50) {
      throw '최대 사용자 용량이 초과됐습니다. '
    }
    if (!user.id)
        user.id = short.generate()
    let record = user as User
    if (record.hasOwnProperty('passwordChange')) {
      // 패스워드 변경 플래그 설정시에만 패스워드를 변경함
      if (record['passwordChange']) {
        if (record.password) {
          debug(`password adding: userId=${record.userId} password=${record.password}`)
          let salt = await bcrypt.genSalt(saltRounds)
          record.password = await bcrypt.hash(record.password, salt)
        } else {
          record.password = ''  // 빈 패스워드 설정
        }
      }
      // passwordChange는 없는 필드 임으로 제거해야 오류가 나지 않음
      delete record['passwordChange']
    } else {
    }
    let result = await knex('users').insert(record)
    return result as any
  }

  /**
   *
   * @param user
   */
  public async update(user: ICRUDRecord): Promise<void> {
    let record = user as User
    if (record.hasOwnProperty('passwordChange')) {
      // 패스워드 변경 플래그 설정시에만 패스워드를 변경함
      if (record['passwordChange']) {
        if (record.password) {
          debug(`password adding: userId=${record.userId} password=${record.password}`)
          let salt = await bcrypt.genSalt(saltRounds)
          record.password = await bcrypt.hash(record.password, salt)
        } else {
          record.password = ''  // 패스워드 제거
        }
      }
      // passwordChange는 없는 필드 임으로 제거해야 오류가 나지 않음
      delete record['passwordChange']
    } else {
      // 패스워드 변경 플래그가 설정되지 않은 경우는 password 필드를 업데이트 하지 않기 위해 필드를 제거함
      delete record.password
    }
    await knex('users').where('id', user.id).update(record)
    return {} as any
  }


  /**
   *
   * @param id
   */
  public async delete(id: string): Promise<void> {
    await knex('users').where('id',id).delete()
    return {} as any
  }

    
  /**
   * @param id
   */
  public async login(userId: string, password: string): Promise<User | null> {
    let users = await knex.select().from('users').where('userId', userId)
    if (users.length == 0) {
      debug(`user not found: userId=${userId}`)
      return null
    }
    let user = users[0]

    if (!password && !user.password) {
      debug(`login with no password: id=${userId}`)
      delete user.password
      return user
    } else {
      if (await bcrypt.compare(password, user.password)) {
          delete user.password
          return user
        }
        debug('password not matching:', userId, password)
      }
    return null
  }

  /**
   * @param id
   */
  public async password(id: string, password: string): Promise<User | null> {
    let users = await knex.select().from('users').where('id', id)
    if (users.length == 0) {
      debug(`user not found: id=${id}`)
      return null
    }

    let user = { id: id, password: ''}
    if (password) {
      let salt = await bcrypt.genSalt(saltRounds)
      password = await bcrypt.hash(password, salt)
    }

    user.password = password
    debug(`save password: id=${id} password=${password}`)
    return await knex('users').where('id', user.id).update(user)
  }

}

export default UserDao
