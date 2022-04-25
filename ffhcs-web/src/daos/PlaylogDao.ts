import Playlog from '@entities/Playlog'
import { knex } from '@daos/Instance'
import Debug from "debug"
const debug = Debug("ffhcs:playlogs")
import short from 'short-uuid'
import { ICRUDRecord, ICRUDDao } from './CRUDDao'

class PlaylogDao implements ICRUDDao {

    /**
     * @param id
     */
    public async getOne(id: string): Promise<Playlog | null> {
        return this.findOne('id', id)
    }

    /**
     * @param id
     */
    public async findOne(columnName: string, columnValue: string): Promise<Playlog | null> {
        let playlogs = await knex.select().from('playlogs').where(columnName, columnValue)
        return playlogs.length > 0 ? playlogs[0] : null as any
    }

    /**
     * @param whereRaw
     */
     public async find(whereRaw: string): Promise<Playlog[] | null> {
        return await knex.select().from('playlogs').whereRaw(whereRaw)
    }

    /**
     *
     */
    public async getAll(): Promise<Playlog[]> {
        let playlogs = await knex.select().from('playlogs')
        return playlogs as any
    }


    /**
     *
     * @param playlog
     */
    public async add(playlog: ICRUDRecord): Promise<void> {
        if (!playlog.id)
            playlog.id = short.generate()
        let result = await knex('playlogs').insert(playlog)
        return result as any
    }


    /**
     *
     * @param playlog
     */
    public async update(playlog: ICRUDRecord): Promise<void> {
        await knex('playlogs').where('id', playlog.id).update(playlog)
        return {} as any
    }


    /**
     *
     * @param id
     */
    public async delete(id: string): Promise<void> {
        await knex('playlogs').where('id',id).delete()
        return {} as any
    }

    public async rawQuery(sqlQuery: string): Promise<Object[] | null> {
        return await knex.raw(sqlQuery)
    }
}

export default PlaylogDao
