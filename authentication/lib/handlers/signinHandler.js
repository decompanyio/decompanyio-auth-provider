// Config
const { config, utils } = require('serverless-authentication')
const cookieUtil = require('cookie')
// Providers
const facebook = require('serverless-authentication-facebook')
// const google = require('serverless-authentication-google')
const microsoft = require('serverless-authentication-microsoft')
const customGoogle = require('../custom-google')
const polarishare = require('../polarishare')

// Common
const cache = require('../storage/cacheStorage')
const helpers = require('../utils/helpers')
const responseUtils = require('../utils/responseUtils')
const sessionStorage = require('../storage/sessionStorage')

const SESSION_ID = process.env.SESSION_ID
/**
 * Signin Handler
 * @param proxyEvent
 * @param context
 */
async function signinHandler(proxyEvent) {
  console.log(JSON.stringify(proxyEvent))
  let event = {
    Authorization: proxyEvent.headers.Authorization,
    Cookie: cookieUtil.parse(proxyEvent.headers.Cookie?proxyEvent.headers.Cookie:''),
    provider: proxyEvent.pathParameters.provider,
    stage: proxyEvent.requestContext.stage,
    host: proxyEvent.headers.Host,
    redirectUrl: proxyEvent.queryStringParameters ? proxyEvent.queryStringParameters.redirectUrl : null,
    returnUrl: proxyEvent.queryStringParameters ? proxyEvent.queryStringParameters.returnUrl : null,
    prompt: proxyEvent.queryStringParameters ? proxyEvent.queryStringParameters.prompt : null,
    login_hint: proxyEvent.queryStringParameters ? proxyEvent.queryStringParameters.login_hint : null
  }
  //console.log('event', JSON.stringify(event))
  event = helpers.sanitize(event)
  
  const sessionId = event.Cookie?event.Cookie[SESSION_ID]:null
  const session = await sessionStorage.getSession(sessionId)
  console.log('signinHandler session', JSON.stringify(session))

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
        const { userInfo } = session;
        if(event.prompt && event.prompt === 'none' && userInfo.email){
          params.prompt = event.prompt
          params.login_hint = userInfo.email
        }
        console.log('event', JSON.stringify(event))
        console.log('google', JSON.stringify(session))
        console.log('google params', JSON.stringify(params)) 
        data = customGoogle.signinHandler(providerConfig, params)
        break
      case 'microsoft':
        data = microsoft.signinHandler(providerConfig, {
          scope: 'wl.basic wl.emails',
          state
        })
        break
      case 'polarishare':
          data = await polarishare.signinHandler(providerConfig, { state, sessionId })
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

  return responseUtils.createSessionCookieRedirectResponse(session, data.url)
}

module.exports = signinHandler
