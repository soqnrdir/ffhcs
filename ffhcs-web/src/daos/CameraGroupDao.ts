import CameraGroup from '@entities/CameraGroup'
import { knex } from '@daos/Instance'
import Debug from "debug"
const debug = Debug("ffhcs:cameraGroups")
import short from 'short-uuid'
import { ICRUDRecord, ICRUDDao } from './CRUDDao'

class CameraGroupDao implements ICRUDDao {


    /**
     * @param id
     */
    public async getOne(id: string): Promise<CameraGroup | null> {
        return this.findOne('id', id)
    }

    /**
     * @param id
     */
    public async findOne(columnName: string, columnValue: string): Promise<CameraGroup | null> {
        let cameraGroups = await knex.select().from('cameraGroups').where(columnName, columnValue).orderBy('vmsGroupName')
        return cameraGroups.length > 0 ? cameraGroups[0] : null as any
    }

    /**
     * @param id
     */
    public async find(whereRaw: string): Promise<CameraGroup[] | null> {
        return await knex.select().from('cameraGroups').whereRaw(whereRaw)
    }

    /**
     *
     */
    public async getAll(): Promise<CameraGroup[]> {
        let cameraGroups = await knex.select().from('cameraGroups').orderBy('vmsGroupName')
        return cameraGroups as any
    }

    /**
     *
     * @param cameraGroup
     */
    public async add(cameraGroup: ICRUDRecord): Promise<void> {
        if (!cameraGroup.id)
            cameraGroup.id = short.generate()
        let result = await knex('cameraGroups').insert(cameraGroup)
        return result as any
    }


    /**
     *
     * @param cameraGroup
     */
    public async update(cameraGroup: ICRUDRecord): Promise<void> {
        await knex('cameraGroups').where('id', cameraGroup.id).update(cameraGroup)
        return {} as any
    }


    /**
     *
     * @param id
     */
    public async delete(id: string): Promise<void> {
        await knex('cameraGroups').where('id',id).delete()
        return {} as any
    }
}

export default CameraGroupDao
