/* eslint-disable prefer-destructuring */
// Config
const users = require('../storage/usersStorage')


module.exports = getUserInfo

async function getUserInfo(event, callback) {

  const { principalId } = event.requestContext.authorizer
  //console.log('principalId', principalId)
  const user = await users.getUser(principalId)
  //console.log("user", user)

  if(!user || !user._id) {
    throw new Error(`user is not exist : ${principalId}`)
  }
  const item = user
  if ( item && item['_raw'] ) {
    delete item['_raw']
  }
  if ( item && item['pwd'] ) {
    delete item['pwd']
  }
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': '*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      success: true,
      user: item
    })
  }
}   
