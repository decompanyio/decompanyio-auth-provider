const cookieUtil = require('cookie')
const sessionStorage = require('../storage/sessionStorage')
const helpers = require('../utils/helpers')
console.log('process.env', process.env)
const REDIRECT_DOMAIN_NAME = process.env.REDIRECT_DOMAIN_NAME
/**
 * Signup Handler
 * @param proxyEvent
 * @param context
 */
async function processSignup(proxyEvent, cb) {
  
  let event = {
    Authorization: proxyEvent.headers.Authorization,
    Cookie: cookieUtil.parse(proxyEvent.headers.Cookie),
  }
  
  let session = await sessionStorage.getSession(event.Cookie)
  if(session && session.isSigned){
    console.log('alreadly sigined', JSON.stringify(session))
  } else {
    
    
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


module.exports = processSignup
