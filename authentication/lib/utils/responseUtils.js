const SESSION_ID = process.env.SESSION_ID

const createSessionCookieResponse = (session, {
  header,
  body
}) => {
 
  return {
    statusCode: 200,
    headers: Object.assign({
      'Content-Type': 'text/html',
      'Set-Cookie': `${SESSION_ID}=${session.id};HttpOnly;Path=/;`
    }, header),
    body: typeof(body) === 'string'?body:JSON.stringify(body)
  }
  
}

const errorSessionCookieResponse = (session, {header, body}) =>{
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
  createSessionCookieResponse,
  errorSessionCookieResponse
}

