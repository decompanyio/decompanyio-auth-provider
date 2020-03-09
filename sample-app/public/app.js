

const authenticationEndpoint = 'https://localauth.share.decompany.io/local'

// const contentApiEndpoint = 'https://msq4brz5o9.execute-api.us-west-1.amazonaws.com/dev'
const contentApiEndpoint = 'https://td7tx2gu25.execute-api.us-west-1.amazonaws.com/authtest/api/account/get'

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
    console.log('22222222')
    $('#test-result').html('Unauthorized')
  }
}

function refreshToken() {
  $('#test-result').html('Loading...')
  console.log('refreshToken')
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
        testToken()
      }
    })
    .fail((error) => {
      $('#test-result').html('Unauthorized')
    })
}

function saveResponse(authorization_token, refresh_token) {
  // Save token to local storage for later use
  if (authorization_token) {
    localStorage.setItem('authorization_token', authorization_token)
  }
  if (refresh_token) {
    localStorage.setItem('refresh_token', refresh_token)
  }

  $('#token').html(`authorization_token:${localStorage.getItem('authorization_token')}<hr>refresh_token:${localStorage.getItem('refresh_token')}`)
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

$(() => {
  $('.providers button').on('click', (event) => {
    const provider = $(event.currentTarget).attr('id')
    $('#token').html('Loading...')
    $('#test-result').html('Loading...')
    // window.location.href = `${authenticationEndpoint}/authentication/signin/${provider}?returnUrl=${encodeURI('https://www.naver.com')}`
    window.location.href = `${authenticationEndpoint}/authentication/signin/${provider}`
  })

  $('#logout').on('click', (event) => {
    localStorage.removeItem('authorization_token')
    localStorage.removeItem('refresh_token')
    window.location.href = getPathFromUrl(window.location.href)
  })

  const query = getQueryParams(document.location.search)
  if (query.error) {
    $('#token').html(query.error)
    localStorage.removeItem('authorization_token')
    localStorage.removeItem('refresh_token')
  } else {
    const aToken = query.authorization_token || ''
    const rToken = query.refresh_token || ''
    saveResponse(aToken, rToken)
    window.history.replaceState({ authorization_token: '' }, 'serverless-authentication-gh-pages', '/serverless-authentication-gh-pages')

    // trigger test token
    testToken()
  }

  $('.testers #test').on('click', testToken)
  $('.testers #refresh').on('click', refreshToken)
})
