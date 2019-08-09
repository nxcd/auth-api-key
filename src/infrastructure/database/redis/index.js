'use strict'

const redis = require('redis')

const connect = ({ uri }) => {
  const client = redis.createClient({ url: uri })

  return client
}

module.exports = { connect }
