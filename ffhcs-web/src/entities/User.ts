import { ICRUDRecord } from '@daos/CRUDDao'

class User implements ICRUDRecord {

    public id: string
    public createdAt: Date
    public userId: string
    public name: string
    public email: string
    public password?: string
    public division: string
    public phone: string
    public level: string
    public lastLogin: Date | null

    constructor(user: null | User) {
        if (user === null) {
            this.id = ''
            this.createdAt = new Date()
            this.userId = ''
            this.name = ''
            this.email = ''
            this.password = ''
            this.division = ''
            this.phone = ''
            this.level = ''
            this.lastLogin = null
        } else {
            this.id = user.id
            this.createdAt = user.createdAt
            this.userId = user.userId
            this.name = user.name
            this.email = user.email
            this.password = user.password
            this.division = user.division
            this.phone = user.phone
            this.level = user.level
            this.lastLogin = user.lastLogin
        }
    }
}

export default User
