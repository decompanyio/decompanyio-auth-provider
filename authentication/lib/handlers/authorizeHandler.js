// Config
const { config, utils } = require('serverless-authentication')

const { getTokenSecret } = require('../utils/token')

let TOKEN_SECRET = null
const policyContext = (data) => {
  const context = {}
  Object.keys(data).forEach((k) => {
    if (k !== 'id' && [ 'boolean', 'number', 'string' ].indexOf(typeof data[k]) !== -1) {
      context[k] = data[k]
    }
  })
  return context
}

// Authorize
const authorize = async (event) => {
  const stage = event.methodArn.split('/')[1] || 'dev' // @todo better implementation
  let error = null
  let policy
  const { authorizationToken } = event
  if (authorizationToken) {
    try {
      // this example uses simple expiration time validation
      const providerConfig = config({ provider: '', stage })

      if (!TOKEN_SECRET) {
        TOKEN_SECRET = await getTokenSecret(Buffer.from(providerConfig.token_secret, 'base64'))
      }
      const data = utils.readToken(authorizationToken, TOKEN_SECRET)

      policy = utils.generatePolicy(data.id, 'Allow', event.methodArn)
      policy.context = policyContext(data)
    } catch (err) {
      console.error(err)
      error = 'Unauthorized'
    }
  } else {
    console.error('Authorization is nothing!!')
    error = 'Unauthorized'
  }
  if (error) {
    throw new Error(error)
  }
  return Promise.resolve(policy)
}


module.exports = authorize
