var rgx = new RegExp(badWords.join("|"), "gi");

function enableChat() {
  document.getElementById("chatWindow").classList.replace("-left-full", "left-0");
  document.getElementById("notification").classList.add("hidden");
  chatOpen = 1;
  document.getElementById("chat").onclick = () => {
    disableChat();
  }
}

function disableChat() {
  document.getElementById("chatWindow").classList.replace("left-0", "-left-full");
  document.getElementById("notification").classList.add("hidden");
  chatOpen = -1;
  document.getElementById("chat").onclick = () => {
    enableChat();
  }
}

document.getElementById("input").addEventListener("keydown", (e) => {
  if (e.key == "Enter" && connected) {
    var message = document.getElementById("input").value;
    message = message.replace(rgx, "****");
    socket.emit("chat message", message);
    document.getElementById("input").value = "";
  }
  e.preventDefault;
});

socket.on("newMessage", (message) => {
  var div = document.createElement("div");
  div.innerHTML = "<div class='font-bold'>" + message[0].replace(/<[^>]+>/g, '') + "</div><div>" + message[1].replace(/<[^>]+>/g, '') + "</div><hr class='my-4 h-px border-none bg-gray-300'>";
  document.getElementById("messages").appendChild(div);
  if (chatOpen < 0) {
    var start = new Audio("/music/start.mp3");
    start.play();
    document.getElementById("notification").classList.remove("hidden");
  }
  document.getElementById("messages").scrollTop = document.getElementById("messages").scrollHeight;
});