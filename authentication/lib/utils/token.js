const AWS = require('aws-sdk')
const kms = new AWS.KMS({region: process.env.REGION})
const STAGE = process.env.STAGE

module.exports.getTokenSecret = async (decodedTokenSecret) => {

  if(STAGE === 'local'){
    return Promise.resolve(decodedTokenSecret)
  }

  return new Promise((resolve, reject) => {
    const params = {
      CiphertextBlob: decodedTokenSecret
    }

    kms.decrypt(params, (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data.Plaintext.toString('utf-8'))
      }
    })
  })
}