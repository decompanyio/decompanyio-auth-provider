const { utils, config } = require('../authentication/serverless-authentication')

describe('es6 test', () => {
  describe('test', () => {
    beforeAll(() => {
    })

    it('test impliments urlBuilder', async () => {
      const url = utils.urlBuilder('https://www.google.co.kr', { q: 'decompany' })
      expect(url).toBe('https://www.google.co.kr?q=decompany')
    })
  })
})
