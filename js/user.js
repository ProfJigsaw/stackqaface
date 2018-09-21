if (localStorage.getItem('jwtoken') === null) {
	window.location.assign('./index.html');
}

const modal         = document.querySelector("#modal");
const modalG        = document.querySelector(".modal-guts");
const closeButton   = document.querySelector("#close-button");
const homeLink 			= document.querySelector("#homeLink");
const postLink   		= document.querySelector("#post-question-link");
const modalOverlay  = document.querySelector("#modal-overlay");
const mainContent 	= document.querySelector('#questions-area');
const allQ 					= document.querySelector('#all-questions');
const recentQ				= document.querySelector('#recent-questions')
const logout				= document.querySelector('#logout-link');
const profile				= document.querySelector('#profile-link');
const postComButton = document.querySelector('#comment-submit-button');

/* Post comment event hook */
postComButton.addEventListener('click', (e) => {
	e.preventDefault();
	let userlink = document.querySelector('.userlink');
	let comment = document.querySelector('#form-comment-input').value;
	let qid = userlink.getAttribute('questionid');
	let aid = userlink.getAttribute('answerid');
	postCommentsHandler(qid, aid, comment);
	document.querySelector('#form-comment-input').value = '';
})

/* Profile handler */
profile.addEventListener('click', (e) => {
	e.preventDefault();
	mainContent.innerHTML = `<img src="./assets/loader.gif" alt="loader" id="loader">`;
	fetch('https://nvc-stackqa.herokuapp.com/api/v1/auth/users', {
	  method: 'get',
	  headers: {
	  	Accept: 'application/json',
	  	Authorization: `header ${localStorage.getItem('jwtoken')}` 
	  }
	})
	.then((response) => {
	  response.json()
	  .then((data) => {
	  	mainContent.innerHTML = `
	  	<div class="profile-card">
			  <img src="./assets/profilepic.jpg" alt="avatar" class="profile-avatar">
			  <div class="card-body">
			  	<h1>${data.username}</h1>
				  <p>Stack Id: ${data.userid}</p><br>
				  <p><a href="#" id="my-questions">My Questions</a></p>
				  <p><a href="#" id="my-contributions">My Contributions</a></p>
				 	<p><a href="#" id="top-question">Top Question</a></p>
			  </div>
			  <p><button>Stack Profile</button></p>
			</div>
		`;
		createProfileLinkHandlers();
	  });
	})
	.catch((err) => console.log(err))
})

/* logout handler */
logout.addEventListener('click', (e) => {
	e.preventDefault();
	localStorage.removeItem('jwtoken')
	window.location.assign('./index.html');
})

const welcomeMessage = () => {
	mainContent.innerHTML = `<img src="./assets/loader.gif" alt="loader" id="loader">`;
	fetch('https://nvc-stackqa.herokuapp.com/api/v1/auth/users', {
	  method: 'get',
	  headers: {
	  	Accept: 'application/json',
	  	Authorization: `header ${localStorage.getItem('jwtoken')}` 
	  }
	})
	.then((response) => {
	  response.json()
	  .then((data) => {
	  	mainContent.innerHTML = `
	  		<h1>Welcome, <span class="highlight">${data.username}</span>! to stackOverflow Lite.</h1>
				<p>Your No_1 Q & A platform.</p><br>
				<p>Below is a sample of the format in which questions are displayed on this platform. </p><br>
				
				<!-- Demo question one -->
				<div class="question-container">
					<div class="question-card">
						<div class="side-bar"></div>
						<div class="main-question-bar">
							Who is the inventor of the light bulb?
						</div>
						<button class="delete-question">Delete</button>
					</div>
				</div>

				<!-- Demo question two -->
				<div class="question-container">
					<div class="question-card">
						<div class="side-bar"></div>
						<div class="main-question-bar">
							Who is Linus Torvalds?
						</div>
						<button class="delete-question">Delete</button>
					</div>
				</div>
				<!-- End of demo question -->

				<div id="demo-msg">
						<p>Click on a particular question to view its thread. Add answers and comment on posted answers if the need arises. </p><br>
					<p>To view all questions posted on this platform or to add your own question, use the side bar on the left of the screen. (or at the top of your mobile.) </p>
				</div>
		`;
	  });
	})
	.catch((err) => console.log(err))
}

/* Initial call to welcomeMessage on page load */
welcomeMessage();

/* Call to welcomeMessage on homeLink click */
homeLink.addEventListener('click', (e)=> {
	e.preventDefault();
	welcomeMessage();
})

// Get all questions handler
allQ.addEventListener('click', (e) => {
	e.preventDefault();
	mainContent.innerHTML = `<img src="./assets/loader.gif" alt="loader" id="loader">`;
	getAllQuestions();
})

// Get recent questions handler
recentQ.addEventListener('click', (e) => {
	e.preventDefault();
	mainContent.innerHTML = `<img src="./assets/loader.gif" alt="loader" id="loader">`;
	getAllQuestions();
})

/* Post question pop up handler */
postLink.addEventListener('click', (e) => {
	e.preventDefault();
	modal.classList.toggle("closed");
  modalOverlay.classList.toggle("closed");
  modalG.innerHTML = `
  <div class="post-answer-box">
  	<h1>Post A Question</h1>
  	<form>
  		<p>Title</p>
  		<input id="form-question-title" type="text" name="username" placeholder="Question Title...">
  		<p>Question body</p>
  		<textarea id="form-question-input" name="question" placeholder="Question body..."></textarea>
  		<input id="post-submit-button" type="submit" name="submit" value="Post">
  	</form>
  </div>
  `;

  const addQBtn = document.querySelector('#post-submit-button');

	// post question handler
	addQBtn.addEventListener('click', (e) => {
		e.preventDefault();
		let question = document.querySelector('#form-question-input').value
		let qtitle = document.querySelector('#form-question-title').value

		if(!question || !qtitle) {
			server_modal.style.display = "block";
			return document.getElementById('modal-info-panel').innerHTML = 'Empty question cannot be submitted';
		} else if (!question.trim()) {
			server_modal.style.display = "block";
			return document.getElementById('modal-info-panel').innerHTML = 'Empty question cannot be submitted';
		}
		modal.classList.toggle("closed");
	  modalOverlay.classList.toggle("closed");
		postQuestionHandler(question, qtitle);

	})
});

/* cool searcher functionality */
const searcher 				= document.querySelector('#searcher');
const closemodal 			= document.querySelector('.close');
const searchmodal 		= document.querySelector('#search');
const searcherInput 	= document.querySelector('#stack-searcher-input');

searcher.addEventListener('click', (e) => {
	e.preventDefault();
	searchmodal.classList.add('open');
	searcherInput.focus();
})

searchmodal.addEventListener('click', (e) => {
	e.preventDefault();
	if(e.target === searchmodal || e.target === closemodal) {
		searchmodal.classList.remove('open');
	}
});

searchmodal.addEventListener('keyup', (e) => {
	e.preventDefault();
	if (e.keyCode == 27 ){
		searchmodal.classList.remove('open');
	}
});
/* end of cool searcher functionality */

//Search handler
searcherInput.addEventListener('keyup', (e) => {
	e.preventDefault();
	if (e.keyCode === 13) {
		if (!e.target.value || !e.target.value.trim()) {
			server_modal.style.display = "block";
			return document.getElementById('modal-info-panel').innerHTML = 'To search, you must enter a value';
		}
		server_modal.style.display = "block";
		document.getElementById('modal-info-panel').innerHTML = `
			Searching for...  ${e.target.value}
			<img src="./assets/loader.gif" alt="profileloader" id="profileloader">
		`;
		fetch('https://nvc-stackqa.herokuapp.com/api/v1/questions', {
		  method: 'get',
		  headers: {
		  	Accept: 'application/json',
		  	Authorization: `header ${localStorage.getItem('jwtoken')}`
		  }
	  })
		.then((response) => {
	    response.json()
	    .then((data) => {
	      let found = data.questions.reverse();	      
	      let questionList = '';
	      let foundArray = [];
	      found.map((qobj) => {
	      	if(
	      		qobj.question
	      		.toLowerCase()
	      		.indexOf(e.target.value.toLowerCase()) !== -1 
	      		||
	      		qobj.title
	      		.toLowerCase()
	      		.indexOf(e.target.value.toLowerCase()) !== -1
	      		) {
	      		foundArray.push(qobj);
	      	}
	      })
	      if (foundArray.length > 0) {
					document.getElementById('modal-info-panel').innerHTML = `Found ${foundArray.length} ${foundArray.length === 1 ? 'question' : 'questions'} with the key word: ${e.target.value}`;
					foundArray.map((question) => {
		      	 questionList += makeQuestion(question);
		      })
		      mainContent.innerHTML = questionList;
		      createLinkHandlers();
      		deleteQuestionHook();
	      } else {
	      	document.getElementById('modal-info-panel').innerHTML = 'Couldnt find ...' + e.target.value;
	      }      
	    });
		})
		.catch((err) => console.log(err))

	}

})

/* close modal handler */
closeButton.addEventListener('click', (e) => {
  e.preventDefault();
  modal.classList.toggle("closed");
  modalOverlay.classList.toggle("closed");
  modalG.innerHTML = "";
});

let com_mod_container   = document.querySelector('#com-mod-con');
let com_mod_background  = document.querySelector('.com-mod-bg');

/* server modal handler */
const server_modal = document.getElementById('info');
const server_span_close = document.getElementsByClassName("cancel")[0];
/* End of server modal hooks*/

server_span_close.onclick = function() {
    server_modal.style.display = "none";
}

window.onclick = function(event) {
    if (event.target == server_modal) {
        server_modal.style.display = "none";
    }
    if (event.target == com_mod_background) {
      com_mod_container.classList.toggle('out');
    }
}