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
    document.getElementById('username-root').innerHTML = data.username;
  });
})
.catch(err => console.log(err))

const topQBtn = document.getElementById('top-question');
const searcher = document.getElementById('search-input');
const logoutBtn = document.getElementById('logout-link');
const myAskedQBtn = document.getElementById('my-asked-question');
const mainContent = document.getElementById('main-content-container');
const myAnsweredQBtn = document.getElementById('my-answered-question');

myAskedQBtn.addEventListener('click', (e) => {
  e.preventDefault();
  modal.style.display = "block";
  document.getElementById('modal-info-panel').innerHTML = 'Loading questions you asked on this platform ...';
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
        modal.style.display = "block";
        document.getElementById('modal-info-panel').innerHTML = data.message;
        mainContent.innerHTML = questionList;
        createLinkHandlers();
        deleteQuestionHook();
      } else {
        modal.style.display = "block";
        document.getElementById('modal-info-panel').innerHTML = 'You have no questions, try adding some';
      }
    });
  })
  .catch((err) => console.log(err))
})

// get questions that user has contributed to
myAnsweredQBtn.addEventListener('click', (e) => {
  e.preventDefault();
  modal.style.display = "block";
  document.getElementById('modal-info-panel').innerHTML = 'Loading questions you\'ve contributed to ...';
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
        modal.style.display = "block";
        document.getElementById('modal-info-panel').innerHTML = 'No contributions made yet!';
      } else {
        let qResTo = [];
        ansd = [];
        data.data.answers.map((ans) => {
          ansd.push(ans.questionid);
        })
        ansd = removeArrayDuplictes(ansd);
        ansd.map((id) => {
          data.data.questions.map((question) => {
            if (question.questionid === id) {
              qResTo.push(question);
            }
          });
        });
        let questionList = '';
        qResTo.reverse().map((question) => {
          questionList += makeQuestion(question);
        });
        modal.style.display = "block";
        document.getElementById('modal-info-panel').innerHTML = data.message;
        mainContent.innerHTML = questionList;
        createLinkHandlers();
        deleteQuestionHook();
      }
    });
  })
  .catch(err => console.log(err))
})

// Get the top question on the platform

// Logout handler, clear toke and redirect to the home screen
logoutBtn.addEventListener('click', (e) => {
	e.preventDefault();
	localStorage.removeItem('jwtoken')
	window.location.assign('./index.html');
});

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
          let found = data.questions.reverse();
          let questionList = '';
          let foundArray = [];
          found.map((qobj) => {
            if (
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

const modal = document.getElementById('info');
const span = document.getElementsByClassName("cancel")[0];

span.onclick = () => {
    modal.style.display = "none";
}

window.onclick = (event) => {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}