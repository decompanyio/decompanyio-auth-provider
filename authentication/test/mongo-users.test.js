const { utils, config } = require('serverless-authentication')


describe('mongo user test', () => {
  describe('init env', () => {
    beforeAll(() => {
      process.env.MONGODB_ENDPOINT = 'mongodb://localhost:27017/decompanyauth'
      process.env.USERS_DB_NAME = 'local-authentication-users'
    })

    it('saveUser', async () => {
      const mongoUser = require('../lib/storage/mongo/mongoUser')
      const profile = {
        id: 'ps-oauth2|'.concat('testuser01'),
        email: 'testuser01@polarishare.com',
        provider: 'ps-oauth2', 
      }
      const user = await mongoUser.saveUser(profile)

      console.log('saveUser', user)
    })

    it('getUser', async () => {
      const mongoUser = require('../lib/storage/mongo/mongoUser')
      const id = 'ps-oauth2|'.concat('testuser01')
      const result = await mongoUser.getUser(id)
      console.log('getUser', result)
    })

  })
})
