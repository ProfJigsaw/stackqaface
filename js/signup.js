const signupBtn = document.getElementById('submit');
const uNameSign = document.getElementById('username');
const uMailSign = document.getElementById('email');
const uPassSign = document.getElementById('password');
const loader = document.getElementById('loader');

const testEmail = (email) => {
  const emailregex = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  return emailregex.test(email);
};

signupBtn.addEventListener('click', (e) => {
	e.preventDefault();
	let username = uNameSign.value;
	let password = uPassSign.value;
	let email = uMailSign.value;
	if(!username || !password || !email){
		modal.style.display = "block";
		return document.getElementById('modal-info-panel').innerHTML = 'None of the fields can be empty';
	}
	if (!testEmail(email)) {
		modal.style.display = "block";
		return document.getElementById('modal-info-panel').innerHTML = 'Your Email is invalid!';
	}
	loader.style.display = 'block'
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
				modal.style.display = "block";
				loader.style.display = 'none'
				document.getElementById('modal-info-panel').innerHTML = data.message;
			}
		})
		.catch(err => console.log(err));
	});
});
const modal = document.getElementById('info');
const span = document.getElementsByClassName("cancel")[0];
span.onclick = function() {
    modal.style.display = "none";
}
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}