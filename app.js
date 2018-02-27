// Initialize Firebase
var config = {
  apiKey: "AIzaSyAgEuXgOYwmHK_RqpVzMIJDRLD5ZB7UbbQ",
  authDomain: "rps-multi-7fedd.firebaseapp.com",
  databaseURL: "https://rps-multi-7fedd.firebaseio.com",
  storageBucket: "rps-multi-7fedd.appspot.com"
};

firebase.initializeApp(config);

var database = firebase.database();
var chatData = database.ref("/chat");
var playersRef = database.ref("players");
var currentTurnRef = database.ref("turn");
var username = "Guest";
var currentPlayers = null;
var currentTurn = null;
var playerNum = false;
var playerOneExists = false;
var playerTwoExists = false;
var playerOneData = null;
var playerTwoData = null;

// USERNAME LISTENERS
// Start button - takes username and tries to get user in game
$("#start").click(function() {
  if ($("#username").val() !== "") {
    username = capitalize($("#username").val());
    getInGame();
  }
});

// listener for 'enter' in username input
$("#username").keypress(function(e) {
  if (e.keyCode === 13 && $("#username").val() !== "") {
    username = capitalize($("#username").val());
    getInGame();
  }
});

// Function to capitalize usernames
function capitalize(name) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

// CHAT LISTENERS
// Chat send button listener, grabs input and pushes to firebase. (Firebase's push automatically creates a unique key)
$("#chat-send").click(function() {

  if ($("#chat-input").val() !== "") {

    var message = $("#chat-input").val();

    chatData.push({
      name: username,
      message: message,
      time: firebase.database.ServerValue.TIMESTAMP,
      idNum: playerNum
    });

    $("#chat-input").val("");
  }
});

// Chatbox input listener

$("#chat-input").keypress(function(e) {

  if (e.keyCode === 13 && $("#chat-input").val() !== "") {

    var message = $("#chat-input").val();

    chatData.push({
      name: username,
      message: message,
      time: firebase.database.ServerValue.TIMESTAMP,
      idNum: playerNum
    });

    $("#chat-input").val("");
  }
});

// Click event for dynamically added <li> elements
$(document).on("click", "li", function() {

  console.log("click");

  // Grabs text from li choice
  var clickChoice = $(this).text();
  console.log(playerRef);

  // Sets the choice in the current player object in firebase
  playerRef.child("choice").set(clickChoice);

  // User has chosen, so removes choices and displays what they chose
  $("#player" + playerNum + " ul").empty();
  $("#player" + playerNum + "chosen").text(clickChoice);

  // Increments turn. Turn goes from:
  // 1 - player 1
  // 2 - player 2
  // 3 - determine winner
  currentTurnRef.transaction(function(turn) {
    return turn + 1;
  });
});

// Update chat on screen when new message detected - ordered by 'time' value
chatData.orderByChild("time").on("child_added", function(snapshot) {

  // If idNum is 0, then its a disconnect message and displays accordingly
  // If not - its a user chat message
  if (snapshot.val().idNum === 0) {
    $("#chat-messages").append("<p class=player" + snapshot.val().idNum + "><span>"
    + snapshot.val().name + "</span>: " + snapshot.val().message + "</p>");
  }
  else {
    $("#chat-messages").append("<p class=player" + snapshot.val().idNum + "><span>"
    + snapshot.val().name + "</span>: " + snapshot.val().message + "</p>");
  }

  // Keeps div scrolled to bottom on each update.
  $("#chat-messages").scrollTop($("#chat-messages")[0].scrollHeight);
});

// Tracks changes in key which contains player objects
playersRef.on("value", function(snapshot) {

  // length of the 'players' array
  currentPlayers = snapshot.numChildren();

  // Check to see if players exist
  playerOneExists = snapshot.child("1").exists();
  playerTwoExists = snapshot.child("2").exists();

  // Player data objects
  playerOneData = snapshot.child("1").val();
  playerTwoData = snapshot.child("2").val();

  // If theres a player 1, fill in name and win loss data
  if (playerOneExists) {
    $("#player1-name").text(playerOneData.name);
    $("#player1-wins").text("Wins: " + playerOneData.wins);
    $("#player1-losses").text("Losses: " + playerOneData.losses);
  }
  else {

    // If there is no player 1, clear win/loss data and show waiting
    $("#player1-name").text("Waiting for Player 1");
    $("#player1-wins").empty();
    $("#player1-losses").empty();
  }

  // If theres a player 2, fill in name and win/loss data
  if (playerTwoExists) {
    $("#player2-name").text(playerTwoData.name);
    $("#player2-wins").text("Wins: " + playerTwoData.wins);
    $("#player2-losses").text("Losses: " + playerTwoData.losses);
  }
  else {

    // If no player 2, clear win/loss and show waiting
    $("#player2-name").text("Waiting for Player 2");
    $("#player2-wins").empty();
    $("#player2-losses").empty();
  }
});

// Detects changes in current turn key
currentTurnRef.on("value", function(snapshot) {

  // Gets current turn from snapshot
  currentTurn = snapshot.val();

  // Don't do the following unless you're logged in
  if (playerNum) {

    // For turn 1
    if (currentTurn === 1) {

      // If its the current player's turn, tell them and show choices
      if (currentTurn === playerNum) {
        $("#current-turn").html("<h2>It's Your Turn!</h2>");
        $("#player" + playerNum + " ul").append("<li>Rock</li><li>Paper</li><li>Scissors</li>");
      }
      else {

        // If it isnt the current players turn, tells them theyre waiting for player one
        $("#current-turn").html("<h2>Waiting for " + playerOneData.name + " to choose.</h2>");
      }

      // Shows yellow border around active player
      $("#player1").css("border", "2px solid yellow");
      $("#player2").css("border", "1px solid black");
    }

    else if (currentTurn === 2) {

