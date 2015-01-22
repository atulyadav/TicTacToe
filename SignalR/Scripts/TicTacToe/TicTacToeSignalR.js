var currentUserName;
var connectedToOpponent = false;

$(document).ready(function () {
    console.log("ready!");
    setScreen();

    //$('#onlineUserList').bootstrapTable({
    //    data: getRows()
    //});


    //Declare a proxy to reference the hub. 
    var ticTacToeHub = $.connection.ticTacToeHub;
    $.connection.hub.logging = true;
    registerClientMethods(ticTacToeHub);
    getUserAndConnect();
    //Start Hub

    $.connection.hub.start().done(function () {
        console.log("connection.hub.start() : connected");
        // ticTacToeHub.server.setupStatus();
    }).fail(function () {
        alert("connection.hub.start() failed");
    });
    //getUserAndConnect();

    $("#btn-save-user").click(function (e) {
        e.preventDefault();
        var name = $("#userName").val();
        if ($.trim(name) != '') {
            currentUserName = name;
            $("#userNameDialog").modal('hide');
            registerEvents(ticTacToeHub);
        }
        else {
        }
    });
});

function updateOnlineUserList(onlineUsers) {
    var users = humps.camelizeKeys(onlineUsers);
    var $result = $('#events-result');

    $('#onlineUserList').bootstrapTable({
        data: users
    }).on('all.bs.table', function (e, name, args) {
        console.log('Event:', name, ', data:', args);
    }).on('click-row.bs.table', function (e, row, $element) {
        $result.text('Event: click-row.bs.table, data: ' + JSON.stringify(row));
        connectToOpponent(row);
    }).on('dbl-click-row.bs.table', function (e, row, $element) {
        $result.text('Event: dbl-click-row.bs.table, data: ' + JSON.stringify(row));
    }).on('load-success.bs.table', function (e, data) {
        $result.text('Event: load-success.bs.table');
    }).on('load-error.bs.table', function (e, status) {
        $result.text('Event: load-error.bs.table, data: ' + status);
    });
}

function connectToOpponent(row) {
    
    console.log("row = " + row.connectionId);
    if (!connectedToOpponent && row.connectionId != "") {
        connectedToOpponent = true;
        ticTacToeHub.server.requestToConnectionId(JSON.stringify(JSONObject)(row)).done(function (result) {
            console.log("ticTacToeHub.server.requestToConnectionId - successful " + result);
        }).fail(function (error) {
            console.log("ticTacToeHub.server.requestToConnectionId - failed " + result);
            connectedToOpponent = false;
        });
    }
}

ticTacToeHub.client.playersReadyToPlay = function (user, opponentUserName) {
    var JSONObject = jQuery.parseJSON(user);
    if (JSONObject.ConnectionId == ticTacToeHub.id) {
        console.log("playersReadyToPlay :: you are requested to play with... " + opponentUserName);
    } else {
        console.log("playersReadyToPlay :: your opponent is connected...");
    }
    // var connectionIds [] = result.split("/");
}

function playYourTurn() {

}

function setScreen(isLogin) {

    if (!isLogin) {
    }
    else {
    }

}

function getRows() {
    var id = 0;
    var rows = [];

    for (var i = 0; i < 5; i++) {
        rows.push(
            { connectionId: "id " + id, userName: "diker" + id, status: "fails" });
        id++;
    }
    return rows;
}

function registerClientMethods(ticTacToeHub) {

    // Calls when user successfully logged in
    ticTacToeHub.client.onConnected = function (id, userName, connectedUsers) {

        setScreen(true);
        var $connectionResult = $('#connection-result');
        $connectionResult.text("onConnected : " + id + " " + userName);
        updateOnlineUserList(connectedUsers);
    }

    // On New User Connected
    ticTacToeHub.client.onNewUserConnected = function (id, name, connectedUsers) {

        var $connectionResult = $('#connection-result');
        $connectionResult.text("onNewUserConnected : " + id + " " + userName);
        updateOnlineUserList(connectedUsers);
    }

    // On setup complete
    ticTacToeHub.client.setupComplete = function () {
        //var $connectionResult = $('#connection-result');
        //$connectionResult.text("onNewUserConnected : " + id + " " + userName);

        //updateOnlineUserList(connectedUsers);
    }

    //// On User Disconnected
    //ticTacToeHub.client.onUserDisconnected = function (id, userName) {

    //    var $connectionResult = $('#connection-result');
    //    $$connectionResult.text("onUserDisconnected : " + id + " " + userName);

    //    //$(disc).hide();
    //    //$('#divusers').prepend(disc);
    //    //$(disc).fadeIn(200).delay(2000).fadeOut(200);
    //}

    //ticTacToeHub.client.messageReceived = function (userName, message) {

    //}


    //ticTacToeHub.client.sendPrivateMessage = function (windowId, fromUserName, message) {

    //}

}

function registerEvents(ticTacToeHub) {
    if ($.trim(currentUserName) != '') {
        ticTacToeHub.server.connect(currentUserName).done(function () {
            console.log("ticTacToeHub.server.connect - successful");
            // connectedToOpponent = true;
        }).fail(function () {
            console.log("ticTacToeHub.server.connect - failed");
        });
        //var $connectionResult = $('#connection-result');
        //$connectionResult.text("you are connected" + userName);
    }
}

function getUserAndConnect() {
    $("#userNameDialog").modal();
}