const allQ = document.getElementById('all-questions');
const addQ = document.getElementById('addquestion');
const recentQ = document.getElementById('recent-questions');
const homepage = document.getElementById('home');
const searcher = document.getElementById('search-input');
const logoutBtn = document.getElementById('logout-link');
const mainContent = document.getElementById('main-content-container');

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
	    <h1>Hello, <span id="hello">${data.username}</span>!</h1>
	    <h2 id="main-header"> Welcome to, StackOverFlow Lite</h2>
	    <br />
	    <h3>STACK TIP</h3>
	    <i>
	      This is a platform for asking useful questions on any aspect 
	      of life and getting feedback from others on the platform.
	      <p>To the left of the screen are options for navigating your 
	      page, at the top right hand corner of the page are buttons to 
	      view your profile and account information and to logout. </p>
	    </i>
	`;
  });
})
.catch((err) => console.log(err))

// Get all questions handler
allQ.addEventListener('click', (e) => {
	e.preventDefault();
	getAllQuestions();
})

// Get recent questions handler
recentQ.addEventListener('click', (e) => {
	e.preventDefault();
	getAllQuestions();
})

//Search handler
searcher.addEventListener('keyup', (e) => {
	e.preventDefault();
	if (e.keyCode === 13) {
		if (!e.target.value || !e.target.value.trim()) {
			modal.style.display = "block";
			return document.getElementById('modal-info-panel').innerHTML = 'To search, you must enter a value';
		}
		modal.style.display = "block";
		document.getElementById('modal-info-panel').innerHTML = 'Searching for....' + e.target.value;
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
	      let found = data.qstack.reverse();	      
	      let questionList = '';
	      let foundArray = [];
	      found.map((qobj) => {
	      	if(
	      		qobj.question
	      		.toLowerCase()
	      		.indexOf(e.target.value.toLowerCase()) !== -1
	      		) {
	      		foundArray.push(qobj);
	      	}
	      })
	      if (foundArray.length > 0) {
					document.getElementById('modal-info-panel').innerHTML = 'Found ' + foundArray.length + ' question(s) with the key word: ' + e.target.value;
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

// add question dialog handler
addQ.addEventListener('click', (e) => {
	e.preventDefault();
	mainContent.innerHTML = `
		<div id="add-question">
		    <h3 id="askhead">Ask Your Question:</h3>
		    <form action="#" method="post">
		            <br>
		            <textarea type="text" name="question" id="form-question-input"required></textarea>
		        </label>
		        <br>
		        <input type="submit" value="Add question" name="submit" class="submit" id="addquestion-button" />
		    </form>
		</div>
	`;
	const addQBtn = document.getElementById('addquestion-button');
	// post question handler
	addQBtn.addEventListener('click', (e) => {
		e.preventDefault();
		let question = document.getElementById('form-question-input').value
		if(!question){
			modal.style.display = "block";
			return document.getElementById('modal-info-panel').innerHTML = 'Empty question cannot be submitted';
		} else if (!question.trim()) {
			modal.style.display = "block";
			return document.getElementById('modal-info-panel').innerHTML = 'Empty question cannot be submitted';
		}
		postQuestionHandler(document.getElementById('form-question-input').value);
		})
	})
logoutBtn.addEventListener('click', (e) => {
	e.preventDefault();
	localStorage.removeItem('jwtoken')
	window.location.assign('./index.html');
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