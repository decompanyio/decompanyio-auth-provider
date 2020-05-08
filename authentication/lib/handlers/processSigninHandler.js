const cookieUtil = require('cookie')
const sessionStorage = require('../storage/sessionStorage')
const users = require('../storage/usersStorage')
const helpers = require('../utils/helpers')
const responseUtils = require('../utils/responseUtils')
const REDIRECT_DOMAIN_NAME = process.env.REDIRECT_DOMAIN_NAME
const SESSION_ID = process.env.SESSION_ID
/**
 * Signin Handler
 * @param proxyEvent
 * @param context
 */
async function processSignin(proxyEvent, cb) {
  
  let event = {
    Authorization: proxyEvent.headers.Authorization,
    Cookie: cookieUtil.parse(proxyEvent.headers.Cookie?proxyEvent.headers.Cookie:''),
  }
  
  let session = await sessionStorage.getSession(event.Cookie?event.Cookie[SESSION_ID]:null)
  if(session && session.isSigned === true){
    console.log('alreadly sigined', JSON.stringify(session))
  } else {
    const loginInfo = await doLogin(event)
    if(loginInfo.error) {

      return responseUtils.createSessionCookieResponse(session, {
        header: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          error: loginInfo.error
        })
      })

    }

    if(loginInfo.isSigned === true) {
      console.log('sign-in success!!', JSON.stringify(loginInfo))
      session = Object.assign(session, loginInfo)
      await sessionStorage.setSession(session.id, session)
    }
    
  }
  
  const schema = helpers.getSchema()
  const url = `${schema}://${REDIRECT_DOMAIN_NAME}/authentication/signin/polarishare`
  
  return responseUtils.createSessionCookieResponse(session, {
    header: {
      'Content-Type': 'application/json'
    },
    body: {
      session,
      url
    }
  })
  

}

async function doLogin(event){
  const {Authorization} = event;
  const token = Authorization.split(" ")[1] 
  const tokens = Buffer.from(token, "base64").toString().split(':')
  const email  = decodeURIComponent(tokens[0])
  const pwd  = decodeURIComponent(tokens[1])
  
  return await comparePassword(email, pwd)
  
}

function comparePassword(email, pwd) {

  return new Promise(async (resolve, reject)=>{
    //db auth 필요
    const savedUser = await users.getUserProviderEmail(email)
    const hashedPwd = helpers.sha512(pwd)
    console.log(email, savedUser, hashedPwd)
    if(savedUser && savedUser.pwd && savedUser.pwd === hashedPwd){
      // success
      resolve(Object.assign({
        email: savedUser.email,
        userId: savedUser._id,
        createdAt: new Date(savedUser.created),
        provider: savedUser.provider
      }, {isSigned: true}))
    } else {
      // fail
      resolve({
        error: 'The account is incorrect.'
      })
    }
  })
  
}

module.exports = processSignin
