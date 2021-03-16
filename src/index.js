const boom = require('boom')

const { scopes } = require('./scopes')

const SessionRepository = require('./infrastructure/repositories/Session')
const ServiceAccountRepository = require('./infrastructure/repositories/ServiceAccount')

const SessionService = require('./services/Session')
const ServiceAccountService = require('./services/ServiceAccount')

const factory = (mongodbConnection, redisConnection, configs = {}) => {
  const {
    scopesField = 'permissions',
    sessionRepositoryConfig = {},
    serviceAccountRepositoryConfig = {},
    secretHashFn = (secret) => secret
  } = configs

  const sessionRepository = new SessionRepository(redisConnection, sessionRepositoryConfig)
  const serviceAccountRepository = new ServiceAccountRepository(mongodbConnection, serviceAccountRepositoryConfig)

  const sessionService = new SessionService(sessionRepository)
  const serviceAccountService = new ServiceAccountService(serviceAccountRepository)

  const apiKey = async (req, _res, next) => {
    if (!req.headers['authorization']) {
      return next(boom.unauthorized('Missing token', undefined, { code: 'missing_token' }))
    }

    const [strategy, token] = req.headers['authorization'].split(' ')

    if (!token) {
      return next(boom.unauthorized('Invalid authorization format. Expected: "Authorization: <STRATEGY> <TOKEN>"', undefined, { code: 'invalid_authorization_format' }))
    }

    if (strategy !== 'ApiKey') {
      return next(boom.unauthorized('Unsupported authorization strategy', undefined, { code: 'unsupported_strategy_token' }))
    }

    const [key, secret] = token.split(':')

    if (!secret) {
      return next(boom.unauthorized('Invalid token format', undefined, { code: 'invalid_token_format' }))
    }

    const secretHash = secretHashFn(secret)

    const serviceAccountSession = await sessionService.findByKeyAndSecret(key, secretHash)

    if (!serviceAccountSession) {
      const serviceAccount = await serviceAccountService.findByKeyAndSecret(key, secretHash)

      if (!serviceAccount) {
        return next(boom.unauthorized('Invalid api-key', undefined, { code: 'invalid_api_key' }))
      }

      const scopes = serviceAccount[scopesField]

      await sessionService.create(key, secretHash, serviceAccount)

      Object.defineProperty(req, 'serviceAccount', {
        value: {
          id: key,
          urn: `service-account:${key}`,
          strategy,
          token,
          scopes,
          data: { ...serviceAccount }
        },
        writable: false
      })

      return next()
    }

    const scopes = serviceAccountSession[scopesField]

    Object.defineProperty(req, 'serviceAccount', {
      value: {
        id: key,
        urn: `service-account:${key}`,
        strategy,
        token,
        scopes,
        data: { ...serviceAccountSession }
      },
      writable: false
    })

    next()
  }

  return {
    apiKey
  }
}

module.exports = { scopes, factory }
