import { ICRUDRecord } from '@daos/CRUDDao'

class Playlog implements ICRUDRecord {

    public id: string
    public userId: string
    public cameraId: string
    public statusCode: number
    public startAt: Date
    public stopAt: Date | null

    constructor(playlog: null | Playlog) {
        if (playlog === null) {
            this.id = ''
            this.userId = ''
            this.cameraId = ''
            this.statusCode = 0
            this.startAt = new Date()
            this.stopAt = null
        } else {
            this.id = playlog.id
            this.userId = playlog.userId
            this.cameraId = playlog.cameraId
            this.statusCode = playlog.statusCode
            this.startAt = playlog.startAt
            this.stopAt = playlog.stopAt
        }
    }
}

export default Playlog
