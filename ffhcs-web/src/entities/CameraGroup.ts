import { ICRUDRecord } from '@daos/CRUDDao'

class CameraGroup implements ICRUDRecord {
    public id: string
    public createdAt: Date
    public removedAt: Date | null
    public disabled: boolean
    public category: string
    public vmsServer: string
    public vmsGroupKey: string
    public vmsGroupName: string
    public status: number   // 0: Unknown, 1: Online, 2: Offline
    public onlineAt: Date | null
    public offlineAt: Date | null
    public fcno: string

    constructor(cameraGroup: null | CameraGroup) {
        if (cameraGroup === null) {
            this.id = ''
            this.createdAt = new Date()
            this.removedAt = null
            this.disabled = false
            this.category = ''
            this.vmsServer = ''
            this.vmsGroupKey = ''
            this.vmsGroupName = ''
            this.status = 0
            this.onlineAt = null
            this.offlineAt = null
            this.fcno = ''
        } else {
            this.id = cameraGroup.id
            this.createdAt = cameraGroup.createdAt
            this.removedAt = null
            this.disabled = cameraGroup.disabled
            this.category = cameraGroup.category
            this.vmsServer = cameraGroup.vmsServer
            this.vmsGroupKey = cameraGroup.vmsGroupKey
            this.vmsGroupName = cameraGroup.vmsGroupName
            this.status = cameraGroup.status
            this.onlineAt = cameraGroup.onlineAt
            this.offlineAt = cameraGroup.offlineAt
            this.fcno = cameraGroup.fcno
        }
    }
}

export default CameraGroup
