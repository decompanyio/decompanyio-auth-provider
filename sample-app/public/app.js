

const authenticationEndpoint = 'http://localhost:4080'
//const authenticationEndpoint = 'https://auth.share.decompany.io/dev'
//const authenticationEndpoint = 'https://auth.polarishare.com/asem'


// const contentApiEndpoint = 'https://msq4brz5o9.execute-api.us-west-1.amazonaws.com/dev'
// const contentApiEndpoint = 'https://td7tx2gu25.execute-api.us-west-1.amazonaws.com/authtest/api/account/get'
const contentApiEndpoint = 'https://api.share.decompany.io/rest/api/account/get'
const contentApiEndpoint2 = 'https://api.share.decompany.io/rest/api/account/documents'

function testToken() {
  const authorizationToken = localStorage.getItem('authorization_token')
  //console.log('authorizationToken', authorizationToken);

  if (authorizationToken) {
    $('#test-result').html('Loading...')
    // set token to Authorization header
    $.ajax({
      method: 'GET',
      //url: `${contentApiEndpoint}/test-token`,
      url : `${contentApiEndpoint}`,
      headers: {
        Authorization: authorizationToken
      }
    })
      .done((data) => {
        console.log(data)
        if(data.user){
          saveUserInfo(data.user.email)
        }
        $('#test-result').html(JSON.stringify(data))
      })
      .fail((error) => {
        if ($('#auto-refresh').prop('checked')) {
          $('#test-result').html('Refreshing token...')
          refreshToken()
        } else {
          $('#test-result').html('Unauthorized')
        }
      })
  } else {
    $('#test-result').html('Unauthorized')
  }
}

function testToken2() {
  const authorizationToken = localStorage.getItem('authorization_token')
  //console.log('authorizationToken', authorizationToken);

  if (authorizationToken) {
    $('#test-result').html('Loading...')
    // set token to Authorization header
    $.ajax({
      method: 'GET',
      //url: `${contentApiEndpoint}/test-token`,
      url : `${contentApiEndpoint2}`,
      headers: {
        Authorization: authorizationToken
      }
    })
      .done((data) => {
        console.log(data)
        if(data.user){
          saveUserInfo(data.user.email)
        }
        $('#test-result').html(JSON.stringify(data))
      })
      .fail((error) => {
        if ($('#auto-refresh').prop('checked')) {
          $('#test-result').html('Refreshing token...')
          refreshToken()
        } else {
          $('#test-result').html('Unauthorized')
        }
      })
  } else {
    $('#test-result').html('Unauthorized')
  }
}

function refreshToken() {
  $('#test-result').html('Loading...')
  
  // refresh token
  $.ajax({
    method: 'GET',
    url: `${authenticationEndpoint}/authentication/refresh/${localStorage.getItem('refresh_token')}`
  })
    .done((data) => {
      if (data.errorMessage) {
        $('#test-result').html(data.errorMessage)
      } else {
        saveResponse(data.authorization_token, data.refresh_token)
        testToken2()
      }
    })
    .fail((error) => {
      $('#test-result').html('Unauthorized')
    })
}
function saveUserInfo(email) {
  if(email) {
    localStorage.setItem('email', email)
  }
}

function saveResponse(authorization_token, refresh_token, expired_at) {
  // Save token to local storage for later use
  if (authorization_token) {
    localStorage.setItem('authorization_token', authorization_token)
  }
  if (refresh_token) {
    localStorage.setItem('refresh_token', refresh_token)
  }

  if (expired_at) {
    const expiredAt = new Date(expired_at * 1000);
    localStorage.setItem('expired_at', expiredAt.toString())
  }

  $('#token').html(`authorization_token: ${localStorage.getItem('authorization_token')}<hr>refresh_token: ${localStorage.getItem('refresh_token')}<hr>expiredAt: ${localStorage.getItem('expired_at')}`)
}
function getLogoutUrl() {
  return `${authenticationEndpoint}/authentication/signout`
}
function getPathFromUrl(url) {
  return url.split(/[?#]/)[0]
}

function getQueryParams(qs) {
  qs = qs.split('+').join(' ')
  const params = {}


  let tokens


  const re = /[?&]?([^=]+)=([^&]*)/g

  while (tokens = re.exec(qs)) {
    params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2])
  }
  return params
}


function getUserInfo() {
  const authorizationToken = localStorage.getItem('authorization_token')
  // console.log('authorizationToken', authorizationToken);

  if (authorizationToken) {
    $('#test-result').html('Loading...')
    // set token to Authorization header
    $.ajax({
      method: 'GET',
      // url: `${contentApiEndpoint}/test-token`,
      url : `${authenticationEndpoint}/authentication/userinfo`,
      headers: {
        Authorization: authorizationToken
      }
    })
      .done((data) => {
        console.log(data);          
        $('#test-result').html(JSON.stringify(data))
      })
      .fail(() => {
        console.log("fail");
        if ($('#auto-refresh').prop('checked')) {
          $('#test-result').html('Refreshing token...')
          refreshToken()
        } else {
          $('#test-result').html('Unauthorized')
        }
      })
  } else {
    $('#test-result').html('Unauthorized')
  }
}

$(() => {
  $('.providers button').on('click', (event) => {
    const provider = $(event.currentTarget).attr('id')
    $('#token').html('Loading...')
    $('#test-result').html('Loading...')
    // window.location.href = `${authenticationEndpoint}/authentication/signin/${provider}?returnUrl=${encodeURI('https://www.naver.com')}`
    // window.location.href = `${authenticationEndpoint}/authentication/signin/${provider}`
    
    // https://developers.google.com/identity/protocols/oauth2/web-server
    // prompt: [none, consent, select_account]
    if (provider === 'google-silent') {
      window.location.href = `${authenticationEndpoint}/authentication/signin/google?prompt=none&redirectUrl=http://127.0.0.1:3000/callback`
    } else {
      window.location.href = `${authenticationEndpoint}/authentication/signin/${provider}?redirectUrl=http://127.0.0.1:3000/callback`
      
    }
    
  })

  $('#logout').on('click', (event) => {
    localStorage.removeItem('authorization_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('email')
    //window.location.href = getPathFromUrl(window.location.href)
    window.location.href = getLogoutUrl()
  })

  const query = getQueryParams(document.location.search)
  if (query.error) {
    $('#token').html(query.error)
    localStorage.removeItem('authorization_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('email')
  } else {
    const aToken = query.authorization_token || ''
    const rToken = query.refresh_token || ''
    const expiredAt = query.expired_at || 0
    saveResponse(aToken, rToken, expiredAt)
    window.history.replaceState({ authorization_token: '' }, 'serverless-authentication-gh-pages', '/serverless-authentication-gh-pages')

    // trigger test token
    testToken2()
  }

  $('.testers #test').on('click', testToken)
  $('.testers #test2').on('click', testToken2)
  $('.testers #refresh').on('click', refreshToken)
  $('.testers #userinfo').on('click', getUserInfo)
})
