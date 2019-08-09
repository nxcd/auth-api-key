'use strict'

const RedisClient = require('./redis')
const MongoClient = require('./mongodb')

const factory = async ({ mongodb: mongodbConfig, redis: redisConfig }) => {
  const redisConnection = await RedisClient.connect(redisConfig)
  const mongodbConnection = await MongoClient.connect(mongodbConfig)

  return { mongodbConnection, redisConnection }
}

module.exports = { factory }
