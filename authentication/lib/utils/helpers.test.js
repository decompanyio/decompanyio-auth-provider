const helpers = require('./helpers')

describe('helpers', () => {
  /*
  it('should create response data', () => {
    const data = helpers.createResponseData('id')
    expect(data).toEqual({
      authorizationToken: { options: { expiresIn: 15 }, payload: { id: 'id' } }
    })
  })
  */

  it('test sanitize', () => {
    const event = {
      id: "test001",
      key: null,
      data: "",
      event: {
        id: "inner_test001",
        key: null,
        data: "",
        num: 1
      }
    }
    const data = helpers.sanitize(event)
    console.log(data)
    expect(data).toEqual({
      id: 'test001',
      event: {
        id: 'inner_test001', 
        num: 1 
      } 
    })
  })
})
