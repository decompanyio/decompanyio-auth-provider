const { utils, config } = require('serverless-authentication')

describe('token_secret test', () => {
  describe('encrypt', () => {
    beforeAll(() => {
      
    })

    it('test impliments urlBuilder', async () => {
      const url = utils.urlBuilder('https://www.google.co.kr', { q: 'decompany' })
      expect(url).toBe('https://www.google.co.kr?q=decompany')
    })
  })
})
