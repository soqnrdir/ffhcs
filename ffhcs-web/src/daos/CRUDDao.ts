
export interface ICRUDRecord {
  id: string
}

export interface ICRUDDao {
  getOne: (id: string) => Promise<ICRUDRecord | null>
  findOne: (columnName: string, columnValue: string) => Promise<ICRUDRecord | null>
  getAll: () => Promise<ICRUDRecord[]>
  add: (record: ICRUDRecord) => Promise<void>
  update: (record: ICRUDRecord) => Promise<void>
  delete: (id: string) => Promise<void>
}
