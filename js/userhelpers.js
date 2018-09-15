/* Helper to serve up information */
const serve_info_helper = (msg) => {
  server_modal.style.display = "block";
  return document.getElementById('modal-info-panel').innerHTML = msg;
}

// Helper to make questions
const makeQuestion = (qobj) => {
  return `
    <div class="question-container">
      <div class="question-card">
        <div class="side-bar"></div>
        <div class="main-question-bar" questionid="${qobj.questionid}">
          ${qobj.title}
        </div>
        <button class="delete-question" questionid="${qobj.questionid}">Delete</button>
      </div>
    </div>
  `;
}

// Helper to make custom user questions
const makeMyQuestion = (qobj) => {
  return `
    <div class="question-container">
      <div class="question-card">
        <div class="side-bar"></div>
        <div class="main-question-bar" questionid="${qobj.questionid}">
          <strong>You </strong>asked: ${qobj.title}
        </div>
        <button class="delete-question" questionid="${qobj.questionid}">Delete</button>
      </div>
    </div>
  `;
}

// Post question handler
const postQuestionHandler = (qentry, qtitle) => {
  mainContent.innerHTML = `<img src="./assets/loader.gif" alt="loader" id="loader">`;
    fetch('https://nvc-stackqa.herokuapp.com/api/v1/questions', {
    method: 'post',
    headers : { 
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization' : `header ${localStorage.getItem('jwtoken')}`
    },
    body: JSON.stringify({
      "question": qentry,
      "title": qtitle,
    })
  })
  .then((response) => {
    response.json()
    .then((data) => {
      getAllQuestions();
      return serve_info_helper(data.message);
    })
    .catch(err => console.log(err));
  });
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
      data.questions.reverse().map((question) => {
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
      return  serve_info_helper(data.message);
    })
    .catch((err) => console.log(err));
  });
}

// Helper function to add event listeners to all add questions links
const createLinkHandlers = () => {
  let x = document.querySelectorAll(".main-question-bar");
  x.forEach((node) => {
    node.addEventListener('click', (e) => {
      e.preventDefault();
      let id = e.target.getAttribute('questionid');
      mainContent.innerHTML = `<img src="./assets/loader.gif" alt="loader" id="loader">`;
      questionThread(id);
    })
  })
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
      if(data.success === true){
        if(data.data.answers) {
            mainContent.innerHTML =  `
              <div class="question-container thread">
                <div class="question-card thread">
                  <div class="side-bar"></div>
                  <div class="main-question-bar thread" questionid="${data.data.question[0].questionid}">
                    ${data.data.question[0].username}: ${data.data.question[0].title}
                  </div>
                </div>
              </div><br>

              <div id="question-full-body">
                ${data.data.question[0].question}
              </div>

              ${handleAnswers(data.data.answers)}

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
            <div class="question-container thread">
              <div class="question-card thread">
                <div class="side-bar"></div>
                <div class="main-question-bar thread" questionid="${data.data[0].questionid}">
                  ${data.data[0].username}: ${data.data[0].title}
                </div>                
              </div>
            </div>

            <div id="question-full">
              ${data.data[0].question}
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
      return  serve_info_helper(data.message);
    })
    .catch((err) => console.log(err));
  });
}

// Helper to handle loading of returned if available
const handleAnswers = (arr) => {
  let returnString = '';
  arr.map((ans) => {
    returnString += `
      <div class="answers">
        <div class="answer-card">
        
          <div class="side-bar ${ans.state === true ? 'accepted' : ''}">
            
            <div class="arrow-up" href="#"></div>
            <div id="score">${ans.upvotes - ans.downvotes}</div>
            <div class="arrow-down" href="#"></div>

          </div>

          <div class="main-answer-bar">
            <strong id="username">${ans.username}</strong> answered:<p> ${ans.answer}
          </div>

          <div class="accept-bar">
            <button questionid="${ans.questionid}" answerid="${ans.answerid}" class="accept-answer">Accept</button>
          </div>
          
        </div>
      </div>
    `;
  })
  return returnString;
}

// Helper function to add event to post answer
const createPostAnswerLink = () => {
  const postAnswerBtn = document.querySelector('#add-answer-button');
  postAnswerBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (!document.querySelector('#form-answer-input').value) {
      return  serve_info_helper('You must enter an answer to submit!');
    }
    if (!document.querySelector('#form-answer-input').value.trim()) {
      return  serve_info_helper('Your Entry is still empty!');
    }
    let id = document.querySelector('.main-question-bar').getAttribute('questionid');
    postAnswerHelper(id);
  })
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
      "answer": document.querySelector('#form-answer-input').value
    })
  })
  .then((response) => {
    response.json()
    .then((data) => {
      if (data.success === true) {
        questionThread(id);
        return serve_info_helper(data.message);
      } else {
        questionThread(id);
        return serve_info_helper(data.message);
      }
    })
    .catch((err) => console.log(err));
  });
}

// Helper to remove duplicates from an array
const removeArrayDuplicates = (arr) => {
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

/* helper to create links listeners on profile patch */
const createProfileLinkHandlers = () => {
  const userQuestionsbtn = document.querySelector('#my-questions')
  const userContributionBtn = document.querySelector('#my-contributions')
  const platformTopQuestion = document.querySelector('#top-question')

  userQuestionsbtn.addEventListener('click', (e) => {
    e.preventDefault();
    server_modal.style.display = "block";
    document.querySelector('#modal-info-panel').innerHTML = `
      Loading your questions ... 
      <img src="./assets/loader.gif" alt="profileloader" id="profileloader">
    `;
    fetch('https://nvc-stackqa.herokuapp.com/api/v1/questions/user/asked', {
      method: 'get',
      headers: {
        Accept: 'application/json',
        Authorization: `header ${localStorage.getItem('jwtoken')}` 
      }
    })
    .then((response) => {
      response.json()
      .then((data) => {
        if (data.success === true) {
          let questionList = '';
          data.questions.reverse().map((question) => {
            questionList += makeMyQuestion(question);
          })
          serve_info_helper(data.message);
          mainContent.innerHTML = questionList;
          createLinkHandlers();
          deleteQuestionHook();
        } else {
          server_modal.style.display = "block";
          document.querySelector('#modal-info-panel').innerHTML = 'You have no questions, try adding some';
        }
      });
    })
    .catch((err) => console.log(err))
  })

  userContributionBtn.addEventListener('click', (e) => {
    e.preventDefault();
    server_modal.style.display = "block";
    document.getElementById('modal-info-panel').innerHTML = `
      Loading questions you\'ve contributed to ...
      <img src="./assets/loader.gif" alt="profileloader" id="profileloader">
    `;
      fetch('https://nvc-stackqa.herokuapp.com/api/v1/questions/user/answered', {
      method: 'get',
      headers: {
        Accept: 'application/json',
        Authorization: `header ${localStorage.getItem('jwtoken')}`
      }
    })
    .then((response) => {
      response.json()
      .then((data) => {
        if (data.success === false) {
          server_modal.style.display = "block";
          return document.getElementById('modal-info-panel').innerHTML = 'You have no contributions yet! Try answering some questions.';
        } else {
          let qResTo = [];
          ansd = [];
          data.data.answers.map((ans) => {
            ansd.push(ans.questionid);
          })
          ansd = removeArrayDuplicates(ansd);
          ansd.map((id) => {
            data.data.questions.map((question) => {
              if (question.questionid === id) {
                qResTo.push(question);
              }
            });
          });
          if (qResTo.length === 0) {
            server_modal.style.display = "block";
            return document.getElementById('modal-info-panel').innerHTML = 'You have no contributions yet! Try answering some questions.';
          } else {
            let questionList = '';
            qResTo.reverse().map((question) => {
              questionList += makeQuestion(question);
            });
            serve_info_helper(data.message);
            mainContent.innerHTML = questionList;
            createLinkHandlers();
            deleteQuestionHook();
          }
        }
      });
    })
    .catch(err => console.log(err))
  })

  platformTopQuestion.addEventListener('click', (e) => {
    e.preventDefault()
    console.log('loading platforms top question...')
  })
}