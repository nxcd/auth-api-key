'use strict'

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
