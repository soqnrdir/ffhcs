import { ICRUDRecord } from '@daos/CRUDDao'

class Admin implements ICRUDRecord {

    public id: string
    public adminId: string
    public name: string
    public email: string
    public password: string
    public phone: string
    public level: boolean

    constructor(admin: null | Admin) {
        if (admin === null) {
            this.id = ''
            this.adminId = ''
            this.name = ''
            this.email = ''
            this.phone = ''
            this.password = ''
            this.level = false
        } else {
            this.id = admin.id
            this.adminId = admin.adminId
            this.name = admin.name
            this.email = admin.email
            this.phone = admin.phone
            this.password = admin.password
            this.level = admin.level
        }
    }
}

export default Admin
