import { Coordinates } from 'nesquik-types'

export interface User {
  addresses: Address[]
  birthdate?: any
  currentAddress: Address
  email: string

  lastName: string
  name: string
  nickname: string

  points: number
  pointsEarned: number
  pointsSpent: number

  status: 'active' | 'banned' | 'inactive' | 'invalid'
  stripeCustomerID?: string

  transactionsCompleted: number
  requestsCompleted: number

  lastRequestDate: Date
  lastLoginDate: Date

  userID?: string

  directory: ContactInfo[]
}

export type ContactInfo = {
  contactName: string
  serviceCode: string
  subServiceCode: string
  phoneNumber: string
}

export interface Address {
  name: string
  coordinates: Coordinates
  phoneNumber: string
  personName: string
  description: string
  addressReference: string
}
