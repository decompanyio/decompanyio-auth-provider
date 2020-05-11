/* eslint-disable prefer-destructuring */
// Config
const { config, utils } = require('serverless-authentication')

const cookieUtil = require('cookie')

// Providers
const facebook = require('serverless-authentication-facebook')
// const google = require('serverless-authentication-google')
const microsoft = require('serverless-authentication-microsoft')
// const crypto = require('crypto')
const customGoogle = require('../custom-google')
const polarishare = require('../polarishare')

// Common
const cache = require('../storage/cacheStorage')
const users = require('../storage/usersStorage')
const sessionStorage = require('../storage/sessionStorage')

const { createResponseData } = require('../utils/helpers')
const { getTokenSecret } = require('../utils/token')

let tokenSecret;
const SESSION_ID = process.env.SESSION_ID
/*
function createUserId(data, secret) {
  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(data)
  return hmac.digest('hex')
}
*/

/**
 * Error response
 * @param error
 */
function errorResponse(error, providerConfig) {
  const { url } = utils.errorResponse(error, providerConfig)
  return {
    statusCode: 302,
    headers: {
      Location: url
    }
  }
}

/**
 * Token response
 * @param data
 */
function tokenResponse(data, providerConfig) {
  const { url } = utils.tokenResponse(data, providerConfig)
  return {
    statusCode: 302,
    headers: {
      Location: url
    }
  }
}

/**
 * Handles the response
 * @param error
 * @param profile
 * @param state
 */
const handleResponse = async ({ profile, state, sessionId, provider }, providerConfig) => {
  let custom_redirect_url
  try {
    const { opts } = await cache.revokeState(state)
    const { returnUrl, redirectUrl } = opts?opts:{}
    // console.log('callback handleResponse', returnUrl, opts)
    const redirect_client_uris = providerConfig.redirect_client_uris?providerConfig.redirect_client_uris:[]
    if( redirectUrl && !redirect_client_uris.includes(redirectUrl) ){
      throw new Error(`redirect uri is not vaild : ${redirectUrl}`)
    }
    custom_redirect_url = redirectUrl;
 

    if(!tokenSecret){
      tokenSecret = await getTokenSecret(Buffer.from(providerConfig.token_secret, 'base64'))
    }
    
    const id = profile.id

    const data = createResponseData(id, providerConfig)

    const userContext = await users.saveUser(
      Object.assign(profile, { userId: id })
    )

    // saveUser can optionally return an authorizer context map
    // see http://docs.aws.amazon.com/apigateway/latest/developerguide/use-custom-authorizer.html
    if (typeof userContext === 'object' && !Array.isArray(userContext)) {
      data.authorizationToken.payload = Object.assign(
        data.authorizationToken.payload || {},
        userContext
      )
    }

    const result = await cache.saveRefreshToken(
      id,
      data.authorizationToken.payload
    )

    const expiredAt = Math.floor(Date.now() / 1000) + Number(providerConfig.expires_in || 15)
    // console.log(Math.floor(Date.now() / 1000), Number(providerConfig.expires_in || 15))
    let arg1 = Object.assign(data, { refreshToken: result, expiredAt, returnUrl })

    if (!arg1.returnUrl) {
      delete arg1.returnUrl
    }

    const tokenRes = tokenResponse(
      arg1,
      Object.assign(providerConfig, { token_secret: tokenSecret, custom_redirect_url: custom_redirect_url })
    )

    await sessionStorage.getSession(sessionId)
    .then( (s) => sessionStorage.setSession(sessionId, Object.assign(s, {
      userInfo: profile, 
      provider
    })))
    
    return tokenRes
  } catch (exception) {
    console.error(exception)
    return errorResponse({ error: exception }, Object.assign(providerConfig, { token_secret: tokenSecret, custom_redirect_url: custom_redirect_url }))
  }
}

/**
 * Callback Handler
 * @param proxyEvent
 * @param context
 */
async function callbackHandler(proxyEvent) {
  const event = {
    Cookie: cookieUtil.parse(proxyEvent.headers.Cookie),
    provider: proxyEvent.pathParameters.provider,
    stage: proxyEvent.requestContext.stage,
    host: proxyEvent.headers.Host,
    code: proxyEvent.queryStringParameters.code,
    state: proxyEvent.queryStringParameters.state,
    error: proxyEvent.queryStringParameters.error
  }
  const sessionId = event.Cookie?event.Cookie[SESSION_ID]:null
  const providerConfig = config(event)
  let response
  switch (event.provider) {
    case 'facebook':
      response = await facebook.callbackHandler(event, providerConfig)
      break
    case 'google':
      // response = await google.callbackHandler(event, providerConfig)
      response = await customGoogle.callbackHandler(event, providerConfig)
      break
    case 'microsoft':
      response = await microsoft.callbackHandler(event, providerConfig)
      break
    case 'custom-google':
      // See ./custom-google.js
      response = await customGoogle.callbackHandler(event, providerConfig)
      break
    case 'polarishare':
      // See ./polarishare.js
      response = await polarishare.callbackHandler(event, providerConfig)
      break
    default:
      return errorResponse({ error: 'Invalid provider' })
  }
  
  return handleResponse(Object.assign(response, { sessionId, provider: event.provider }), providerConfig)
}

module.exports = callbackHandler
