const { Provider, Profile } = require('serverless-authentication')

const signinHandler = (config, options) => {
  const customGoogle = new Provider(config)
  const signinOptions = options || {}
  signinOptions.signin_uri = 'https://accounts.google.com/o/oauth2/v2/auth'
  signinOptions.scope = 'openid profile email'
  signinOptions.response_type = 'code'
  // signinOptions.response_type = 'token'
  // signinOptions.access_type = 'offline'
  return customGoogle.signin(signinOptions)
}

const callbackHandler = async (event, config) => {

  if (event.error) {
    console.log("error event", JSON.stringify(event))
    throw new Error(event.error)
  }

  const customGoogle = new Provider(config)
  const profileMap = (response) => {
    const id = response.resourceName.split('/')[1]
    if (response.error) {
      throw new Error(JSON.stringify(response.error))
    }

    return new Profile({
      id: 'google-oauth2|'.concat(id),
      name: response.names[0].displayName,
      email: response.emailAddresses ? response.emailAddresses[0].value : null,
      picture: response.photos ? response.photos[0].url : null,
      provider: 'google',
      at: response.access_token
    })
  }

  const options = {
    authorization_uri: 'https://www.googleapis.com/oauth2/v4/token',
    profile_uri: 'https://people.googleapis.com/v1/people/me',
    profileMap
  }

  return customGoogle.callback(event, options, {
    authorization: { grant_type: 'authorization_code' },
    profile: { personFields: 'nicknames,names,emailAddresses,photos' }
  })
}

module.exports = {
  signinHandler,
  callbackHandler
}
