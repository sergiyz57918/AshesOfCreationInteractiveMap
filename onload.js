// onload.js
const { PORT = 3000, DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET,BACKEND_URL } = process.env;

const getToken = async (code) => {
    const result = await fetch(BACKEND_URL+'/getToken', {
      method: 'POST',
      body: JSON.stringify({ code }),
      headers: {
        "Content-Type": "application/json",
      },
    })
  
    const resultJson = await result.json()
    window.localStorage.setItem("access_token", resultJson.access_token)
    window.localStorage.setItem("token_type", resultJson.token_type)
    return resultJson
  }

  const getMe = async (tokenType, accessToken) => {
    const result = await fetch(BACKEND_URL+'/p/getMe', {
      headers: {
        authorization: `${tokenType} ${accessToken}`,
      },
    })
  
    const resultJson = await result.json()
    const { username, id, coins } = resultJson;
    document.getElementById('coins').innerText = coins;
    document.getElementById('info').innerText = `Logged in as: ${username} (id: ${id})`;
    return resultJson
  }

  window.onload = async () => {
    const accessToken = window.localStorage.getItem("access_token")
  
    const tokenType = window.localStorage.getItem("token_type")
  
    // get code from URL
    const fragment = new URLSearchParams(window.location.search);
    const code = fragment.get('code') 
  
    if (!code && !accessToken) {
      // if no code and no token (not logged in), 
      // show button "Login with Discord"
      document.getElementById('login').style.display = `block`;
      return
    }
  
    if (code && !accessToken) {
      // if there is code but no token (code not yet exchanged), 
      // exchange code for tokens and save tokens in localStorage
      window.history.replaceState({}, document.title, "/");  // set url to "/"
      const result = await getToken(code)
      if (result.token_type && result.access_token) {
        window.localStorage.setItem("token_type", result.token_type)
        window.localStorage.setItem("access_token", result.access_token)
        // get the user info
        getMe(result.token_type, result.access_token)
      }
    }
    if (accessToken) {
      // if token exists, just get the user info
      getMe(tokenType, accessToken)
    }
  }