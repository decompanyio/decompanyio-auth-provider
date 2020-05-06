const cookieUtil = require('cookie')
const sessionStorage = require('../storage/sessionStorage')
const helpers = require('../utils/helpers')
const REDIRECT_DOMAIN_NAME = process.env.REDIRECT_DOMAIN_NAME
/**
 * Signup Handler
 * @param proxyEvent
 * @param context
 */
async function processSignin(proxyEvent, cb) {
  
  let event = {
    Authorization: proxyEvent.headers.Authorization,
    Cookie: cookieUtil.parse(proxyEvent.headers.Cookie),
  }
  
  let session = await sessionStorage.getSession(event.Cookie)
  if(session && session.isSigned){
    console.log('alreadly sigined', JSON.stringify(session))
  } else {
    const loginInfo = await doLogin(event)
    console.log('current sigined', JSON.stringify(loginInfo))
    if(loginInfo.isSigned === true) {
      session = Object.assign(session, loginInfo)
      await sessionStorage.setSession(session.id, session)
    }
    
  }
  
  const schema = process.env.stage === 'local'?'http':'https'
  const url = `${schema}://${REDIRECT_DOMAIN_NAME}/authentication/signin/email`
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      session,
      url
    })
  }
}

async function doLogin(event){
  const {Authorization} = event;
  const token = Authorization.split(" ")[1] 
  const tokens = Buffer.from(token, "base64").toString().split(':')
  const email  = tokens[0]
  const pwd  = tokens[1]
  return await authUser(email, pwd)
}

function authUser(email, pwd) {

  return new Promise((resolve, reject)=>{
    //db auth 필요
    if(email === 'jay@polarishare.com' && pwd === '1234'){
      // success
      const authedData = {
        userId: helpers.makePSUserId(email),
        email,
        isSigned: true,
        signed: Date.now()
      }
      resolve(authedData)
    } else {
      // fail
      resolve({})
    }
  })
  
}

module.exports = processSignin
