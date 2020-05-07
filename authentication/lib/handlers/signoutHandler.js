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
async function signout(proxyEvent, cb) {
  
  let event = {
    Cookie: cookieUtil.parse(proxyEvent.headers.Cookie?proxyEvent.headers.Cookie:''),
  }
  
  let session = await sessionStorage.getSession(event.Cookie?event.Cookie[SESSION_ID]:null)

  if(session && session.id){
    console.log('session removed!!')
    await sessionStorage.removeSession(session.id)
  } else {
    console.log('session is null')
  } 
  
  const schema = helpers.getSchema()
  const url = `${schema}://${REDIRECT_DOMAIN_NAME}/authentication`
  
  return {
    statusCode: 302,
    headers: {
      Location: url
    }
  }
  

}


module.exports = signout
