"use strict";

import { joinRoom, selfId } from "./firebase.js";
import multiavatar from "./multiAvatar.js";

let joinedPlayers = {};
const lobbyCode = localStorage.getItem("lobbyCode");
const playerControls = {};
let hostId = null;
let quizTime = null;

const user = localStorage.getItem("user");
let quesNumber = 0;

const hostExitBox = document.getElementById("hostExitBox");
const playerExitMsg = document.getElementById("playerExitMsg");
const hostKickoutMsg = document.getElementById("hostKickoutMsg");
const hostQuiz = document.getElementById("hostQuiz");
const hostingOverlay = document.getElementById("hostingOverlay");
const hostCancel = document.getElementById("hostCancel");
const readyBox = document.getElementById("readyBox");
const hostLoading = document.getElementById("hostLoading");
const quizGround = document.getElementById("quizGround");
const lobbyEdit = document.getElementById("lobbyEdit");
const mainContainer = document.getElementById("mainContainer");

let oneQueTime;
let timeBtwQue;

// const oneQueTime = localStorage.getItem("oneQueTime");
// const timeBtwQue = localStorage.getItem("timeBtwQue");

const player = {};
let isEdit = false;
let currentUser;
let avatarSeed;

const allData = localStorage.getItem("allData");

let queObj = JSON.parse(allData);

if (user === "player") {
  await joinLobbyPanda(lobbyCode);
}

// it is used to capitalize the first letter of every word
const wordCapitalizer = function (nameArr) {
  let nam = "";
  nameArr.forEach((el) => {
    const fletter = el.charAt(0).toUpperCase();
    nam += fletter + el.substring(1) + " ";
  });
  return nam;
};

// this function is used to update the player details
const updatePlayer = function (playerId, playerName, avatarSeed, status) {
  const players = document.querySelectorAll(".playerBox");
  players.forEach((el) => {
    if (playerId == el.dataset.id) {
      el.getElementsByClassName(
        "avatarBox"
      )[0].style.backgroundImage = `url(${seedToUrl(
        avatarSeed
      )}), url("../assests/user.png")`;
      el.getElementsByClassName("playerName")[0].innerText = playerName;
      el.getElementsByClassName("status")[0].innerText = wordCapitalizer([
        status,
      ]);
      if (el.classList.contains("online") && status != "online") {
        el.classList.remove("online");
        el.classList.add("offline");
      } else if (el.classList.contains("offline") && status != "offline") {
        el.classList.add("online");
        el.classList.remove("offline");
      }
    }
  });
};

// this function is used to remove the player from game
const removePlayer = function (playerId) {
  const players = document.querySelectorAll(".playerBox");
  players.forEach((el) => {
    if (playerId == el.dataset.id) {
      el.classList.add("remove");
      setTimeout(() => {
        // e.target.closest(".playerBox").remove();
        el.remove();
        const x = joinedPlayerBox.children.length;
        if (x == 0) hidePlayer();
        if (x > -1) {
          document.getElementById("playerCount").innerHTML =
            `${user == "player" ? "You and " : ""}` +
            (x - (user == "host" ? 0 : 1)) +
            ` &nbsp;${x > 2 ? "Players" : "Player"} Joined`;

          // if (user == "player") {
          //   window.location = "../pages/joinRoom.html";
          // }
          // document.getElementById("playerCount").innerHTML =
          //   x + " &nbsp;Players Joined";
        }
      }, 300);
    }
  });
};
// <img src=${avatarUrl} alt="avatar" class="avatar" />

const joinedPlayerBox = document.getElementById("joined-player-box");
const addPlayer = function (
  id,
  name,
  avatarSeed,
  status,
  isOtherPlayer = true
) {
  const player = `
          <div class="playerBox ${status}" data-id="${id}">
            <div class="avatarBox" style="background-image: url(${seedToUrl(
              avatarSeed
            )}), url('../assests/user.png')">
            </div>
            <div class="playerNameBox" >
              <p class="playerName">${name}</p>
              <p class="status">${wordCapitalizer([status])}</p>
            </div>
            <button class="kickOutBtnBox">
              <img src="../assests/kickOut.svg" alt="kick out button" class="kickOutBtn hide" />
              <img src="../assests/edit.svg" alt="edit button" class=${
                isOtherPlayer ? "hide" : "playerEdit"
              } />
            </button>
          </div>`;
  joinedPlayerBox.insertAdjacentHTML("beforeend", player);
  const x = joinedPlayerBox.children.length;
  if (x > 0) {
    if (x == 1 && user == "player") {
      document.getElementById("playerCount").innerHTML =
        user == "player" ? "You Joined" : "";
    } else {
      document.getElementById("playerCount").innerHTML =
        `${user == "player" ? "You and " : ""}` +
        (x - (user == "host" ? 0 : 1)) +
        ` &nbsp;${
          user == "host"
            ? x > 1
              ? "Players"
              : "Player"
            : x > 2
            ? "Players"
            : "Player"
        } Joined`;
      // ` &nbsp;${x > 2 ? "Players" : "Player"} Joined`;
    }
  }
};

// this will display all player window and hide waiting message
const DisplayPlayer = function () {
  document.getElementById("allplayer").classList.remove("hide");
  // document.getElementById("hostQuiz").classList.remove("hide");
  hostQuiz.classList.remove("hide");
  document.getElementById("waitingBox").classList.add("hide");
  document.getElementById("quite").classList.add("hide");
};

// this will hide all player and display waiting message
const hidePlayer = function () {
  document.getElementById("allplayer").classList.add("hide");
  // document.getElementById("hostQuiz").classList.add("hide");
  hostQuiz.classList.add("hide");
  document.getElementById("waitingBox").classList.remove("hide");
  document.getElementById("quite").classList.remove("hide");
};

const setAvatar = function () {
  const [seed, avatarUrl] = getNewAvatarPanda();
  avatarSeed = seed;
  document.getElementById(
    "newUserAvatarBox"
  ).style.backgroundImage = `url(${avatarUrl}), url(../assests/user.png)`;
};

// when all player synced then this function will start countDown
// when host start quiz
// it take time in seconds
const playersSynced = function (timeInSec) {
  oneQueTime = localStorage.getItem("oneQueTime");
  timeBtwQue = localStorage.getItem("timeBtwQue");
  document.getElementById(
    "quizGroundAvatar"
  ).style.backgroundImage = `url(${seedToUrl(
    avatarSeed
  )}), url(../assests/user.png)`;
  hostCancel.classList.add("hide");
  readyBox.classList.remove("hide");
  hostLoading.classList.add("hide");
  if (user == "player") {
    hostingOverlay.classList.remove("hide");
  }
  const start3 = document.getElementById("start3");
  startCountdown(start3, timeInSec);

  // time set by host, then it call startQuiz to start the quiz

  setTimeout(() => {
    startQuiz();
  }, timeInSec * 1000);
};

const addPlayerToLobby = function (
  id,
  name,
  avatarSeed,
  status,
  isOtherPlayer = true
) {
  addPlayer(id, name, avatarSeed, status, isOtherPlayer);
  if (joinedPlayerBox.children.length > 0) {
    DisplayPlayer();
  }
};

if (user === "player") {
  setAvatar();
  document.getElementById("newUserBox").classList.remove("hide");
} else if (user === "host") {
  // const mainContainer = document.getElementById("mainContainer");
  mainContainer.classList.add("hoster");
  mainContainer.classList.remove("hide");
  document.getElementById("waitingBox").classList.remove("hide");
  // document.getElementById("hostQuiz").classList.add("hide");
  hostQuiz.classList.add("hide");

  // addPlayer(2, "chote", "/assests/image1.png", "offline");
}

const copy = document.getElementById("copy");
const share = document.getElementById("share");

// new avatar generation
function getNewAvatarPanda() {
  const randomSeed = Math.floor(Math.random() * 10000);

  const svgCode = multiavatar(randomSeed);
  const blob = new Blob([svgCode], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);

  return [randomSeed, url];
}

// DisplayPlayer();

// assign code
const showJoiningCode = function (code) {
  document.getElementById("code").value = code;
};

// it is used to set which player is going to kick out the from lobby
let kickOutId = null;
joinedPlayerBox.addEventListener("click", function (e) {
  if (e.target.classList.contains("kickOutBtn")) {
    const card = e.target.closest(".playerBox");
    if (user == "host") {
      playerExitMsg.classList.remove("hide");
      hostKickoutMsg.classList.remove("hide");
      document.getElementById("hostKickoutPlayer").innerText =
        card.getElementsByClassName("playerName")[0].innerText;
      kickOutId = card.dataset.id;
    }
  }
});

// before kicking out the player from labby it will ask host
// whether you want to kick out yes or not
// if click on yes then it remove the player and hide the message box
const kickYes = document.getElementById("kickYes");

kickYes.addEventListener("click", function () {
  removePlayer(kickOutId);
  delete joinedPlayers[kickOutId];
  playerControls.sendRequest("GET_OUT", kickOutId);
  playerControls.sendPlayerDetails(joinedPlayers);
  kickOutId = null;
  hostKickoutMsg.classList.add("hide");
  playerExitMsg.classList.add("hide");
});

// if clicked on no then it just hide the message box
const kickNo = document.getElementById("kickNo");
kickNo.addEventListener("click", function () {
  hostKickoutMsg.classList.add("hide");
  playerExitMsg.classList.add("hide");
  kickOutId = null;
});

// addPlayer(2, "JCL", getNewAvatarPanda(), "online");
// addPlayer(2, "chote", "/assests/image1.png", "offline");

// function to copy code
const copyCode = async function () {
  const code = document.getElementById("code");
  code.select();
  code.setSelectionRange(0, 99999);
  document.execCommand("copy");
};

copy.addEventListener("click", copyCode);

share.addEventListener("click", function () {
  if (navigator.share) {
    navigator.share({
      title: "Code",
      url: "?code=" + document.getElementById("code").value,
    });
  } else {
    console.log("else");
  }
});

// when new player joining
// this function run
const addNewPlayer = document.getElementById("addNewPlayer");
addNewPlayer.addEventListener("click", async function () {
  let playerName = document.getElementById("newPlayerName");
  // const avatarImg = document.getElementById("newUserAvatarBox").src;
  const newUserBox = document.getElementById("newUserBox");
  const waitingBox = document.getElementById("waitingBox");
  const regex = /^\s*$/;

  if (regex.test(playerName.value)) {
    playerName.classList.add("error");
    playerName.addEventListener("focus", function () {
      playerName.classList.remove("error");
    });
    return;
  }
  const nameArr = playerName.value.trim();
  currentUser = nameArr;
  // const nameArr = playerName.value.trim().replaceAll(/ \s*/g, " ").split(" ");

  joinedPlayers[selfId] = {
    name: playerName.value,
    avatar: avatarSeed,
    score: 0,
    status: "online",
    rank: 0,
  };

  if (!isEdit) {
    // addPlayer(selfId, wordCapitalizer(nameArr), avatarImg, "online", false);
    // player.name = wordCapitalizer(nameArr);
    addPlayer(selfId, nameArr, avatarSeed, "online", false);
    player.name = nameArr;
    player.avatarSrc = avatarSeed;

    isEdit = true;
    document.getElementById("userExitLobby").classList.remove("hide");
    // addNewPlayer.textContent = "Saving...";
  } else {
    // const atr = currentUser.querySelector(".avatarBox img");
    // updatePlayer("0", wordCapitalizer(nameArr), avatarImg, "online");
    // updatePlayer(selfId, wordCapitalizer(nameArr), avatarImg, "online");
    updatePlayer(selfId, nameArr, avatarSeed, "online");
    playerControls.sendPlayerDetails(joinedPlayers[selfId], hostId);
    newUserBox.classList.add("hide");
  }

  document.getElementById("saveProfile").classList.add("hide");
  document.getElementById("saveProfileLoader").classList.remove("hide");
  await playerControls.sendRequest("I_AM_READY", hostId);
  newUserBox.classList.add("hide");
  waitingBox.classList.add("hide");
  document.getElementById("allplayer").classList.remove("hide");
  document.getElementById("mainContainer").classList.remove("hide");
});

joinedPlayerBox.addEventListener("click", function (e) {
  if (e.target.classList.contains("playerEdit")) {
    const saveProfile = document.getElementById("saveProfile");
    // currentUser = e.target.closest(".playerBox");
    console.log("edit");
    saveProfile.classList.remove("hide");
    document.getElementById("saveProfileLoader").classList.add("hide");
    saveProfile.innerText = "Update Profile";

    document.getElementById("newUserBox").classList.remove("hide");
  }
});

// refreshing avatar
document.getElementById("avatarReload").addEventListener("click", function () {
  setAvatar();
});

document.getElementById("userExitLobby").addEventListener("click", function () {
  document.getElementById("playerOverlayExitMsg").classList.remove("hide");
  // window.location = "../index.html";
});

document.getElementById("playerExitNo").addEventListener("click", function () {
  document.getElementById("playerOverlayExitMsg").classList.add("hide");
  // window.location = "../index.html";
});

document.getElementById("playerExitYes").addEventListener("click", function () {
  playerControls.sendRequest("I_AM_OUT", hostId);
  document.getElementById("playerOverlayExitMsg").classList.add("hide");
  window.location = "../index.html";
});

// addPlayer(2, "chote", "/assests/image1.png", "offline");

// quizGround script section ðŸ‘‡ ------------------------------------------------------------

// it take two parameter
// a html element in which timer will show
// and time in seconds
// it return false once time is over
function startCountdown(element, seconds) {
  element.innerText = (seconds < 10 ? "0" : "") + seconds;
  seconds -= 1;
  let countdownTime = seconds;

  // Update the countdown every 1 second
  const countdownInterval = setInterval(() => {
    const seconds = countdownTime % 60;

    const formattedTime = String(seconds).padStart(2, "0");

    element.innerText = formattedTime;

    countdownTime--;

    // If the countdown reaches zero, stop the timer
    if (countdownTime < 0) {
      clearInterval(countdownInterval);
      return false;
    }
  }, 1000);
}

// this function take
// const timeCountDown = function (utctime) {

// };

// const queTimer = document.getElementById("queTimer");
// startCountdown(queTimer, 10);

const pgOptionBox = document.getElementById("pgOptionBox");

pgOptionBox.addEventListener("click", function (e) {
  if (e.target.classList.contains("pgOptions")) {
    // it remove applied selectedOption class
    [...pgOptionBox.children].forEach((el) => {
      el.classList.remove("selectedOption");
    });
    e.target.classList.add("selectedOption");
  }
});

// it take one obj which contain question, option, and correct ans
// it take question and options and show it to UI to player
const displayQuestion = function (obj, correctAns, isLast) {
  quesNumber += 1;
  const totalQue = Number.parseInt(localStorage.getItem("noOfQue"));

  document.getElementById("queCount").innerText = `Question  ${
    quesNumber < 10 ? `0${quesNumber}` : quesNumber
  } / ${totalQue < 10 ? `0${totalQue}` : totalQue}`;

  const que = document.getElementById("pgQuestion");
  const options = document.querySelectorAll(".pgOptions");
  const nextQueOverlay = document.getElementById("nextQueOverlay");
  const nextQueCountDown = document.getElementById("nextQueCountDown");

  nextQueOverlay.classList.add("hide");
  nextQueCountDown.classList.add("hide");

  que.innerText = obj.question;
  options.forEach((el, i) => {
    el.classList.remove("selectedOption");
    el.classList.remove("correct");
    el.classList.remove("wrong");
    el.innerText = obj.options[i];
  });

  const oneQueTime = localStorage.getItem("oneQueTime");
  const timeBtwQue = localStorage.getItem("timeBtwQue");
  const times = Number.parseInt(oneQueTime);
  startCountdown(queTimer, times);
  console.log(nextQueCountDown);

  setTimeout(() => {
    checkCorrectAns(correctAns);
    setTimeout(() => {
      if (!isLast) {
        nextQueCountDown.classList.remove("hide");
        nextQueOverlay.classList.remove("hide");
        startCountdown(nextQueCountDown, Number.parseInt(timeBtwQue));
        if (user === "host") {
          joinedPlayers = sortPlayersByScore(joinedPlayers);
          playerControls.sendPlayerDetails(joinedPlayers);
        }
        setRankAndScore(
          joinedPlayers[selfId].rank,
          joinedPlayers[selfId].score
        );
      } else {
        const leaderboardArray = [];
        joinedPlayers = sortPlayersByScore(joinedPlayers);
        Object.keys(joinedPlayers).forEach((id, i) => {
          leaderboardArray[i] = {
            name: joinedPlayers[id].name,
            rank: joinedPlayers[id].rank,
            score: joinedPlayers[id].score,
            avatarSrc: joinedPlayers[id].avatar,
          };
        });

        // sort leaderboardArray in ascending order based on rank
        leaderboardArray.sort((a, b) => a.rank - b.rank);
        showLeaderBoard(leaderboardArray);
      }
    }, 2000);
  }, times * 1000);
};

// it take correct option as argument and
// check if it is correct then it marks as green and
// if it is wrong then it mark the selected option as red and correct option as green
// if player does not select any option then it mark the correct option as green after time is over
function checkCorrectAns(correctAns) {
  const options = document.querySelectorAll(".pgOptions");
  options.forEach((opt) => {
    if (
      opt.innerText.toLowerCase() == correctAns.toLowerCase() &&
      opt.classList.contains("selectedOption")
    ) {
      if (joinedPlayers[selfId]) {
        joinedPlayers[selfId].score += 100;
        console.log(joinedPlayers, "Correct");
        playerControls.sendPlayerDetails(joinedPlayers[selfId], hostId);
      }
      opt.classList.remove("selectedOption");
      opt.classList.add("correct");
      return;
    } else if (opt.classList.contains("selectedOption")) {
      if (joinedPlayers[selfId]) {
        joinedPlayers[selfId].score -= 50;
        console.log(joinedPlayers, "Wrong");
        playerControls.sendPlayerDetails(joinedPlayers[selfId], hostId);
      }
    }
  });

  options.forEach((opt) => {
    if (opt.innerText.toLowerCase() == correctAns.toLowerCase()) {
      opt.classList.add("correct");
    } else if (opt.classList.contains("selectedOption")) {
      opt.classList.add("wrong");
    }
  });
}

// when host click on exit button then it prompt a warning message
// with yes and no button
document.getElementById("quiteGame").addEventListener("click", function () {
  hostKickoutMsg.classList.remove("hide");
  playerExitMsg.classList.add("hide");
  hostExitBox.classList.remove("hide");
});

// if clicked on yes then all the player will be deleted
// and redirected to home page
document.getElementById("hostExitYes").addEventListener("click", function () {
  playerControls.sendRequest("BYE_BYE");
  joinedPlayerBox.innerHTML = "";
  window.location = "../index.html";
});

// if clicked on no then it just hide the warning message
document.getElementById("hostExitNo").addEventListener("click", function () {
  hostKickoutMsg.classList.add("hide");
  hostExitBox.classList.add("hide");
});

lobbyEdit.addEventListener("click", function () {
  localStorage.setItem("isHostEdit", "true");
  window.open("./quizBlank.html", "_blank");
});

// hosting button script
hostQuiz.addEventListener("click", function () {
  hostingOverlay.classList.remove("hide");

  // Add 10 seconds to current time
  const timeWhenQuizStarts = new Date().getTime() + 10000;

  playerControls.sendRequest(
    "QUIZ_TIME%%" + timeWhenQuizStarts + "%%" + allData
  );
  setRankAndScore(0, 0);
  playersSynced(Math.ceil((timeWhenQuizStarts - new Date().getTime()) / 1000));
});

hostCancel.addEventListener("click", function () {
  hostingOverlay.classList.add("hide");
});

// to start actual quiz
function startQuiz() {
  document.getElementById("pgPlayerName").innerText = currentUser;
  hostingOverlay.classList.add("hide");
  quizGround.classList.remove("hide");
  mainContainer.classList.add("hide");
  queObj.forEach((que, i) => {
    const time = i * ((+oneQueTime + +timeBtwQue + 2) * 1000);
    setTimeout(() => {
      joinedPlayers = sortPlayersByScore(joinedPlayers);
      setRankAndScore(joinedPlayers[selfId].rank, joinedPlayers[selfId].score);
      displayQuestion(
        queObj[i],
        queObj[i].correctOption,
        queObj.length - 1 === i
      );
    }, time);
  });
}

// it will hide other component and show scoreboard
// function showScoreboard() {
//   document.getElementById("scoreboardOverlay").classList.remove("hide");
//   quizGround.classList.add("hide");
// }

// it is used to set the rank of players
// it take two argument 1. player id 2. rank of the player
function setRankAndScore(rank, score) {
  // const players = document.querySelectorAll(".playerBox");
  // players.forEach((el) => {
  //   if (playerId == el.dataset.id) {
  document.getElementById("pRank").innerText = `#${rank}`;
  document.getElementById("pScore").innerText = score;
  //   }
  // });
}
// this is scoreboard home button
// when clicked, it redirect to home page
document.getElementById("homeBtn").addEventListener("click", function () {
  window.location = "../index.html";
});

function showLeaderBoard(obj) {
  console.log(obj);
  document.getElementById("scoreboardOverlay").classList.remove("hide");
  quizGround.classList.add("hide");
  // showScoreboard();
  const topPlayers = document.getElementById("topPlayer");
  const restPlayer = document.getElementById("restPlayer");

  // setting top 2nd player data
  topPlayers.children[0].getElementsByClassName("playerName")[0].innerText =
    obj[1].name;
  topPlayers.children[0].getElementsByClassName(
    "scoreSl"
  )[0].innerText = `#${obj[1].rank}`;
  topPlayers.children[0].getElementsByClassName("playerScore")[0].innerText =
    obj[1].score;
  topPlayers.children[0].getElementsByClassName(
    "scoreAvatar"
  )[0].style.backgroundImage = `url(${obj[1].avatarSrc}), url("../assests/user.png")`;
  // topPlayers.children[0].getElementsByTagName(
  //   ".avatarBox img"
  // )[0].style.backgroundImage = `url(${obj[1].avatarSrc}), url("../assests/user.png")`;
  // obj[1].avatarSrc;
  // el.getElementsByClassName(
  //   "avatarBox"
  // )[0].style.backgroundImage = `url(${avatarUrl}), url("../assests/user.png")`;

  // setting top 1st player data
  topPlayers.children[1].getElementsByClassName("playerName")[0].innerText =
    obj[0].name;
  topPlayers.children[1].getElementsByClassName(
    "scoreSl"
  )[0].innerText = `#${obj[0].rank}`;
  topPlayers.children[1].getElementsByClassName("playerScore")[0].innerText =
    obj[0].score;
  topPlayers.children[1].getElementsByClassName(
    "scoreAvatar"
  )[0].style.backgroundImage = `url(${obj[0].avatarSrc}), url("../assests/user.png")`;
  // topPlayers.children[1].getElementsByTagName(".avatarBox img")[0].src =
  //   obj[0].avatarSrc;

  // setting top 3rd player data
  topPlayers.children[2].getElementsByClassName("playerName")[0].innerText =
    obj[2].name;
  topPlayers.children[2].getElementsByClassName(
    "scoreSl"
  )[0].innerText = `#${obj[2].rank}`;
  topPlayers.children[2].getElementsByClassName("playerScore")[0].innerText =
    obj[2].score;
  topPlayers.children[2].getElementsByClassName(
    "scoreAvatar"
  )[0].style.backgroundImage = `url(${obj[2].avatarSrc}), url("../assests/user.png")`;
  // topPlayers.children[2].getElementsByTagName(".avatarBox img")[0].src =
  //   obj[2].avatarSrc;

  let card;

  // console.log(obj.length);
  // <img src="${obj[i + 3].avatarSrc}" alt="avatar" />

  // setting others player data
  for (let i = 0; i < obj.length - 3; i++) {
    card = `
              <div class="playerBox">
              <p class="scoreSl">${obj[i + 3].rank}</p>
              <div class="avatarBox scoreAvatar" style="background-image: ${`url(${
                obj[i + 3].avatarSrc
              }), url("../assests/user.png")`};">
              </div>
              <div class="playerNameBox" data-id="">
                <p class="playerName">${obj[i + 3].name}</p>
                <p class="playerScore">${obj[i + 3].score}</p>
              </div>
              <button class="celBtn">
                <img
                  src="../assests/celebrate.svg"
                  alt="kick out button"
                  class="kickOutBtn"
                />
              </button>
            </div>
    `;

    restPlayer.insertAdjacentHTML("beforeend", card);
  }
}

// document.getElementById("mainContainer").style = "display: none";

async function hostLobbyPanda() {
  const config = {
    appId:
      "https://thequizappwovi-default-rtdb.asia-southeast1.firebasedatabase.app/",
  };
  const lobbyCode = await generateLobbyCodePanda();
  const room = joinRoom(config, lobbyCode);
  const [sendPlayerDetails, getPlayerDetails] = room.makeAction("pd");
  const [sendRequest, getRequest] = room.makeAction("request");

  room.onPeerJoin((peerId) => {
    console.log(peerId + " joined");
    sendRequest("HI", peerId);

    // Sync LocalStorage Data
    const localData = {};
    localData["noOfQue"] = localStorage.getItem("noOfQue");
    localData["oneQueTime"] = localStorage.getItem("oneQueTime");
    localData["timeBtwQue"] = localStorage.getItem("timeBtwQue");

    console.log(localData);

    sendRequest("SYNC_DATA%%" + JSON.stringify(localData), peerId);
  });

  room.onPeerLeave((peerId) => {
    if (joinedPlayers[peerId]) {
      joinedPlayers[peerId].status = "offline";
      updatePlayer(
        peerId,
        joinedPlayers[peerId].name,
        joinedPlayers[peerId].avatar,
        joinedPlayers[peerId].status
      );
      sendPlayerDetails(joinedPlayers);
    }
  });

  getPlayerDetails((playerDetails, peerId) => {
    console.log("new: ", playerDetails);
    const newJoinedPlayersData = JSON.parse(JSON.stringify(joinedPlayers));
    if (!(peerId in newJoinedPlayersData)) {
      // console.log("updating");
      addPlayerToLobby(
        peerId,
        playerDetails.name,
        playerDetails.avatar,
        playerDetails.status
      );
    } else {
      updatePlayer(
        peerId,
        playerDetails.name,
        playerDetails.avatar,
        playerDetails.status
      );
    }
    newJoinedPlayersData[peerId] = playerDetails;
    joinedPlayers = newJoinedPlayersData;
    sendPlayerDetails(newJoinedPlayersData);
  });

  getRequest((req, peerId) => {
    switch (req.split("%%")[0]) {
      case "I_AM_READY":
        sendRequest("WHO_ARE_YOU", peerId);
        break;
      case "I_AM_OUT":
        delete joinedPlayers[peerId];
        removePlayer(peerId);
        sendPlayerDetails(joinedPlayers);
        break;
    }
  });

  // Add Player Controls
  playerControls.room = room;
  playerControls.sendPlayerDetails = sendPlayerDetails;
  playerControls.sendRequest = sendRequest;

  return lobbyCode;
}

async function joinLobbyPanda(joiningCode) {
  const config = {
    appId:
      "https://thequizappwovi-default-rtdb.asia-southeast1.firebasedatabase.app/",
  };
  const room = joinRoom(config, joiningCode);
  room.onPeerJoin((peerId) => {
    // Check if Room exists
    if (Object.keys(room.getPeers()).length > 0) {
      return Promise.resolve(room);
    } else {
      return Promise.reject("Room does not exist");
    }
  });

  room.onPeerLeave((peerId) => {
    if (peerId === hostId) {
      window.location = "../index.html";
    }
  });
  const [sendPlayerDetails, getPlayerDetails] = room.makeAction("pd");
  const [sendRequest, getRequest] = room.makeAction("request");

  getRequest((req, peerId) => {
    switch (req.split("%%")[0]) {
      case "WHO_ARE_YOU":
        hostId = peerId;
        sendPlayerDetails(joinedPlayers[selfId], peerId);
        break;
      case "GET_OUT":
        room.leave();
        window.location = "../pages/joinRoom.html";
        break;
      case "HI":
        hostId = peerId;
        console.log("Connected to Host");
        break;
      case "BYE_BYE":
        window.location = "../index.html";
        break;
      case "QUIZ_TIME":
        quizTime = Number.parseInt(req.split("%%")[1]);
        const questionData = req.split("%%")[2];
        queObj = JSON.parse(questionData);
        playersSynced(Math.ceil((quizTime - new Date().getTime()) / 1000));
        setRankAndScore(
          joinedPlayers[selfId].rank,
          joinedPlayers[selfId].score
        );
        break;
      case "SYNC_DATA":
        const data = JSON.parse(req.split("%%")[1]);
        console.log(data);
        localStorage.setItem("noOfQue", data["noOfQue"]);
        localStorage.setItem("oneQueTime", data["oneQueTime"]);
        localStorage.setItem("timeBtwQue", data["timeBtwQue"]);
        break;
    }
  });

  getPlayerDetails((updatedPlayerDetails, peerId) => {
    console.log("Updated: ", updatedPlayerDetails);
    let newJoinedPlayersData = { ...updatedPlayerDetails };

    const [newlyJoinedPlayers, changedOldPlayers, removedPlayerIds] =
      getPlayersDiffs(joinedPlayers, newJoinedPlayersData);

    console.log("Newly Joined Players: ", newlyJoinedPlayers);
    console.log("Changed Old Players: ", changedOldPlayers);
    console.log("Removed Player IDs: ", removedPlayerIds);

    for (const [playerId, playerDetails] of Object.entries(
      newlyJoinedPlayers
    )) {
      addPlayerToLobby(
        playerId,
        playerDetails.name,
        playerDetails.avatar,
        playerDetails.status
      );
    }

    for (const [playerId, playerDetails] of Object.entries(changedOldPlayers)) {
      updatePlayer(
        playerId,
        playerDetails.name,
        playerDetails.avatar,
        playerDetails.status
      );
    }

    removedPlayerIds.forEach((id) => {
      removePlayer(id);
    });

    Object.keys(newJoinedPlayersData).forEach((id) => {
      if (removedPlayerIds.includes(id)) {
        delete newJoinedPlayersData[id];
      }
    });

    joinedPlayers = newJoinedPlayersData;
    // console.log(joinedPlayers);
  });

  // Add Player Controls
  playerControls.room = room;
  playerControls.sendPlayerDetails = sendPlayerDetails;
  playerControls.sendRequest = sendRequest;
}

async function generateLobbyCodePanda() {
  // Return a random 6 letter code
  return Math.random().toString(36).substring(2, 8).toLowerCase();
}

if (!user || user === "host") {
  const lobbyCode = await hostLobbyPanda();
  showJoiningCode(lobbyCode);
}

function getPlayersDiffs(oldPlayerDetails, newPlayerDetails) {
  console.log("Old Players: ", oldPlayerDetails);
  console.log("New Players: ", newPlayerDetails);
  const newlyJoinedPlayers = Object.fromEntries(
    Object.entries(newPlayerDetails).filter(
      ([key, value]) => !(key in oldPlayerDetails)
    )
  );

  const changedOldPlayers = Object.fromEntries(
    Object.entries(newPlayerDetails).filter(
      ([key, value]) =>
        key in oldPlayerDetails && oldPlayerDetails[key] !== value
    )
  );

  const removedPlayerIds = [];
  Object.keys(oldPlayerDetails).forEach((id) => {
    if (!Object.keys(newPlayerDetails).includes(id)) {
      removedPlayerIds.push(id);
    }
  });

  return [newlyJoinedPlayers, changedOldPlayers, removedPlayerIds];
}

function sortPlayersByScore(players) {
  const tempPlayers = { ...players };
  const sortedPlayers = Object.entries(tempPlayers).sort(
    (a, b) => b[1].score - a[1].score
  );

  // update players rank based on score
  sortedPlayers.forEach((sobj, i) => {
    tempPlayers[sobj[0]].rank = i + 1;
  });

  return tempPlayers;
}

function seedToUrl(seed) {
  const svgCode = multiavatar(seed);
  const blob = new Blob([svgCode], { type: "image/svg+xml" });
  return URL.createObjectURL(blob);
}
