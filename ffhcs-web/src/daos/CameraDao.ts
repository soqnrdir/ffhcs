import Camera from '@entities/Camera'
import { knex } from '@daos/Instance'
import Debug from "debug"
const debug = Debug("ffhcs:cameras")
import short from 'short-uuid'
import { ICRUDRecord, ICRUDDao } from './CRUDDao'

class CameraDao implements ICRUDDao {

    /**
     * @param id
     */
    public async getOne(id: string): Promise<Camera | null> {
        return this.findOne('id', id)
    }

    /**
     * @param id
     */
    public async findOne(columnName: string, columnValue: string): Promise<Camera | null> {
        let cameras = await knex.select().from('cameras').where(columnName, columnValue)
        return cameras.length > 0 ? cameras[0] : null as any
    }

    /**
     * @param whereRaw
     */
     public async find(whereRaw: string): Promise<Camera[] | null> {
        return await knex.select().from('cameras').whereRaw(whereRaw)
    }

    /**
     *
     */
    public async getAll(): Promise<Camera[]> {
        let cameras = await knex.select().from('cameras')
        return cameras as any
    }


    /**
     *
     * @param camera
     */
    public async add(camera: ICRUDRecord): Promise<void> {
        if (!camera.id)
            camera.id = short.generate()
        let cameras = await knex('cameras').insert(camera)
        return camera as any
    }


    /**
     *
     * @param camera
     */
    public async update(camera: ICRUDRecord): Promise<void> {
        await knex('cameras').where('id', camera.id).update(camera)
        return {} as any
    }


    /**
     *
     * @param id
     */
    public async delete(id: string): Promise<void> {
        await knex('cameras').where('id',id).delete()
        return {} as any
    }
}

export default CameraDao
