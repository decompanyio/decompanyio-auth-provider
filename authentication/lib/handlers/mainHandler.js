// Config

const fs = require("fs");
const path = require("path");

// Common
const cookieUtil = require('cookie')
const cache = require('../storage/cacheStorage')
const users = require('../storage/usersStorage')
const sessionStorage = require('../storage/sessionStorage')
const helpers = require('../utils/helpers')
const responseUtils = require('../utils/responseUtils')
const SESSION_ID = process.env.SESSION_ID
const HTML_PATH = '../../html/lock.html'
let HTML = null
const REDIRECT_DOMAIN_NAME = process.env.REDIRECT_DOMAIN_NAME

/**
 * Signin Handler
 * @param proxyEvent
 * @param context
 */
module.exports = async (proxyEvent, cb) => {
  let event = {
    Authorization: proxyEvent.headers.Authorization,
    Cookie: proxyEvent.headers.Cookie?cookieUtil.parse(proxyEvent.headers.Cookie):null,
    redirectUrl: proxyEvent.queryStringParameters ? proxyEvent.queryStringParameters.redirectUrl : null,
    returnUrl: proxyEvent.queryStringParameters ? proxyEvent.queryStringParameters.returnUrl : null
  }

  const session = await sessionStorage.getSession(event.Cookie?event.Cookie[SESSION_ID]:null)
  console.log('mainHandler session', JSON.stringify(session))

  if(session && sessionStorage.isSignined(session)) {

    const user = await users.getUser(session.userId)
    if(!user){
      return sessionStorage.removeSession(session.id)
      .then(sessionStorage.getSession(event.Cookie))
      .then( (s)=>gotoLoginForm(s))
    }

    // go to 302 client redirect callback
    // 로그인이 확인되었으면 access_token 발급을 위하여 /authentication/signin/email 보낸다.
    const schema = helpers.getSchema()
    const url = `${schema}://${REDIRECT_DOMAIN_NAME}/authentication/signin/email`
    return {
      statusCode: 302,
      headers: {
        Location: url
      }
    }
  } 

  return gotoLoginForm(session)
}


async function getLockHtml(htmlPath){
  let resolvedPath;
  if (process.env.LAMBDA_TASK_ROOT) {
    resolvedPath = path.resolve(process.env.LAMBDA_TASK_ROOT, htmlPath)
  } else {
    resolvedPath = path.resolve(__dirname, htmlPath)
  }
  /*
  console.log("process.env.LAMBDA_TASK_ROOT", process.env.LAMBDA_TASK_ROOT);
  console.log("__dirname", __dirname);
  console.log("htmlPath", htmlPath);
  console.log("resolvedPath", resolvedPath);
  */
  return fs.readFileSync(resolvedPath, 'utf8');
  
}

async function gotoLoginForm(session){
  console.log('load signup form!!')
  //go to lock for sign-in
  //if(!HTML){
    HTML = await getLockHtml(HTML_PATH)
  //}
  return responseUtils.createSessionCookieResponse(session, {
    body: HTML
  })  
}