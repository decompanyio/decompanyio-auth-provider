'use strict';

const SESSION_ID = process.env.SESSION_ID
const SESSION_TIMEOUT = Number(process.env.SESSION_TIMEOUT)

const createSessionCookieRedirectResponse = (session, url) => {
  if(!session || !session.id){
    throw new Error('session invaild')
  }
  const expireAt = new Date(Date.now() + SESSION_TIMEOUT * 1000)
  return {
    statusCode: 302,
    headers: Object.assign({
      'Set-Cookie': `${SESSION_ID}=${session.id};HttpOnly;Path=/;expires=${expireAt.toGMTString()};max-age=${SESSION_TIMEOUT};`,
      Location: url
    })
  }
}

const createSessionCookieResponse = (session, {
  header,
  body
}) => {
  if(!session || !session.id){
    throw new Error('session invaild')
  }
  const expireAt = new Date(Date.now() + SESSION_TIMEOUT * 1000)
  return {
    statusCode: 200,
    headers: Object.assign({
      'Content-Type': 'text/html',
      'Set-Cookie': `${SESSION_ID}=${session.id};HttpOnly;Path=/;expires=${expireAt.toGMTString()};max-age=${SESSION_TIMEOUT};`
    }, header),
    body: typeof(body) === 'string'?body:JSON.stringify(body)
  }
  
}

const errorSessionCookieResponse = (session, {header, body}) =>{

  if(!session || !session.id){
    throw new Error('session invaild')
  }

  return {
    statusCode: 500,
    headers: Object.assign({
      'Content-Type': 'application/json',
      'Set-Cookie': `${SESSION_ID}=${session.id};HttpOnly;Path=/;`
    }, header),
    body: JSON.stringify({
      error: body
    })
  }
}

module.exports = {
  createSessionCookieRedirectResponse,
  createSessionCookieResponse,
  errorSessionCookieResponse
}

