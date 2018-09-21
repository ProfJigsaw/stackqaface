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
        createCommentLinks();
        createArrowLinks();
        createPostAnswerLink();
        acceptAnswerLink();
      }
    });
  })
  .catch((err) => console.log(err))
}

/* Helper to create hooks on the comment button */
const createCommentLinks = () => {
  let commentingBtn = document.querySelectorAll('.view-comments');

  commentingBtn.forEach((node) => {
    node.addEventListener('click', (e) => {
      e.preventDefault();
      let com_mod_container   = document.querySelector('#com-mod-con');
      let com_mod_background  = document.querySelector('.com-mod-bg');

      if (com_mod_container.classList.contains('out')) {
        com_mod_container.classList.remove('out');
      }
      if (com_mod_container.classList.contains('one')) {
        com_mod_container.classList.remove('one');
      }
      com_mod_container.classList.toggle('one');
      
      let username = e.target.getAttribute('username');
      let answer = e.target.getAttribute('answer').split('*#*#').join(' ');
      let qid = e.target.getAttribute('questionid');
      let aid = e.target.getAttribute('answerid');

      const commentTarget = document.querySelector('#comment-main-target');
      commentTarget.innerHTML = `
        <div class="avatar"><a href="#"><img src="assets/default.png" width="55" height="55" alt="default avatar"></a></div>
        <div class="cmmnt-content">
          <header><a href="#" class="userlink" questionid="${qid}" answerid="${aid}">${username}</a> - <span class="pubtype">answered</span></header>
          <p>${answer}</p>
        </div>
        <ul class="replies" id="main-reply-container"></ul>
      `;
      fetchReplies(qid, aid)
      
    })
  })
  
}

/* Handler for comments_-_answer replies */
const fetchReplies = (qid, aid) => {
  server_modal.style.display = "block";
  document.getElementById('modal-info-panel').innerHTML = `
    Please wait..... Loading comments for this answer
    <img src="./assets/loader.gif" alt="profileloader" id="profileloader">
  `;
  fetch(`https://nvc-stackqa.herokuapp.com/api/v1/questions/${qid}/answers/${aid}/comments`, {
    method: 'get',
    headers : { 
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  })
  .then((response) => {
    response.json()
    .then((data) => {
      if (data.comments.length == 0) {
        return serve_info_helper('There are no comments for this answer, close this modal and add some');
      }
      serve_info_helper('Comments loaded')
      let replyString = '';
      data.comments.map((reply) => {
        replyString += makeReplies(reply);
      })
      const replyTarget = document.querySelector('#main-reply-container');
      replyTarget.innerHTML = replyString;
    })
    .catch((err) => console.log(err));
  });
}

/* Helper to make replies */
const makeReplies = (arr) => {
  return `<li class="cmmnt">
    <div class="avatar"><a href="#"><img src="assets/default.png" width="55" height="55" alt="default avatar"></a></div>
    <div class="cmmnt-content">
    <header><a href="#" class="userlink">${arr.username}</a> - <span class="pubtype">commented</span></header>
    <p>${arr.comment}</p>
    </div> 
  </li>
  `
}

/* Helper to post comments */
const postCommentsHandler = (qid, aid, comment) => {
  if (!comment || !comment.trim()) {
    return serve_info_helper('You need to enter some comment to proceed');
  }
  server_modal.style.display = "block";
  document.querySelector('#modal-info-panel').innerHTML = `
    Posting your comment ... 
    <img src="./assets/loader.gif" alt="profileloader" id="profileloader">
  `;
  fetch(`https://nvc-stackqa.herokuapp.com/api/v1/questions/${qid}/answers/${aid}/comments`, {
    method: 'post',
    headers : { 
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `header ${localStorage.getItem('jwtoken')}`
    },
    body: JSON.stringify({
      "comment": comment
    })
  })
  .then((response) => {
    response.json()
    .then((data) => {
      if (data.success === true) {
        fetchReplies(qid, aid);
        return serve_info_helper(data.message);
      } else {
        fetchReplies(qid, aid);
        return serve_info_helper(data.message);
      }
    })
    .catch((err) => console.log(err));
  });
}


/* Helper to create hooks on the voting arrows */
const createArrowLinks = () => {
  let arrowUpBtn = document.querySelectorAll('.arrow-up');
  let arrowDownBtn = document.querySelectorAll('.arrow-down');

  /* Adding the upvote event handler */
  arrowUpBtn.forEach(node => {
    node.addEventListener('click', (e) => {
      e.preventDefault();

      let qid = e.target.getAttribute('qId');
      let aid = e.target.getAttribute('ansId');

      /* Passing the question id and answer id of a particular question to upvote handler */
      upVoteHandler(qid, aid);
    })
  }) 

  /* Adding the downvote event handler */
  arrowDownBtn.forEach(node => {
    node.addEventListener('click', (e) => {
      e.preventDefault();

      let qid = e.target.getAttribute('qId');
      let aid = e.target.getAttribute('ansId');

      /* Passing the question id and answer id of a particular question to the downvote handler */
      downVoteHandler(qid, aid);
    })
  })
}

/* declaration of the upvote handler */
const upVoteHandler = (qid, aid) => {
  fetch(`https://nvc-stackqa.herokuapp.com/api/v1/questions/${qid}/${aid}/upvote`, {
    method: 'put',
    headers : { 
      'Content-Type': 'application/json',
      'Accept': 'application/json'
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

/* declaration of the downvote handler */
const downVoteHandler = (qid, aid) => {
  fetch(`https://nvc-stackqa.herokuapp.com/api/v1/questions/${qid}/${aid}/downvote`, {
    method: 'put',
    headers : { 
      'Content-Type': 'application/json',
      'Accept': 'application/json'
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
            
            <div class="arrow-up" href="#" qId="${ans.questionid}" ansId="${ans.answerid}"></div>
            <div id="score">${ans.upvotes - ans.downvotes}</div>
            <div class="arrow-down" href="#" qId="${ans.questionid}" ansId="${ans.answerid}"></div>

          </div>

          <div class="main-answer-bar">
            <strong id="username">${ans.username}</strong> answered:<p> ${ans.answer}
          </div>

          <div class="accept-bar">
            <button questionid="${ans.questionid}" answerid="${ans.answerid}" class="fa fa-check fa-2x accept-answer"></button>
            <button username=${ans.username} answer=${ans.answer.split(' ').join('*#*#')} questionid="${ans.questionid}" answerid="${ans.answerid}" class="fa fa-comments-o fa-2x view-comments"></button>
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
    e.preventDefault();
    server_modal.style.display = "block";
    document.getElementById('modal-info-panel').innerHTML = `
      Loading top question on the platform ...
      <img src="./assets/loader.gif" alt="profileloader" id="profileloader">
    `;
      fetch('https://nvc-stackqa.herokuapp.com/api/v1/questions/stack/topquestion', {
      method: 'get',
      headers: {
        Accept: 'application/json',
        Authorization: `header ${localStorage.getItem('jwtoken')}`
      }
    })
    .then((response) => {
      response.json()
      .then((data) => {
        let allaid = data.answers.map((answer) => answer.questionid);
        let modeId = modeFunc(allaid);
        let topQuestionArr = data.questions.filter((question) => question.questionid === modeId);
        if (topQuestionArr.length === 0) {
          return serve_info_helper('There was an error retrieving the top question');
        }
        serve_info_helper('Top question retrieved successfully');
        mainContent.innerHTML = makeQuestion(topQuestionArr[0]);
        createLinkHandlers();
        deleteQuestionHook();
      });

    })
    .catch(err => console.log(err))
  })
}

/* Helper function to find the mode element in an array of numbers */
const modeFunc = (arr) => {
  return arr.reduce((current, item) => {
    current.numMapping[item] = (current.numMapping[item] || 0) + 1;
    let val = current.numMapping[item];
    if (val > current.greatestFreq) {
      current.greatestFreq = val;
      current.mode = item;
    }
    return current;
  }, { mode: null, greatestFreq: -Infinity, numMapping: {} }).mode;
};