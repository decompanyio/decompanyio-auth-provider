const { Provider, Profile } = require('serverless-authentication')
const sessionStorage = require('./storage/sessionStorage')
const users = require('./storage/usersStorage')
const helpers = require('./utils/helpers')
const REDIRECT_DOMAIN_NAME=process.env.REDIRECT_DOMAIN_NAME
const SESSION_ID = process.env.SESSION_ID
const signinHandler = async (config, options) => {
  //console.log('email-password signinHandler', JSON.stringify(event))
  const {sessionId, state} = options;
  const session = await sessionStorage.getSession(sessionId)
  //console.log('session', JSON.stringify(session))
  if(session && session.isSigned) {
    // 인증이 되어 있으면
    const user = await users.getUser(session.userId)
    if(!user) {
      throw new Error(`user is not exists : ${session.userId}`)
    }
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
  const schema = helpers.getSchema()
  return {
    url: `${schema}://${REDIRECT_DOMAIN_NAME}/authentication`
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
  
  const { Cookie } = event;
  const session = await sessionStorage.getSession(Cookie?Cookie[SESSION_ID]:null)
  const { state, provider } = event

  let profile = {}
  if(session && sessionStorage.isSignined(session)) {
    profile = new Profile({
      id: session.userId,
      email: session.email,
      provider
    })
  } else {
    throw new Error('invaild Session Data')
  }

  const user = await users.getUser(session.userId)
  if(!user) {
    throw new Error(`user is not exists : ${session.userId}`)
  }

  return {
    profile,
    state,
  }
  
}


module.exports = {
  signinHandler,
  callbackHandler
}
