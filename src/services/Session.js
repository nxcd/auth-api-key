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

  async create (key, secret, scopes) {
    await this._repository.create(key, secret, scopes)
  }
}

module.exports = SessionService
