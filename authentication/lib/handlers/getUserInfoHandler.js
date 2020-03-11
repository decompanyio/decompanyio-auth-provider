/* eslint-disable prefer-destructuring */
// Config
const { config, utils } = require('serverless-authentication')

const users = require('../storage/usersStorage')


module.exports = getUserInfo

async function getUserInfo(event, callback) {

  const { principalId } = event.requestContext.authorizer

  const user = await users.getUser(principalId)
  // console.log("user", user.Items[0])
  const item = user.Items[0]
  if ( item['_raw'] ) {
    delete item['_raw']
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
