'use strict'

const ObjectId = require('bson-objectid')

class ServiceAccountRepository {
  constructor (mongodbConnection, { collectionName = 'serviceAccounts', fields = {}, projection = 'state' }) {
    const {
      key = 'state.userId',
      secret = 'state.token',
      enabledCriteria = { 'state.deletedAt': null }
    } = fields

    this._keyField = key
    this._secretField = secret
    this._enabledCriteria = enabledCriteria
    this._projection = projection

    this._collection = mongodbConnection.collection(collectionName)
  }

  async findByKeyAndSecret (key, secret) {
    const query = {
      [this._keyField]: ObjectId.isValid(key) ? ObjectId(key) : key,
      [this._secretField]: secret,
      ...this._enabledCriteria
    }

    const serviceAccount = await this._collection.findOne(query, { projection: { [this._projection]: 1 } })

    if (!serviceAccount) {
      return null
    }

    return serviceAccount[this._projection]
  }
}

module.exports = ServiceAccountRepository
