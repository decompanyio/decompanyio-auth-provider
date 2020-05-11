const { customAlphabet } = require('nanoid')
const createId = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 11);
const logger = require('log4js').getLogger()
const crypto = require('crypto');
const decamelize = require('decamelize')
const createResponseData = (id, config) => {
  // sets 15 seconds expiration time as an example
  const authorizationToken = {
    payload: {
      id
    },
    options: {
      expiresIn: Number(config.expires_in) || 15
    }
  }

  return { authorizationToken }
}

const log = (message) => {
  logger.debug(message)
}
// empty strings cannot be saved to dynamo
const sanitize = (obj) => {
  const clone = Object.assign({}, obj)
  Object.keys(clone).forEach((key) => {
    if (clone[key] && typeof(clone[key]) === 'object') {
      clone[key] = sanitize(clone[key])
    } else if (!clone[key] || clone[key] === '') {
      delete clone[key]
    }
  })
  return clone
}

const sha512 = (str, digest) => {
  const hashed = crypto.createHash('sha512').update(str).digest(digest?digest:'base64') 
  return hashed
}

const makePSUserId = () =>{
  
  const id = createId()
  return 'ps-oauth2|' + id
}

const urlParams = (params) => {
  const result =
    Object.keys(params).map((key) =>
      `${decamelize(key)}=${params[key]}`)
  return result.join('&')
}

const getSchema = () => {
  return process.env.STAGE === 'local'?'http':'https'
}
module.exports = {
  createResponseData,
  log,
  sanitize,
  sha512,
  makePSUserId,
  urlParams,
  getSchema
}


