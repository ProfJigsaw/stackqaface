if (localStorage.getItem('jwtoken') !== null) {
  window.location.assign('./user.html');
}

const modal               = document.querySelector("#modal");
const modalG              = document.querySelector(".modal-guts");
const closeButton         = document.querySelector("#close-button");
const modalOverlay        = document.querySelector("#modal-overlay");
const loginPopUpButton    = document.querySelector("#login-button");
const signupPopUpButton   = document.querySelector("#signup-button");

/* Login Pop up logic */
loginPopUpButton.addEventListener('click', (e) => {
  e.preventDefault();
  modal.classList.toggle("closed");
  modalOverlay.classList.toggle("closed");
  modalG.innerHTML = `
  <div class="loginbox">
    <img src="./assets/login.png" class="avatar">
    <h1>Login Form</h1>
    <form>
      <p>Username</p>
      <input type="text" name="username" id="username" placeholder="Enter username" required>
      <p>Password</p>
      <input type="password" name="password" id="password" placeholder="Enter password" required>
      <input id="login-submit-button" type="submit" name="submit" value="Login">
      <img src="./assets/loader2.gif" alt="loader" id="loader" style="display: none;" >
    </form>
  </div>
  `;

  const uName     = document.getElementById('username');
  const uPass     = document.getElementById('password');
  const loginBtn  = document.getElementById('login-submit-button');
  const loader    = document.getElementById('loader');

  /* Login handler */
  loginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    let username = uName.value;
    let password = uPass.value;
    if (!username || !password) {
      return serve_info_helper('None of the fields can be empty!');
    }
    loader.style.display = 'block'

    /* Beginning of login fetch statement */
    fetch('https://nvc-stackqa.herokuapp.com/api/v1/auth/login', {
      method: 'post',
      headers : { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        "username": username,
        "password": password,
      })
    })
    .then((response) => {
      response.json()
      .then((data) => {
        if (data.success === true) {
          localStorage.setItem('jwtoken', data.token);
          window.location.assign('./user.html');
        } else {
          loader.style.display = 'none'
          return serve_info_helper(data.message);
        }
      })
      .catch(err => console.log(err));
    })
    /* End of login fetch statement */

  })
  /* End of login handler */

});
/* End of login Pop up logic */


/* Signup Pop up logic */
signupPopUpButton.addEventListener('click', (e) => {
  e.preventDefault();
  modal.classList.toggle("closed");
  modalOverlay.classList.toggle("closed");
  modalG.innerHTML = `
  <div class="loginbox">
  	<img src="./assets/signup.jpg" class="avatar">
  	<h1>SignUp Form</h1>
  	<form>
  		<p>Username</p>
  		<input type="text" id="signup-username" name="username" placeholder="Enter username">
  		<p>Email</p>
  		<input type="email" id="signup-email" name="email" placeholder="Enter email">
  		<p>Password</p>
  		<input type="password" id="signup-password" name="password" placeholder="Enter password">
  		<input id="signup-submit-button" type="submit" name="submit" value="Sign Up">
      <img src="./assets/loader2.gif" alt="loader" id="loader" style="display: none;">
  	</form>
  </div>
  `;

  const signupBtn = document.getElementById('signup-submit-button');
  const loader    = document.getElementById('loader');
  const uNameSign = document.getElementById('signup-username');
  const uMailSign = document.getElementById('signup-email');
  const uPassSign = document.getElementById('signup-password');

  /* Sign up handler */
  signupBtn.addEventListener('click', (e) => {
    e.preventDefault();
    let username = uNameSign.value;
    let password = uPassSign.value;
    let email = uMailSign.value;
    if(!username || !password || !email){
      return serve_info_helper('None of the fields can be empty');
    }
    if (!testEmail(email)) {
      return serve_info_helper('Your Email is invalid!');
    }
    if (password.length < 6) {
      return serve_info_helper('Your password is too short! It should be atleast 6 characters long');
    }
    loader.style.display = 'block';

    /* Sign up fetch statement */
    fetch('https://nvc-stackqa.herokuapp.com/api/v1/auth/signup', {
      method: 'post',
      headers : { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        "username": username,
        "email": email,
        "password": password,
      })
    })
    .then((response) => {
      response.json()
      .then((data) => {
        if (data.success === true) {
          localStorage.setItem('jwtoken', data.token);
          window.location.assign('./user.html');
        } else {
          loader.style.display = 'none'
          serve_info_helper(data.message);
        }
      })
      .catch(err => console.log(err));
    });
    /* End of Sign up fetch statement */

  })
  /* End of sign up handler */

});
/* End of signup Pop up logic */


/* Modal close logic */
closeButton.addEventListener('click', (e) => {
  e.preventDefault();
  modal.classList.toggle("closed");
  modalOverlay.classList.toggle("closed");
  modalG.innerHTML = "";
});

/* Helper to validate and email */
const testEmail = (email) => {
  const emailregex = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  return emailregex.test(email);
};
/* End of email validator */

/* Helper to serve up information */
const serve_info_helper = (msg) => {
  server_modal.style.display = "block";
  return document.getElementById('modal-info-panel').innerHTML = msg;
}
/* End of helper function */

/* Server modal controller */
const server_modal = document.getElementById('info');
const server_span_close = document.getElementsByClassName("cancel")[0];

server_span_close.onclick = () => {
    server_modal.style.display = "none";
}
window.onclick = (e) => {
    if (e.target === server_modal) {
        server_modal.style.display = "none";
    }
}
/* End of server modal controller */