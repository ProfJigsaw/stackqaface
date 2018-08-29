// Helper to remove duplicates from an array
const removeArrayDuplictes = (arr) => {
  if (arr.length < 2) {
    return arr;
  } else {
    arr = arr.sort((a,b) => a - b);
    let currentNum = -Infinity;
    fixedArr = [];
    arr.map(num => {
      if (num !== currentNum) {
        currentNum = num;
        fixedArr.push(num);
      }
    });
    return fixedArr;
  }
}

// Helper to make questions
const makeQuestion = (qobj) => {
	return `
		<div id="questions">
      <p> User: <strong>${qobj.username}</strong> asked</p>
      <h3><a class="question-item" questionid="${qobj.questionid}" href="#">${qobj.question}</a></h3>
      <button class="delete-question" questionid="${qobj.questionid}">Delete this question</button>
    </div>
	`;
}

// Helper to make questions
const makeMyQuestion = (qobj) => {
	return `
		<div id="questions">
      <p> User: <strong>You</strong> asked</p>
      <h3><a class="question-item" questionid="${qobj.questionid}" href="#">${qobj.question}</a></h3>
      <button class="delete-question" questionid="${qobj.questionid}">Delete this question</button>
    </div>
	`;
}

// helper function to get question thread
const questionThread = (id) => {
	fetch(`https://nvc-stackqa.herokuapp.com/api/v1/questions/${id}`, {
	  method: 'get',
	  headers: {
	  	Accept: 'application/json',
	  	Authorization: `header ${localStorage.getItem('jwtoken')}`
	  }
  })
	.then((response) => {
    response.json()
    .then((data) => {
    	if(data.getstate === true){
    		if(data.astack) {
		      	mainContent.innerHTML =  `
		      		<div id="questions">
				      <p> User: <strong>${data.qstack[0].username}</strong> asked</p>
				      <h3 id="question-returned" questionid="${data.qstack[0].questionid}">${data.qstack[0].question}</h3>
				      </div>
				      ${handleAnswers(data.astack)}
				      <div id="add-answer">
		            <form method="post" action="/api/v1/questions/{questions.questionId}/answers">
		              <textarea type="text" name="answer" id="form-answer-input" required></textarea>
		              <br>
		              <input type="submit" value="Add answer" id="add-answer-button" name="submit" />
		            </form>
		          </div>
				     `;
    		} else {
    			mainContent.innerHTML = `
			      <div id="questions">
			      <p> User: <strong>${data.qstack[0].username}</strong> asked</p>
			      <h3 id="question-returned" questionid="${data.qstack[0].questionid}">${data.qstack[0].question}</h3>
			      </div>		      
			      <div id="add-answer">
	            <form method="post" action="/api/v1/questions/{questions.questionId}/answers">
	              <textarea type="text" name="answer" id="form-answer-input" required></textarea>
	              <br>
	              <input type="submit" value="Add answer" id="add-answer-button" name="submit" />
	            </form>
	          </div>
	    		`;
    		}
    		createPostAnswerLink();
    		acceptAnswerLink();
    	}
    });
	})
	.catch((err) => console.log(err))
}

// Helper to handle loading of returned if available
const handleAnswers = (arr) => {
	let returnString = '';
	arr.map((ans) => {
		returnString += `
    	<div class="answers ${ans.state === true ? 'accepted' : ''}">
        <strong id="username">${ans.username}</strong> answered:<p> ${ans.answer}
        <form method="#" action="#">
            <strong>
                <button questionid="${ans.questionid}" answerid="${ans.answerid}" class="accept-answer">Accept Answer</button>
            </strong>
        </form>
        <div class="votes">
            <a href="#">Upvote</a>
            <span>${ans.upvotes}</span>
            <a href="#">Downvote</a>
            <span>${ans.downvotes}</span>
        </div>
      </div>
		`;
	})
	return returnString;
}

// Helper function to add event to post answer
const createPostAnswerLink = () => {
	const postAnswerBtn = document.getElementById('add-answer-button');
	postAnswerBtn.addEventListener('click', (e) => {
		e.preventDefault();
		if (!document.getElementById('form-answer-input').value) {
			modal.style.display = "block";
			return document.getElementById('modal-info-panel').innerHTML = 'You must enter an answer to submit!';
		}
		if (!document.getElementById('form-answer-input').value.trim()) {
			modal.style.display = "block";
			return document.getElementById('modal-info-panel').innerHTML = 'Your Entry is still empty!';
		}
		let id = document.getElementById('question-returned').getAttribute('questionid');
		postAnswerHelper(id);
	})
}

// Helper function to add event to accept-answer button
const acceptAnswerLink = () => {
	const acceptBtn = document.querySelectorAll('.accept-answer');
		acceptBtn.forEach((node) => {
			node.addEventListener('click', (e) => {
			e.preventDefault();
			let qid = e.target.getAttribute('questionid');
			let aid = e.target.getAttribute('answerid');
			acceptAnswerHandler(qid, aid);
		})
	})
}

// Heler to accept a particular answer
const acceptAnswerHandler = (qid, aid) => {
		fetch(`https://nvc-stackqa.herokuapp.com/api/v1/questions/${qid}/answers/${aid}`, {
		method: 'put',
		headers : { 
			'Content-Type': 'application/json',
			'Accept': 'application/json',
			'Authorization' : `header ${localStorage.getItem('jwtoken')}`
		}
	})
	.then((response) => {
		response.json()
		.then((data) => {
			questionThread(qid);
			modal.style.display = "block";
			return document.getElementById('modal-info-panel').innerHTML = data.msg;
		})
		.catch((err) => console.log(err));
	});
}

// helper to post an answer using fetch API tool
const postAnswerHelper = (id) => {
	fetch(`https://nvc-stackqa.herokuapp.com/api/v1/questions/${id}/answers`, {
		method: 'post',
		headers : { 
			'Content-Type': 'application/json',
			'Accept': 'application/json',
			'Authorization': `header ${localStorage.getItem('jwtoken')}`
		},
		body: JSON.stringify({
			"answer": document.getElementById('form-answer-input').value
		})
	})
	.then((response) => {
		response.json()
		.then((data) => {
			if (data.loginstate === true) {
				modal.style.display = "block";
				document.getElementById('modal-info-panel').innerHTML = data.msg;
			} else {
				questionThread(id);
				modal.style.display = "block";
				document.getElementById('modal-info-panel').innerHTML = data.msg;
			}
		})
		.catch((err) => console.log(err));
	});
}

// Helper function to add event listeners to all add questions links
const createLinkHandlers = () => {
	let x = document.querySelectorAll(".question-item");
	x.forEach((node) => {
		node.addEventListener('click', (e) => {
			e.preventDefault();
			let id = e.target.getAttribute('questionid');
			questionThread(id);
		})
	})
}

// Helper function to get all questions and update the main content container
const getAllQuestions = () => {
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
      let questionList = '';
      data.qstack.reverse().map((question) => {
      	questionList += makeQuestion(question);
      })
      mainContent.innerHTML = questionList;
      createLinkHandlers();
      deleteQuestionHook();
    });
	})
	.catch((err) => console.log(err))
}

// A handler for creating link handlers to delete
const deleteQuestionHook = () => {
	let delBtns = document.querySelectorAll('.delete-question');
	delBtns.forEach((node) => {
		node.addEventListener('click', (e) => {
			e.preventDefault();
			deleteQuestionHandler(e.target.getAttribute('questionid'));
		})
	})
}

// Handler to delete a particular question
const deleteQuestionHandler = (id) => {
	fetch(`https://nvc-stackqa.herokuapp.com/api/v1/questions/${id}`, {
		method: 'delete',
		headers : { 
			'Content-Type': 'application/json',
			'Accept': 'application/json',
			'Authorization' : `header ${localStorage.getItem('jwtoken')}`
		}
	})
	.then((response) => {
		response.json()
		.then((data) => {
			getAllQuestions();
			modal.style.display = "block";
			return document.getElementById('modal-info-panel').innerHTML = data.msg;
		})
		.catch((err) => console.log(err));
	});
}

// Post question handler
const postQuestionHandler = (qentry) => {
		fetch('https://nvc-stackqa.herokuapp.com/api/v1/questions', {
		method: 'post',
		headers : { 
			'Content-Type': 'application/json',
			'Accept': 'application/json',
			'Authorization' : `header ${localStorage.getItem('jwtoken')}`
		},
		body: JSON.stringify({
			"question": qentry
		})
	})
	.then((response) => {
		response.json()
		.then((data) => {
			modal.style.display = "block";
			getAllQuestions();
			return document.getElementById('modal-info-panel').innerHTML = data.msg;
		})
		.catch(err => console.log(err));
	});
}
