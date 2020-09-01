var game_started = false;

// var socket = io.connect("https://werewolf-1night.herokuapp.com/");

var socket = io.connect("http://localhost:8000");

socket.on("connect", function(data) {
    socket.emit("join");
});

socket.on("player", function(data) {
    $("#players").append("<span class='player'>" + data + "</span>");
});

socket.on("existing_players", function(data) {
    for(var i = 0; i < data.length; i++) { $("#players").append("<span class='player'>" + data[i][0] + "</span>"); }
});

socket.on("player_me", function(data) {
    $("#players").append("<span class='player_me' id='player_me'><b>" + data + " (you)" + "</b></span>");
    document.getElementById('name').parentNode.removeChild(document.getElementById('name'));
    document.getElementById('name_submit').parentNode.removeChild(document.getElementById('name_submit'));
});

socket.on("display_start", function() {
    $("#start_game").append("<input id='start_submit' type='submit' value='click here to start the game!' />");
});

socket.on("remove_start", function() {
    document.getElementById('start_submit').parentNode.removeChild(document.getElementById('start_submit'));
});

socket.on("role", function(data) {
    $("#role_div").append("<span id='role_intro'>your role is.... </span><span id='role'>" + data + " </span>");
});


$("#add_player").submit(function() {
    if(!game_started) {
        var player_name = $("#name").val();
        if(player_name != "") { socket.emit("add_player", player_name); }
        this.reset();
        return false;
    } else {
        //print something to the user given the game has already started
    }
});

$("#start_game").submit(function() {
    game_started = true;
    socket.emit("starting");
    this.reset();
    return false;
});


//INDEX.HTML FUNCTIONS
function open_modal(modal_id) {
    document.getElementById(modal_id).style.display = "block";
}

function close_modal(modal_id) {
    document.getElementById(modal_id).style.display = "none";
}

window.onclick = function(event) { 
    if(event.target == document.getElementById('how_to_modal')) { close_modal('how_to_modal'); }
}