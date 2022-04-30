export interface QuikSchedule {
  statusInRange?:
    | 'active'
    | 'inactive'
    | 'taking orders'
    | 'hidden'
    | 'using schedule'
  statusOutOfRange?:
    | 'active'
    | 'inactive'
    | 'taking orders'
    | 'hidden'
    | 'using schedule'
  initialTime?: string
  finalTime?: string
  initialDeliveryTime?: string
  finalDeliveryTime?: string | number
  deliveryFactor?: number
  onlyAllowMoto?: boolean
  allowFree?: boolean
}
