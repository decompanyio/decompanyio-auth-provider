const cookieUtil = require('cookie')
const sessionStorage = require('../storage/sessionStorage')
const users = require('../storage/usersStorage')
const helpers = require('../utils/helpers')
const responseUtils = require('../utils/responseUtils')
const SESSION_ID = process.env.SESSION_ID
const REDIRECT_DOMAIN_NAME = process.env.REDIRECT_DOMAIN_NAME
/**
 * Signup Handler
 * @param proxyEvent
 * @param context
 */
async function processSignup(proxyEvent, cb) {
  
  try{
    const {email, pwd} = JSON.parse(proxyEvent.body)
    let event = {
      Authorization: proxyEvent.headers.Authorization,
      Cookie: cookieUtil.parse(proxyEvent.headers.Cookie?proxyEvent.headers.Cookie:''),
      email,
      pwd
    }
    
    let session = await sessionStorage.getSession(event.Cookie?event.Cookie[SESSION_ID]:null)
 
    if(session && sessionStorage.isSignined(session)){
      console.log('alreadly sign-up', JSON.stringify(session))
      const schema = helpers.getSchema();
      const url = `${schema}://${REDIRECT_DOMAIN_NAME}/authentication/signin/email`
      return {
        statusCode: 302,
        headers: {
          Location: url
        }
      }

    } else {
      const user = await doSignup(email, pwd)
      //console.log('user', user)

      return responseUtils.createSessionCookieResponse(session, {
        body: JSON.stringify({
          success: true,
          userId: user._id
        })
      })
    }
    
  } catch (err){
    console.log(err)
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: JSON.stringify(err, Object.getOwnPropertyNames(err))
      })
    }
  
  }

  
  
}

async function doSignup(email, pwd) {

  const savedUser = await users.getUserProviderEmail(email)

  if(savedUser){
    throw new Error(`already exists user : ${email}`)
  }

  const created = Date.now();
  const userId = helpers.makePSUserId(email)
  return await users.saveUser({
    _id: userId,
    userId,
    email,
    verify: false,
    pwd: helpers.sha512(pwd),
    provider: 'email',
    createdAt: new Date(created),
    created
  })
}


module.exports = processSignup
