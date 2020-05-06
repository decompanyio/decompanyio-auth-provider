'use strict';
const fs = require('fs');
module.exports.getTokenSecret = async (serverless) => {
  const stage = serverless.service.provider.stage?serverless.service.provider.stage:'dev';
  if(stage === 'local'){
    return ""
  }
  const tokenSecret = fs.readFileSync(`./token_secret.${stage}`, { encoding: 'base64', flag: 'r' })
  return tokenSecret
}