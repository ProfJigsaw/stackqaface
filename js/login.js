const loginBtn = document.getElementById('submit');
const uName = document.getElementById('username');
const uPass = document.getElementById('password');

loginBtn.addEventListener('click', (e) => {
	e.preventDefault();
	let username = uName.value;
	let password = uPass.value;
	if(!username || !password){
		modal.style.display = "block";
		return document.getElementById('modal-info-panel').innerHTML = 'None of the fields can be empty!';
	}
	loader.style.display = 'block'
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
			if (data.loginstate === true) {
				localStorage.setItem('jwtoken', data.token);
				window.location.assign('./user.html');
			} else {
				loader.style.display = 'none'
				modal.style.display = "block";
				document.getElementById('modal-info-panel').innerHTML = data.msg;
			}
		})
		.catch(err => console.log(err));
	})
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