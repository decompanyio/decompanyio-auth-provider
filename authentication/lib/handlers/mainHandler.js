// Config

const fs = require("fs");
const path = require("path");

// Common
const cookieUtil = require('cookie')
const cache = require('../storage/cacheStorage')
const sessionStorage = require('../storage/sessionStorage')
const SESSION_ID = process.env.SESSION_ID
const HTML_PATH = '../../html/lock.html'
let HTML = null
const REDIRECT_DOMAIN_NAME = process.env.REDIRECT_DOMAIN_NAME
console.log('mainHandler process.env', process.env)
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

  const session = await sessionStorage.getSession(event.Cookie)
  if(session && sessionStorage.isSignined(session)) {
    // go to 302 client redirect callback
    // 로그인이 확인되었으면 access_token 발급을 위하여 /authentication/signin/email 보낸다.
    const schema = process.env.stage === 'local'?'http':'https'
    const url = `${schema}://${REDIRECT_DOMAIN_NAME}/authentication/signin/email`
    return {
      statusCode: 302,
      headers: {
        Location: url
      }
    }

  } else {

    //go to lock for sign-in
    //if(!HTML){
      HTML = await getLockHtml(HTML_PATH)
    //}
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html',
        'Set-Cookie': `${SESSION_ID}=${session.id};HttpOnly;Path=/;`
      },
      body: HTML
    }
  }
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

async function doLogin(event){
  const {Authorization, Cookie} = event;
  const token = Authorization.split(" ")[1] 
  const tokens = Buffer.from(token, "base64").toString().split(':')
  const email  = tokens[0]
  const pwd  = tokens[1]
}