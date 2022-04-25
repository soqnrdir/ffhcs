import { ICRUDRecord } from '@daos/CRUDDao'

class Camera implements ICRUDRecord {
    public id: string
    public createdAt: Date
    public removedAt: Date | null
    public chType: number   // 채널 타입 => 1: 계기판, 2: 승객(환자), 3: 전방, 4: 호이스트
    public vmsKey: string
    public vmsEnable: boolean
    public vmsName: string
    public vmsUrl1: string
    public vmsUrl2: string
    public cameraGroupId: string

    constructor(camera: null | Camera) {
        if (camera === null) {
            this.id = ''
            this.createdAt = new Date()
            this.removedAt = null
            this.chType = 0
            this.vmsKey = ''
            this.vmsEnable = false
            this.vmsName = ''
            this.vmsUrl1 = ''
            this.vmsUrl2 = ''
            this.cameraGroupId = ''
        } else {
            this.id = camera.id
            this.createdAt = camera.createdAt
            this.removedAt = camera.removedAt
            this.chType = camera.chType
            this.vmsKey = camera.vmsKey
            this.vmsEnable = camera.vmsEnable
            this.vmsName = camera.vmsName
            this.vmsUrl1 = camera.vmsUrl1
            this.vmsUrl2 = camera.vmsUrl2
            this.cameraGroupId = camera.cameraGroupId
        }
    }
}

export default Camera
