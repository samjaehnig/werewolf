var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io")(server);
var firebase = require("firebase/app");
require("firebase/auth");
require("firebase/database");
var user;
let users = [];
let roles = ["werewolf", "werewolf", "minion", "seer", "robber", "troublemaker", "tanner", "drunk", "insomniac"];
let rooms = [];
let centers = [];
let werewolves = [], minion = [], seer = [], robber = [], troublemaker = [], tanner = [], drunk = [], insomniac = [], villagers = [];
var roomid;

var firebaseConfig = {
  apiKey: "AIzaSyBYhrFjU6OpT5vybXu0sQIMt-ADPtsWuOI",
  authDomain: "werewolf-88f3a.firebaseapp.com",
  databaseURL: "https://werewolf-88f3a.firebaseio.com",
  projectId: "werewolf-88f3a",
  storageBucket: "werewolf-88f3a.appspot.com",
  messagingSenderId: "641432707523",
  appId: "1:641432707523:web:7c79f7298a201c7c71dd76",
  measurementId: "G-XWVG03G50B"
};

firebase.initializeApp(firebaseConfig);



app.get("/", function(req, res, next) {
  res.sendFile(__dirname + "/public/index.html");
});

app.use(express.static("public"));


io.on("connection", function(client) {
  client.on("add_player", function(data) {
    client.emit("player_me", data);
    client.broadcast.emit("player", data);
    user = [data, client.id];
    users.push(user);
    if(users.length == 5) { 
      client.emit("display_start");
      client.broadcast.emit("display_start");
    }
  });

  client.on("starting", function(data) { 
    client.emit("remove_start");
    client.broadcast.emit("remove_start");
    assignroles(); //add the roles to each users variable
    for(var i = 0; i < users.length; i++) {
      if(users[i][1] == client.id) { client.emit("role", users[i][2]); } //refers to the client who's action started the function - emits their role
      else { client.broadcast.to(users[i][1]).emit("role", users[i][2]); } //emits all other client roles
    }
    //delay 10 seconds

    //start running roles
    for(var i = 0; i < users.length; i++) {
      if(users[i][2] == "werewolf") { 
        for(var j = 0; j < werewolves.length; j++) {
          if(werewolves[j][1] != users[i][1]) { client.broadcast.to(users[i][1]).emit("werewolf", werewolves[j][0])}
        }
      }
      else if (users[i][2] == "minion") { client.broadcast.to(users[i][1]).emit("minion", werewolves); } 
      else if (users[i][2] == "seer") { client.broadcast.to(users[i][1]).emit("seer", centers) }
    }

  });

  client.on("robber", function(data) {
    for(var i = 0; i < users.length; i++) {
      if (users[i][2] == "robber") { client.broadcast.to(users[i][1]).emit("robber", users, i); }
    }
  });

  client.on("troublemaker", function(data) {
    for(var i = 0; i < users.length; i++) {
      if (users[i][2] == "troublemaker") { client.broadcast.to(users[i][1]).emit("troublemaker", users, i); }
    }
  });

  client.on("display_changes", function(data) {
    for(var i = 0; i < users.length; i++) {
      if (users[i][2] == "tanner") { tanner(); }
      else if (users[i][2] == "insomniac") { insomniac(); }
      else if (users[i][2] == "drunk") { client.broadcast.to(users[i][1]).emit("drunk", center); }
      else if (users[i][2] == "villager") { villager(); }
    }
  }); 

  client.on("create", function(data) {
    var rooms = firebase.database().ref('rooms');
    rooms.push({
      num_players: 1,
      players: {
        player: user
      }
    });
    rooms.on('child_added', function(data) {
      firebase.database().ref('rooms/' + data.key).update({
        roomid: data.key
      });
      roomid = data.key;
    });
    firebase.database().ref('rooms/' + roomid).once("value", function(data) {
      client.emit("display_room", data.child('players').val());
    });
  });

  client.on("join_game", function(data) {
    roomid = data;
    firebase.database().ref('rooms/' + data).once("value", function(data) {
      users = data.child('players').val();
      users.push(user);
      firebase.database().ref('rooms/' + data.key).update({
        num_players: users.length
      });
      firebase.database().ref('rooms/' + data.key).update({
        players: users
      });
      client.emit("display_room", data.child('players').val());
    });
    
    // firebase.database().ref('rooms/' + data).update({
    //   num_players: num_players + 1
    // });
    // firebase.database().ref('rooms/' + data).push({
    //   player: user
    // });
  });


});

function assignroles() {
  // console.log("assigning roles");
  // console.log(users);
  let temp_roles = roles;
  for(var i = 0; i < users.length; i++) {
    if(temp_roles.length == 0) { //if there are no more roles to assign - remaining players become villagers 
      users[i].push("villager"); 
      villagers.push(users[i]);
    }else { //else, there are roles left 
      let role_index = Math.floor(Math.random() * (users.length - i));
      let role = temp_roles[role_index];
      console.log(role_index);
      console.log(role);
      users[i].push(role);
      if(role == "werewolf") { werewolves.push(users[i]); } //adds player names to the werewolf array
      else if (role == "minion") { minion.push(users[i]); }
      else if (role == "seer") { seer.push(users[i]); }
      else if (role == "troublemaker") { troublemaker.push(users[i]); }
      else if (role == "robber") { robber.push(users[i]); }
      else if (role == "tanner") { tanner.push(users[i]); }
      else if (role == "drunk") { drunk.push(users[i]); }
      else if (role == "insomniac") { insomniac.push(users[i]); }
      console.log(users[i]);
      temp_roles.splice(role_index, 1);
    }
  }
  centers.push(temp_roles[0]);
  centers.push(temp_roles[1]);
  centers.push(temp_roles[2]);
}

let port = process.env.PORT || 8000;
// if (port == null || port == "") {
//   port = 8000;
// }
server.listen(port);