process.env.MONGODB_ENDPOINT = 'mongodb://localhost:27017/decompanyauth'
process.env.USERS_DB_NAME = 'auth-provider-users-local'


const processSignupHandler = require('../lib/handlers/processSignupHandler')

describe('test', () => {
  describe('init env', () => {
    beforeAll(() => {

    })

    it('get empty', async () => {
           
      const id = await processSignupHandler.createPSUserId()
      console.log('createPSUserId', id)
    })


  })
})