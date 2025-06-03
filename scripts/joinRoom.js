"use strict";

const userInput = document.getElementById("userInput");
const joinBtn = document.getElementById("joinBtn");
const disableJoinImg = document.getElementById("disableJoinImg");
const enableJoinImg = document.getElementById("enableJoinImg");
const urlParam = new URLSearchParams(window.location.search);

const joinErrorELement = document.querySelector(".contentBox");
import { getOccupants } from "./firebase.js";

const enableJoinBtn = function () {
  joinBtn.disabled = false;
  enableJoinImg.classList.remove("hide");
  disableJoinImg.classList.add("hide");
  joinBtn.classList.remove("disableBtn");
  joinBtn.classList.add("enableBtn");
};

const disableJoinBtn = function () {
  joinBtn.disabled = true;
  enableJoinImg.classList.add("hide");
  disableJoinImg.classList.remove("hide");
  joinBtn.classList.add("disableBtn");
  joinBtn.classList.remove("enableBtn");
};

if (urlParam.has("code")) {
  userInput.value = urlParam.get("code");
  enableJoinBtn();
}

userInput.addEventListener("input", function () {
  joinErrorELement.classList.remove("joinError");
  const user = userInput.value.trim(" ");
  if (user.length > 5) {
    enableJoinBtn();
  } else {
    disableJoinBtn();
  }
});

joinBtn.addEventListener("click", async function () {
  document.getElementById("loaderBox").classList.remove("hide");
  joinBtn.disabled = true;

  const lobbyCode = await userInput.value.trim(" ");
  const isRoomAvailable = await doesRoomExists(lobbyCode);

  if (isRoomAvailable) {
    localStorage.setItem("user", "player");
    localStorage.setItem("lobbyCode", lobbyCode);
    window.location = "../pages/lobby.html";
  } else {
    document.getElementById("loaderBox").classList.add("hide");
    joinBtn.disabled = false;
    joinErrorELement.classList.add("joinError");
  }
});

async function doesRoomExists(joiningCode) {
  const config = {
    appId:
      "https://thequizappwovi-default-rtdb.asia-southeast1.firebasedatabase.app/",
  };
  return (await getOccupants(config, joiningCode)).length > 0;
}
