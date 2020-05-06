// Config
const { config, utils } = require('serverless-authentication')
const cookieUtil = require('cookie')
// Providers
const facebook = require('serverless-authentication-facebook')
// const google = require('serverless-authentication-google')
const microsoft = require('serverless-authentication-microsoft')
const customGoogle = require('../custom-google')
const emailPassword = require('../email-password')

// Common
const cache = require('../storage/cacheStorage')
const helpers = require('../utils/helpers')

/**
 * Signin Handler
 * @param proxyEvent
 * @param context
 */
async function signinHandler(proxyEvent) {
  let event = {
    Authorization: proxyEvent.headers.Authorization,
    Cookie: cookieUtil.parse(proxyEvent.headers.Cookie),
    provider: proxyEvent.pathParameters.provider,
    stage: proxyEvent.requestContext.stage,
    host: proxyEvent.headers.Host,
    redirectUrl: proxyEvent.queryStringParameters ? proxyEvent.queryStringParameters.redirectUrl : null,
    returnUrl: proxyEvent.queryStringParameters ? proxyEvent.queryStringParameters.returnUrl : null,
    prompt: proxyEvent.queryStringParameters ? proxyEvent.queryStringParameters.prompt : null,
    login_hint: proxyEvent.queryStringParameters ? proxyEvent.queryStringParameters.login_hint : null
  }
  console.log('event', JSON.stringify(event))
  event = helpers.sanitize(event)

  const providerConfig = config(event)
  let data
  try {
    const state = await cache.createState({
      returnUrl: event.returnUrl,
      prompt: event.prompt,
      login_hint: event.login_hint,
      redirectUrl: event.redirectUrl
    })

    switch (event.provider) {
      case 'facebook':
        data = facebook.signinHandler(providerConfig, {
          scope: 'email',
          state
        })
        break
      case 'google':
        const params = { state }
        if(event.prompt){
            params.prompt = event.prompt
        }
        if(event.login_hint) {
            params.login_hint = event.login_hint
        }
        data = customGoogle.signinHandler(providerConfig, params)
        break
      case 'microsoft':
        data = microsoft.signinHandler(providerConfig, {
          scope: 'wl.basic wl.emails',
          state
        })
        break
      case 'email':
          data = await emailPassword.signinHandler(event, providerConfig, { state })
          console.log('signin result', JSON.stringify(data))
          break
      default:
        data = utils.errorResponse(
          { error: `Invalid provider: ${event.provider}` },
          providerConfig
        )

    }
  } catch (exception) {
    console.error(exception)
    data = utils.errorResponse({ exception }, providerConfig)
  }

  console.log('signin result', JSON.stringify(data))
  return {
    statusCode: 302,
    headers: {
      Location: data.url
    }
  }
}

module.exports = signinHandler
