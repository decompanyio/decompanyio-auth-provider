const { utils, config } = require('serverless-authentication')


describe('mongo cache test', () => {
  describe('init env', () => {
    beforeAll(() => {
      process.env.MONGODB_ENDPOINT = 'mongodb://localhost:27017/decompanyauth'
      process.env.CACHE_DB_NAME = 'local-authentication-cache'
    })

    it('createState', async () => {
      const mongoCache = require('../lib/storage/mongo/mongoCache')
      const state = await mongoCache.createState({test: true})
      process.env.SAVED_TOKEN = state
      console.log('createState', state)
    })

    it('revokeState', async () => {
      const mongoCache = require('../lib/storage/mongo/mongoCache')
      const savedToken = process.env.SAVED_TOKEN;
      console.log('saved token', savedToken)
      const result = await mongoCache.revokeState(savedToken)
      console.log('revokeState', result)
    })

    it('saveRefreshToken', async () => {
      const mongoCache = require('../lib/storage/mongo/mongoCache')
      const user = "testuser01"
      const payload = {}
      const refreshToken = await mongoCache.saveRefreshToken(user, payload)
      process.env.SAVED_REFRESH_TOKEN = refreshToken
      console.log('saveRefreshToken', refreshToken)
    })

    it('revokeRefreshToken', async () => {
      const mongoCache = require('../lib/storage/mongo/mongoCache')
      const oldToken = process.env.SAVED_REFRESH_TOKEN
      const result = await mongoCache.revokeRefreshToken(oldToken)
      console.log('revokeRefreshToken', result)
    })
  })
})
