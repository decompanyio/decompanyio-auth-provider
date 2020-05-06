const { Provider, Profile } = require('serverless-authentication')
const sessionStorage = require('./storage/sessionStorage')
const helpers = require('./utils/helpers')
const REDIRECT_DOMAIN_NAME=process.env.REDIRECT_DOMAIN_NAME

const signinHandler = async (event, config, options) => {
  console.log('email-password signinHandler', JSON.stringify(event))
  const {Cookie} = event;
  const session = await sessionStorage.getSession(Cookie)
  console.log('session', JSON.stringify(session))
  if(session && session.isSigned) {
    // 인증이 되어 있으면
    const {redirect_uri, provider} = config
    const {state} = options
    return callback({
      redirect_uri, provider, state
    })
  } else {
    const signinOptions = {}
    return signin(signinOptions)
  }  
}

function signin(options) {

  console.log('redirect to sign-in')


  return {
    url: `http://${REDIRECT_DOMAIN_NAME}/authentication`
  }
}

function callback({redirect_uri, provider, state}) {
  console.log('redirect to callback', JSON.stringify({redirect_uri, provider, state}))

  const params = {
    state,
    provider
  }

  return {
    url: `${redirect_uri}?${helpers.urlParams(params)}`
  }
}

const callbackHandler = async (event, config) => {
  console.log('callbackHandler', event)
  const {Cookie} = event;
  const session = await sessionStorage.getSession(Cookie)
  const { state, provider } = event

  console.log('callbackHandler session', JSON.stringify(session))
  let profile = {}
  if(session && sessionStorage.isSignined(session)) {
    profile = new Profile({
      id: session.userId,
      name: '',
      email: session.email,
      picture: '',
      provider,
      at: ''
    })
  } 
  console.log('callbackHandler profile', typeof(profile), profile)
  return {
    profile,
    state,
  }
  
}

module.exports = {
  signinHandler,
  callbackHandler
}
