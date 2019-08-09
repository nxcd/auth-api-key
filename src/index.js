const boom = require('boom')

const { scopes } = require('./scopes')

const SessionRepository = require('./infrastructure/repositories/Session')
const ServiceAccountRepository = require('./infrastructure/repositories/ServiceAccount')

const SessionService = require('./services/Session')
const ServiceAccountService = require('./services/ServiceAccount')

const factory = (mongodbConnection, redisConnection, scopesField = 'permissions') => {
  const sessionRepository = new SessionRepository(redisConnection, { })
  const serviceAccountRepository = new ServiceAccountRepository(mongodbConnection, {})

  const sessionService = new SessionService(sessionRepository)
  const serviceAccountService = new ServiceAccountService(serviceAccountRepository)

  const apiKey = async (req, _res, next) => {
    const [strategy, token] = req.headers['authorization'].split(' ')

    if (strategy !== 'ApiKey') {
      return next(boom.unauthorized('Unsupported strategy token', undefined, { code: 'unsupported_strategy_token' }))
    }

    const [key, secret] = token.split(':')

    const session = await sessionService.findByKeyAndSecret(key, secret)

    if (!session) {
      const serviceAccount = await serviceAccountService.findByKeyAndSecret(key, secret)

      if (!serviceAccount) {
        return next(boom.unauthorized('Invalid api-key', undefined, { code: 'invalid_api_key' }))
      }

      const scopes = serviceAccount[scopesField]

      await sessionService.create(key, secret, scopes.join(','))

      Object.defineProperty(req, 'user', {
        value: { id: key, strategy, token, scopes },
        writable: false
      })

      return next()
    }

    const scopes = session.split(',')

    Object.defineProperty(req, 'user', {
      value: { id: key, strategy, token, scopes },
      writable: false
    })

    next()
  }

  return {
    apiKey
  }
}

module.exports = { scopes, factory }
