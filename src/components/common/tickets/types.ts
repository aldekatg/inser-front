export interface RowData {
  key: number
  name: string
  age: number
  address: string
  tags: string[]
}

export type MaterialItem = {
  nomenclature_name: string
  nomenclature_guid: string
  assignment_code: string
  quantity: number
}
export type TaskTab = { code: string; materials: MaterialItem[] }
