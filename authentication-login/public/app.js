

const authenticationEndpoint = 'https://auth.share.decompany.io'


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
    window.history.replaceState({ authorization_token: '' }, 'Login', '/')

    // trigger test token
    testToken()
  }

  $('.testers #test').on('click', testToken)
  $('.testers #refresh').on('click', refreshToken)
})
