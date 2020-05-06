
process.env.REDIS_CACHE_ENDPOINT = 'localhost'
process.env.REDIS_CACHE_PORT=6379
process.env.REDIS_CACHE_DB=3


const { utils, config } = require('serverless-authentication')
const redisSession = require('../lib/storage/redis/redisSession')

describe('redis test', () => {
  describe('init env', () => {
    beforeAll(() => {

    })

    it('get empty', async () => {
           
      const result = await redisSession.get('test')
      expect(result).not.toBe("OK", "empty value")
      console.log('get empty', JSON.parse(result))
    })

    it('set', async () => {
           
      const result = await redisSession.set('test', JSON.stringify({id: 'test'}), 5)
      expect(result).toBe('OK')
      console.log('set', result)
    })

    
    it('TTL for waiting', async () => {
      
      await new Promise(resolve => setTimeout(resolve, 1000));

      const result = await redisSession.ttl('test')
      expect(result).toBe(4)
      console.log('TTL', result)
      
    })

    it('get', async () => {
      const result = await redisSession.get('test')
      expect(result).toBe(JSON.stringify({id: 'test'}))
      console.log('get', JSON.parse(result))
    })


    it('touch', async () => {
           
      const result = await redisSession.touch('test')

      console.log('touch', JSON.parse(result))
    })


    it('expire', async () => {
      const result = await redisSession.expire('test', 10)
      expect(result).toBe(1)
      console.log('expire', result)
    })


    it('TTL', async () => {
           
      const result = await redisSession.ttl('test')
      expect(result).toBe(10)
      console.log('TTL', result)
    })

    it('del', async () => {
           
      const result = await redisSession.del('test')
      expect(result).toBe(1)
      console.log('del', result)
    })

    it('get empty', async () => {
           
      const result = await redisSession.get('test')
      expect(result).not.toBe("OK", "empty value")
      console.log('get empty', JSON.parse(result))
    })

  })
})