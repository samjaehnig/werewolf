var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io")(server);
let users = [];
let roles = ["werewolf", "werewolf", "minion", "seer", "robber", "troublemaker", "insomniac", "tanner"];
let center1, center2, center3;

app.get("/", function(req, res, next) {
  res.sendFile(__dirname + "/public/index.html");
});

app.use(express.static("public"));


io.on("connection", function(client) {
    
    // client.on("join", function() {
    // });

  client.on("add_player", function(data) {
    // console.log(io.engine.clientsCount);
    //also emit to just this client any players already in the room!
    // client.emit("existing_players", users);

    client.emit("player_me", data);
    client.broadcast.emit("player", data);
    var user = [data, client.id];
    users.push(user);
    if(users.length == 2) { 
      client.emit("display_start");
      client.broadcast.emit("display_start");
    }
  });

  client.on("starting", function(data) { 
    client.emit("remove_start");
    client.broadcast.emit("remove_start");
    assignroles(); 
    console.log("delegating roles");
    for(var i = 0; i < users.length; i++) {
      if(users[i][1] == client.id) { client.emit("role", users[i][2]); }
      else { client.broadcast.to(users[i][1]).emit("role", users[i][2]); }
    }
  });


});

function assignroles() {
  // console.log("assigning roles");
  // console.log(users);
  let temp_roles = roles;
  let user_index = 0;
  for(var i = 0; i < users.length; i++) {
    let role_index = Math.floor(Math.random() * (users.length));
    console.log(role_index);
    console.log(temp_roles[role_index]);
    users[user_index].push(temp_roles[role_index]);
    console.log(users[user_index]);
    temp_roles.splice(role_index, 1);
    user_index++;
  }
  center1 = temp_roles[0];
  center2 = temp_roles[1];
  center3 = temp_roles[2];
}


let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}
server.listen(port);
// server.listen(5678);