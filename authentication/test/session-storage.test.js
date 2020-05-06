
process.env.REDIS_CACHE_ENDPOINT = 'localhost'
process.env.REDIS_CACHE_PORT=6379
process.env.REDIS_CACHE_DB=3
process.env.SESSION_ID="_PSSESSIONID"

const sessionStorage = require('../lib/storage/sessionStorage')
const redisSession = require('../lib/storage/redis/redisSession')

describe('redis test', () => {
  describe('init env', () => {
    beforeAll(() => {

    })
/*
    it('loop generate session id', async () => {
      
      const id = await sessionStorage.generateSessionId()
      await redisSession.set(id, JSON.stringify({id, created: Date.now()}))
      console.log('get session id', id, await redisSession.get(id))
      
      const id2 = await sessionStorage.generateSessionId()
      console.log('and session id', id2)
    })
*/

    it('get session with cookie', async () => {

      const result = await sessionStorage.getSession({
        headers: {
          Cookie: "_PSSESSIONID=test.session.key"
        }
      })

      console.log('get session', result)
    })

        
    it('get session no cookie', async () => {

      const result = await sessionStorage.getSession({})

      console.log('get session', result)
    })    

  })
})