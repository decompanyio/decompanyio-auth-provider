const signinHandler = require('./lib/handlers/signinHandler')
const callbackHandler = require('./lib/handlers/callbackHandler')
const refreshHandler = require('./lib/handlers/refreshHandler')
const authorizeHandler = require('./lib/handlers/authorizeHandler')
const getUserInfoHandler = require('./lib/handlers/getUserInfoHandler')
const processSignin = require('./lib/handlers/processSigninHandler')
const processSignupHandler = require('./lib/handlers/processSignupHandler')
const mainHandler = require('./lib/handlers/mainHandler')
const { setupSchemaHandler } = require('./lib/storage/fauna/faunaUser')

module.exports.signin = async (event) => signinHandler(event)

module.exports.callback = async (event) => callbackHandler(event)

module.exports.refresh = async (event) => refreshHandler(event)

module.exports.authorize = async (event) => authorizeHandler(event)

module.exports.schema = (event, context, cb) => setupSchemaHandler(event, cb)

module.exports.userinfo = (event, context, cb) => getUserInfoHandler(event, cb)

module.exports.processSignin = (event, context, cb) => processSignin(event, cb)

module.exports.processSignup = (event, context, cb) => processSignupHandler(event, cb)

module.exports.main = (event, context, cb) => mainHandler(event, cb)
