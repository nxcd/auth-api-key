'use strict'

class ServiceAccountService {
  constructor (repository) {
    this._repository = repository
  }

  async findByKeyAndSecret (key, secret) {
    const serviceAccount = await this._repository.findByKeyAndSecret(key, secret)

    if (!serviceAccount) {
      return null
    }

    return serviceAccount
  }
}

module.exports = ServiceAccountService
