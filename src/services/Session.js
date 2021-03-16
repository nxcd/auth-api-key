'use strict'

class SessionService {
  constructor (repository) {
    this._repository = repository
  }

  async findByKeyAndSecret (key, secret) {
    const session = await this._repository.findByKeyAndSecret(key, secret)

    if (!session || session === 'undefined') {
      return null
    }

    return session
  }

  async create (key, secret, serviceAccount) {
    await this._repository.create(key, secret, serviceAccount)
  }
}

module.exports = SessionService
