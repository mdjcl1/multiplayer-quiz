if (!JSON.parse(localStorage.getItem("isHostEdit"))) {
  localStorage.setItem("isHostEdit", false);
}

// global variable
let queAttemp = 0;
let totalQue = 0;
const regex = /^\s*$/;
let allData = [];

// -------------------------------------------------------------------------------------------

// element selectors
const allQuesBox = document.getElementById("allQuesBox");
const hostQuiz = document.getElementById("hostQuiz");
const addQues = document.getElementById("addQues");

// -------------------------------------------------------------------------------------------

// this if statement check whether any person visiting quizBlank page from setting page(createQuiz) or not
// if not, means if they are visiting using url then it redirect to setting page
// and isHostEdit ensure that if request is coming from host to edit question, so it will open for host
if (
  !document.referrer.toLowerCase().includes("createquiz") &&
  localStorage.getItem("isHostEdit") == "false"
) {
  window.location = "./createQuiz.html";
}

// fetching data from local storage
let noOfQue = Number(localStorage.getItem("noOfQue"));
const timeBtwQue = Number(localStorage.getItem("timeBtwQue"));
const aiOverlay = document.getElementById("aiOverlay");

// it check if blank card is not selected, then it AI will generate question
if (
  !localStorage.getItem("aiTopic").toLowerCase().includes("blank") &&
  // !localStorage.getItem("isHostEdit")
  localStorage.getItem("isHostEdit") == "false"
) {
  aiOverlay.classList.remove("hide");

  try {
    const aiGeneratedQuestions = await generateQuestionsPanda(
      localStorage.getItem("aiTopic"),
      noOfQue,
      "medium"
    );

    aiGeneratedQuestions.res.forEach((obj) => {
      createQuestion(
        obj.question,
        Object.values(obj.options),
        obj.options[obj.answer]
      );
      queAttemp += 1;
    });
    aiOverlay.classList.add("hide");
  } catch (e) {
    console.log(e);
    alert("Error in generating questions. Please try again.");
    localStorage.setItem("aiTopic", "blank");
    window.location = "../pages/createQuiz.html";
  }
}

document.getElementById("cancelAiQue").addEventListener("click", function () {
  aiOverlay.classList.add("hide");
  localStorage.setItem("aiTopic", "blank");
  window.location = "../pages/createQuiz.html";
});

// -------------------------------------------------------------------------------------------

// function to update number of questions filled out of total question
function updateCounter() {
  document.getElementById("counter").innerText = queAttemp + "/" + totalQue;
  // document.getElementById("counter").innerText = queAttemp + "/" + noOfQue;
  // if (queAttemp == noOfQue && noOfQue != 0) {
  if (queAttemp == totalQue && totalQue != 0) {
    addQues.classList.remove("hide");
    hostQuiz.classList.remove("hide");
  } else {
    hostQuiz.classList.add("hide");
  }
}

updateCounter();

// used to check input is blank or containing only whitespaces
// it take array of element, it does take html collection,  if there are html collection we need to convert into array
// if so, then it mark as red border
// and when user focus to that input then it will remove red mark
const checkBlankInput = function (arr, opts) {
  let flag = 0;
  // input field checking
  arr.forEach((el) => {
    if (regex.test(el.value)) {
      flag++;
      el.classList.add("error");
      el.addEventListener("focus", function () {
        el.classList.remove("error");
      });
    }
  });

  // options checking
  let x = true;
  [...opts].forEach((i) => {
    if (i.classList.contains("activeOption")) {
      x = false;
    }
  });

  if (x) {
    flag++;
    opts[0].parentElement.classList.add("error");
    opts[0].parentElement.addEventListener("click", function (e) {
      if (e.target.classList.contains("opts")) {
        opts[0].parentElement.classList.remove("error");
      }
    });
  }
};

// -------------------------------------------------------------------------------------------

function createQuestion(question = "", options = ["", "", "", ""], correctOpt) {
  totalQue += 1;
  const card = `
        <div class="quesBox">
          <div class="queSet">
            <p class="queSl">${totalQue}.</p>
            <input
              type="text"
              class="question"
              placeholder="Write Your Question"
              value="${question}"
            />
            <img
              src="../assests/queDrag.svg"
              alt="Drag question"
              class="queDrag"
            />
          </div>

          <div class="optionBox">
            <div class="queSet">
              <p class="optSl">A.</p>
              <input type="text" value="${
                options[0]
              }" class="questionOpt" placeholder="Option A" />
              <img
                src="../assests/optionDrag.svg"
                alt="Drag question"
                class="optionDrag"
              />
            </div>
            <div class="queSet">
              <p class="optSl">B.</p>
              <input type="text" value="${
                options[1]
              }" class="questionOpt" placeholder="Option B" />
              <img
                src="../assests/optionDrag.svg"
                alt="Drag question"
                class="optionDrag"
              />
            </div>
            <div class="queSet">
              <p class="optSl">C.</p>
              <input type="text" value="${
                options[2]
              }" class="questionOpt" placeholder="Option C" />
              <img
                src="../assests/optionDrag.svg"
                alt="Drag question"
                class="optionDrag"
              />
            </div>
            <div class="queSet">
              <p class="optSl">D.</p>
              <input type="text" value="${
                options[3]
              }" class="questionOpt" placeholder="Option D" />
              <img
                src="../assests/optionDrag.svg"
                alt="Drag question"
                class="optionDrag"
              />
            </div>
          </div>

          <div class="correctOptionBox">
            <p class="headingTitle">Choose Correct Option</p>
            <div class="correctOpt">
              <button class="opts ${
                correctOpt == options[0] ? "activeOption" : ""
              }">A</button>
              <button class="opts ${
                correctOpt == options[1] ? "activeOption" : ""
              }">B</button>
              <button class="opts ${
                correctOpt == options[2] ? "activeOption" : ""
              }">C</button>
              <button class="opts ${
                correctOpt == options[3] ? "activeOption" : ""
              }">D</button>
            </div>
          </div>
        </div>`;

  // adding question card to allQuesBox and it will visible to screen
  allQuesBox.insertAdjacentHTML("beforeend", card);

  updateCounter();
}

// this will create number of question set, specified by user

if (localStorage.getItem("isHostEdit") == "true") {
  const queData = JSON.parse(localStorage.getItem("allData"));

  queData.forEach((obj) => {
    createQuestion(
      obj.question,
      obj.options,
      obj.correctOption
      // Number.parseInt(obj.correctOption)
    );
  });

  hostQuiz.getElementsByClassName(
    "hostImg"
  )[0].innerHTML = `<img src="../assests/host.svg" /> Update`;
} else {
  if (localStorage.getItem("aiTopic").toLowerCase().includes("blank")) {
    for (let i = 1; i <= noOfQue; i++) {
      createQuestion();
    }
  }
}

// -------------------------------------------------------------------------------------------

// All element selector
const correctOptions = document.querySelectorAll(".correctOpt");
const quesBoxs = document.querySelectorAll(".quesBox");
const question = document.querySelectorAll(".question");
const queDeleteBtn = document.getElementById("queDeleteBtn");

// -------------------------------------------------------------------------------------------

// this will select option and mark as green
allQuesBox.addEventListener("click", function (e) {
  // option selecttion
  if (e.target.classList.contains("opts")) {
    const p = e.target.closest(".correctOpt");

    // it remove green mark from option
    [...p.children].forEach((el) => {
      el.classList.remove("activeOption");
    });

    e.target.classList.add("activeOption");
  }
});

let inputs = 0;
let prevInputs = 1;
let currentInput = 1;

allQuesBox.addEventListener("focusin", function (e) {
  inputs = e.target.closest(".quesBox");
  if (prevInputs == 1) {
    prevInputs = inputs;
    currentInput = inputs;
  }

  if (inputs != prevInputs) {
    checkBlankInput(
      [...prevInputs.getElementsByTagName("input")],
      prevInputs.getElementsByTagName("button")
    );
    prevInputs = inputs;
  }

  // delete button event handler attached to question input only if question set are more than 4
  if (e.target.classList.contains("question") && totalQue > 4) {
    deleteQues = e.target.closest(".quesBox");
    queDeleteBtn.classList.remove("invisible");
    e.target.addEventListener("blur", function (e) {
      queDeleteBtn.classList.add("invisible");

      // it remove attach event listener from same element
      e.target.removeEventListener("blur", function () {
        queDeleteBtn.classList.add("invisible");
      });
    });
  }
});

// addQues button when clicked, it add question card at the end
addQues.addEventListener("click", function () {
  if (totalQue < 50) {
    const sls = document.querySelectorAll(".question");
    hostQuiz.classList.add("hide");
    console.log(34);

    // createQuestion(sls.length + 1);
    createQuestion();
    // noOfQue += 1;
    updateCounter();
    localStorage.setItem("noOfQue", totalQue);
    if (totalQue == 50) {
      addQues.classList.add("hide");
    }
  }
});

// -------------------------------------------------------------------------------------------

// host button, when clicked it extract data from all questions card
// including question, options and correct option
// and set to allData variable
// allData variable contains array of objects
// each object contain(keys) question, options and correctOption
// this script also work, if hoster want to update the data, when edit button is clicked from lobby
// if isHostEdit is true, it means host want to update data
hostQuiz.addEventListener("click", function () {
  const loaderBox = document.getElementById("loaderBox");
  const isHostEdit = localStorage.getItem("isHostEdit");
  hostQuiz.disabled = true;
  allData = [];
  loaderBox.classList.remove("hide");
  const quesBox = document.querySelectorAll(".quesBox");
  hostQuiz.getElementsByTagName("p")[0].innerText =
    isHostEdit == "true" ? "Updating" : "Hosting";

  let data = {};
  let options = [];
  quesBox.forEach((el) => {
    // setting question
    data["question"] = el.getElementsByClassName("question")[0].value;

    // setting all options
    [...el.getElementsByClassName("questionOpt")].forEach((opt) => {
      options.push(opt.value);
    });

    // selecting correct option and passing index of correct option
    [...el.getElementsByTagName("button")].forEach((cr, i) => {
      if (cr.classList.contains("activeOption")) {
        // data["correctOption"] = i;
        data["correctOption"] = options[i];
      }
    });

    data["options"] = options;

    // setting data to main variable
    allData.push(data);
    data = {};
    options = [];
  });

  localStorage.setItem("allData", JSON.stringify(allData));

  if (isHostEdit == "false") {
    localStorage.setItem("user", "host");
    window.location = "../pages/lobby.html";
  } else if (isHostEdit == "true") {
    // loaderBox.classList.remove("hide");
    localStorage.setItem("isHostEdit", "false");
    alert("Update Successful! \nClick OK to close the tab.");
    window.close();
  }
});

let deleteQues = null;

// it delete question card
queDeleteBtn.addEventListener("mousedown", function () {
  deleteQues.classList.add("remove");
  setTimeout(() => {
    deleteQues.remove();
    const queSl = document.querySelectorAll(".queSl");
    queSl.forEach((el, i) => {
      el.innerText = i + 1;
    });
  }, 300);
  queDeleteBtn.classList.add("invisible");
  totalQue -= 1;
  if (queAttemp > 0) queAttemp -= 1;
  updateCounter();
  localStorage.setItem("noOfQue", totalQue);

  if (totalQue < 50) {
    addQues.classList.remove("hide");
  }
});

//it check, if click is outside the box or not,
// if it is outside then it check that card input and option
// and mark as red if not filled
const x = document.getElementById("allQuesBox");
x.addEventListener("mousedown", function (e) {
  if (
    (e.target.classList.contains("allQuesBox") ||
      e.target.classList.contains("quesBox")) &&
    prevInputs != 1
  ) {
    checkBlankInput(
      [...prevInputs.getElementsByTagName("input")],
      prevInputs.getElementsByTagName("button")
    );

    prevInputs = inputs;
  }
});

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++

// Global variable to track the number of filled question cards
let filledCards = 0;

// Function to check if a question card is fully filled
function checkCardFilled(card) {
  const questionInput = card.querySelector(".question");
  const options = card.querySelectorAll(".questionOpt");
  const correctOptions = card.querySelectorAll(".opts");

  // Check if the question input is filled, all options are filled, and a correct option is selected
  const isQuestionFilled = questionInput.value.trim() !== "";
  const areOptionsFilled = [...options].every((opt) => opt.value.trim() !== "");
  const isOptionSelected = [...correctOptions].some((opt) =>
    opt.classList.contains("activeOption")
  );

  // Return true if all conditions are met
  return isQuestionFilled && areOptionsFilled && isOptionSelected;
}

// Function to update the filled card counter
function updateFilledCardsCount() {
  const allCards = document.querySelectorAll(".quesBox");
  filledCards = Array.from(allCards).filter((card) =>
    checkCardFilled(card)
  ).length;
  queAttemp = filledCards;
  updateCounter();
}

// Event delegation for question inputs, option inputs, and correct option buttons
document.addEventListener("input", function (event) {
  const target = event.target;

  if (target.matches(".question, .questionOpt")) {
    updateFilledCardsCount();
  }
});

// Event delegation for correct option button click (to mark selected option)
document.addEventListener("click", function (event) {
  const target = event.target;

  if (target.matches(".opts")) {
    // Mark the clicked option as active, and remove active class from others
    const correctOptions = target.closest(".quesBox").querySelectorAll(".opts");
    correctOptions.forEach((opt) => opt.classList.remove("activeOption"));
    target.classList.add("activeOption");

    // Update filled card count
    updateFilledCardsCount();
  }
});

// Initial update of filled cards count when page loads
document.addEventListener("DOMContentLoaded", updateFilledCardsCount);

async function generateQuestionsPanda(topic, count, difficulty) {
  const API_KEY = "AIzaSyA9JSjMrccMPFdnU59dyCYFaz0FpoVCtT8";

  const Prompt = `
        Generate a given number of text based quiz question (no code, image or special formatting only use simple text) on given topic in given JSON format
        Keep the options short and simple

        Topic: ${topic}
        Number of Questions: ${count}
        Difficulty: ${difficulty}

        Output Format: {
            status: "success",
            res: [
                {
                    question_no: 1,
                    question: "",
                    options: {
                        a: "",
                        b: "",
                        c: "",
                        d: ""
                    },
                    answer: ""
                }
            ]
        }

        Important: Make sure the number of questions generated is equal to the count provided and don't repeat same format of questions or options. Make sure each question is asked in a different way and options are different for each question.
        
        If the topic is invalid, irrelevant or inappropriate, or any other issue, the response should be:
        {
            status: "error",
            message: "Reason for the error"
        }
    `;

  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
      API_KEY,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: Prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 1,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
          responseMimeType: "application/json",
        },
      }),
    }
  );

  const data = await response.json();
  console.log(data.candidates);
  const textAnswer = data.candidates[0].content.parts[0].text;
  return JSON.parse(textAnswer);
}
