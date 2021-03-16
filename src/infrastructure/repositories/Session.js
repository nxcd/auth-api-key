'use strict'

class ServiceAccountRepository {
  constructor (redisConnection, { context = 'sessions', ttl = 15 }) {
    this._redisClient = redisConnection

    this._ttl = ttl
    this._context = context
  }

  async create (key, secret, serviceAccount) {
    return new Promise((resolve, reject) => {
      this._redisClient.set(`${this._context}:${key}:${secret}`, JSON.stringify(serviceAccount), 'EX', this._ttl, (err, reply) => {
        if (err) return reject(err)

        resolve(reply)
      })
    })
  }

  async findByKeyAndSecret (key, secret) {
    return new Promise((resolve, reject) => {
      this._redisClient.get(`${this._context}:${key}:${secret}`, (err, reply) => {
        if (err) return reject(err)

        resolve(JSON.parse(reply))
      })
    })
  }
}

module.exports = ServiceAccountRepository
