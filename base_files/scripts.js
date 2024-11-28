document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const errorMessage = document.getElementById('error-message');

  if (loginForm) {
      loginForm.addEventListener('submit', async (event) => {
          event.preventDefault();

          const email = document.getElementById('email').value;
          const password = document.getElementById('password').value;

          try {
              const response = await fetch('http://127.0.0.1:5000/login', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({ email, password })
              });

              if (response.ok) {
                  const data = await response.json();
                  document.cookie = `token=${data.access_token}; path=/`;
                  window.location.href = 'index.html';
              } else {
                  errorMessage.textContent = "Échec de la connexion. Vérifiez vos identifiants.";
                  errorMessage.style.display = 'block';
              }
          } catch (error) {
              errorMessage.textContent = "Une erreur est survenue. Veuillez réessayer.";
              errorMessage.style.display = 'block';
          }
      });
  } else {
    checklogin()
  }
});
function checklogin(){
  const token = getCookie("token")
  const button = document.getElementById("login-button")
  if (token) 
    button.style.display= "none";
  else
    button.style.display= "block";
}
function getCookie(name) {
  let cookies = document.cookie;
  if(cookies) {
    let cookieData = cookies.split(";");
    for(let i = 0; i < cookieData.length; i++) {
      let cookie = cookieData[i];
      let key = cookie.split("=")[0];
      let value = cookie.split("=")[1];
      if(key === name)
        return value;
    }
  }
  return;
}
