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
    const {userInfo, error} = await doLogin(event)
    if(error) {

      return responseUtils.createSessionCookieResponse(session, {
        header: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          error: error
        })
      })

    } else {
      console.log('sign-in success!!', JSON.stringify(userInfo))
      session = Object.assign(session, { 
        userInfo, 
        isSigned: true, 
        email: userInfo.email, 
        provider: userInfo.provider 
      })
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
  
  return await comparePassword({email, pwd, provider: 'polarishare'})
  
}

function comparePassword({email, pwd, provider}) {

  return new Promise(async (resolve, reject)=>{
    //db auth 필요
    const savedUser = await users.getUserProviderEmail( {email, provider})
    const hashedPwd = helpers.sha512(pwd)
    //console.log(email, savedUser, hashedPwd)
    
    if(savedUser && savedUser.pwd && savedUser.pwd === hashedPwd){
      // success
      resolve(Object.assign({
        userInfo: {
        id: savedUser._id,
        email: savedUser.email,
        createdAt: new Date(savedUser.created),
        provider: savedUser.provider
      }}, {success: true}))
    } else {
      // fail
      if(!savedUser){
        console.error('user is not exists :', email)
      }
      resolve({
        error: 'The account is incorrect.'
      })
    }
  })
  
}

module.exports = processSignin
