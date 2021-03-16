const boom = require('boom')
const { format } = require('util')
const isPathInScope = require('@nxcd/is-path-in-scope')

const scopes = (expected) => {
  if (Array.isArray(expected)) {
    return scopes(expected.join(', '))
  }

  return (req, _res, next) => {
    if (!req.serviceAccount || !req.serviceAccount.scopes || !req.serviceAccount.scopes.length) {
      return next(boom.unauthorized('authorization token is missing or has an invalid scope grant'))
    }

    if (!isPathInScope(expected, req.serviceAccount.scopes)) {
      const message = format('the following permissions are required: %s', expected)

      return next(boom.unauthorized(message, undefined, { code: 'insufficient_permissions' }))
    }

    next()
  }
}

module.exports = { scopes }
