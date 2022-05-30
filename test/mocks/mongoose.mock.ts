import { Model } from 'mongoose'

export type ModelMockType = Omit<Model<any>, 'collection'> & {
  collection: any[]
  [key: string]: any
}

export const ModelMock = (docs: any[]): Partial<ModelMockType> => {
  const collection = docs.map((item) => ({
    ...item,
    update: jest.fn(),
    updateOne: jest.fn(),
    save: jest.fn(),
    toJSON: () => item,
  }))

  const doc = {
    ...collection[0],
    populate: jest.fn().mockReturnThis(),
  }

  return {
    collection,
    doc,
    find: jest.fn().mockReturnValue(collection),
    create: jest.fn().mockImplementation((item) => item),
    findById: jest
      .fn()
      .mockImplementation((id) => (doc.id === id ? doc : null)),
    findOne: jest.fn().mockReturnValue(doc),
    deleteMany: jest.fn(),
  }
}
