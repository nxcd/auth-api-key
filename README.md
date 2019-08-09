# Expresso Auth Api-key

> Authentication Middleware for Expresso by api-key

## Summary

- [Expresso Auth](#expresso-auth-api-key)
  - [Summary](#summary)
  - [Basic Usage](#basic-usage)
    - [Connections](#Connections)
      - [Mongodb](#mongodb-connection-example)
      - [Redis](#redis-connection-example)
    - [Scope Field Name](#scope-field-name)
  - [Database Scopes](#database-scopes)

## Basic Usage

Install:

```sh
$ npm i @nxcd/auth-api-key
```

Import and use:

```js
const { app } = require('@expresso/app')
const server = require('@expresso/server')
const { factory: errors } = require('@expresso/errors')

// Import auth-api-key module
const { factory: apiKeyFactory, scopes } = require('auth-api-key')

const appFactory = app((app, config, environment) => {
  const { jwt, scope, types } = auth.factory(config)

  const { mongodbConnection, redisConnection } = await database.factory(config.database)

  const { apiKey } = apiKeyFactory(mongodbConnection, redisConnection, config.apiKey)

  app.get('/', apiKey, scopes('namespace:your-scope-a'), routeHandler)
})

const options = {
  name: 'myApp',
  apiKey: {
    scopesField: 'permissions',
    mongodbRepository: {
      collectionName: 'serviceAccounts',
      fields: {
        key: 'state.userId',
        secret: 'state.token',
        enabledCriteria: { 'state.deletedAt': null }
      },
      projection: 'state'
    },
    redisRepository: {
      context: 'sessions',
      ttl: 15 // seconds
    }
  }
}

server.start(appFactory, options)
```

### Connections

The mongodb connection and redis connection is required. The user and their permissions will be fetched from redis and if not found they will be fetched from mongodb and then sent to redis.

#### MongoDB connection example

```js
  const { MongoClient } = require('mongodb')

  const defaults = {
    poolSize: 10,
    useNewUrlParser: true
  }

  const connect = async ({ url, dbname, options = { } }) => {
    const client = await MongoClient.connect(url, { ...defaults, ...options })

    return client.db(dbname)
  }

  module.exports = { connect }
```

#### Redis connection example

```js
  const redis = require('redis')

  const connect = ({ uri }) => {
    const client = redis.createClient({ url: uri })

    return client
  }

  module.exports = { connect }
```

### Options

The auth api-key middleware takes option object as configuration. This object is as follows with default values:

```js
const apiKeyConfig = {
  scopesField: 'permissions',
  mongodbRepository: {
    collectionName: 'serviceAccounts',
    fields: {
      key: 'state.userId',
      secret: 'state.token',
      enabledCriteria: { 'state.deletedAt': null }
    },
    projection: 'state'
  },
  redisRepository: {
    context: 'sessions',
    ttl: 15 // seconds
  }
}
```

The `scopesField` gets the field name that has the enabled scopes from user in database, by default is "permissions". This field will be obtained from projection result.

The `mongodbRepository.enabledCriteria` receive an 'object' with a criteria to filter only fit users, for example excluding inactive users.

## Database Scopes

This middleware supports scopes. This means you can restrict your token to explicit permission levels using the `scopes` in database entity:

```json
{
  "name": "John Doe",
  "user": "johndoe",
  "passwordHash": "28dffbf8c249c638465005663d605b46dcd581bdfc5fd",
  "scopes": [ "namespace:your-scope-a", "namespace:your-scope-b" ]
}
```

The `scope` can be either a string or an Array. But it'll only validate if your determined scope is equal to the string or if it is included in the array.

> You can perform wildcard validation using the `*` keyword as long as your scope separator is `.`, for instance, `users.*` will match all the scopes within the `users` namespace, but `users:*` won't.

For more information see [is-path-in-scope](https://github.com/nxcd/is-path-in-scope).

