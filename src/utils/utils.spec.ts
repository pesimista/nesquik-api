import * as types from './quik-types'
import { SchemaOptions } from './schemas/schemas-options'

describe('Utils', () => {
  it('should test types/index', () => {
    expect(types).toBeDefined()
  })

  it('should test schemas/options', () => {
    const transform = SchemaOptions.toJSON.transform as (
      doc: any,
      ret: any,
      options?: any
    ) => any

    const data = {
      _id: 'someid',
      value: 'name',
    }
    transform(null, data)

    expect(SchemaOptions.timestamps).toBe(true)
    expect(SchemaOptions.toJSON.virtuals).toBe(true)
    expect(SchemaOptions.toJSON.versionKey).toBe(false)
    expect(data).toEqual({ value: 'name' })
  })
})
