var currentUserName, ticTacToeHub;
var connectedToOpponent = false;
var isYourTurn = false;
var groupName = "";
var canvas;
var isRestartGame = false;
var _status = { connectedToOpponent: false, requesterUserId: "", requesterName: "", groupName: "", opponentUserId: "" };

$(document).ready(function () {
    console.log("ready!");
    createTicTacToeBoard();
    $("#restartGame").hide();
    //Declare a proxy to reference the hub. 
    ticTacToeHub = $.connection.ticTacToeHub;
    $.connection.hub.logging = true;

    //$.connection.ticTacToeHub.stateChanged(function (change) {
    //    var stateConversion = { 0: 'connecting', 1: 'connected', 2: 'reconnecting', 4: 'disconnected' };
    //    if (change.newState === $.signalR.connectionState.reconnecting) {
    //        //timeout = setTimeout(function () {
    //        //    $('#state').css('backgroundColor', 'red')
    //        //                .html('The server is unreachable...');
    //        //}, interval);
    //    }
    //    else if (timeout && change.newState === $.signalR.connectionState.connected) {
    //        console.log('SignalR state changed from: ' + stateConversion[change.oldState] + ' to: ' + stateConversion[change.newState]);
    //        //$('#state').css('backgroundColor', 'green')
    //        //                .html('The server is online');

    //        //clearTimeout(timeout);
    //        //timeout = null;
    //    }


    //});

    //function connectionStateChanged(state) {
    //    var stateConversion = { 0: 'connecting', 1: 'connected', 2: 'reconnecting', 4: 'disconnected' };
    //    console.log('SignalR state changed from: ' + stateConversion[state.oldState]+ ' to: ' + stateConversion[state.newState]);
    //}
    // $.connection.ticTacToeHub.stateChanged(connectionStateChanged);

    getUserAndConnect();
    //Start Hub

    $.connection.hub.start().done(function () {
        console.log("connection.hub.start() : connected");
        // ticTacToeHub.server.setupStatus();
    }).fail(function () {
        alert("connection.hub.start() failed");
    });
    registerClientMethods(ticTacToeHub);
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

    $("#btn-accept-user").click(function (e) {
        //e.preventDefault();
        $("#confirmationModal").modal('hide');
    });


    $("#opponentBusyClose").click(function (e) {
        e.preventDefault();
        $("#opponentBusyDialog").modal('hide');
        // clearStatus();
    });

    $("#btn-dismiss-user").click(function (e) {
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
   
    $('#confirmationModal').on('show.bs.modal', function (e) {
        //debugger
        var modal = $(this)
        modal.find('.modal-title').text('You are Requested by ' + _status.requesterName);
    });

    $('#opponentBusyDialog').on('show.bs.modal', function (e) {
        var modal = $(this)
        modal.find('.modal-title').text('Your Requested Opponent is Occupied : ' + _status.requesterName);
    });

    $("#restartGame").click(function () {
        restartGame();
    });

    $("#checkAlive").click(function () {
        checkAlive();
    });
});

//function updateOnlineUserList(onlineUsers) {
//    var users = humps.camelizeKeys(onlineUsers);
//    var $result = $('#events-result');
   
//    //$('#onlineUserList').bootstrapTable({
//    //    data: users
//    //}).on('all.bs.table', function (e, name, args) {
//    //    console.log('Event:', name, ', data:', args);
//    //}).on('click-row.bs.table', function (e, row, $element) {
//    //    $result.text('Event: click-row.bs.table, data: ' + JSON.stringify(row));
//    //    //debugger
//    //    connectToOpponent(ticTacToeHub, row);
//    //}).on('dbl-click-row.bs.table', function (e, row, $element) {
//    //    $result.text('Event: dbl-click-row.bs.table, data: ' + JSON.stringify(row));
//    //}).on('load-success.bs.table', function (e, data) {
//    //    $result.text('Event: load-success.bs.table');
//    //}).on('load-error.bs.table', function (e, status) {
//    //    $result.text('Event: load-error.bs.table, data: ' + status);
//    //});
//}

function createTicTacToeBoard() {
    document.getElementById("canvasContainer").innerHTML = "";
    canvas = document.createElement("canvas");
    canvas.id = "canvasId";
    canvas.width = canvas.height = 300 + 15;
    ctx = canvas.getContext("2d");
    // canvas.addEventListener("click", cellOnClick, false);
    createBoard();
    var canvasContainer = document.getElementById("canvasContainer");
    canvasContainer.appendChild(canvas);
}
function updateOnlineUserList(onlineUsers) {
 
    $("body").off("click", "tr.getrow");
    //debugger
    var table = document.getElementById("onlineUserList").getElementsByTagName('tbody')[0];
    //for (var i = table.rows.length; i > 0; i--) {
    //    if (i === table.rows.length) {
    //        continue;
    //    }
    //    table.deleteRow(i);
    //}
    $('#onlineUserList tbody').html('');
    
    //onlineUsers = getRows();
    var j = 0;
    var $result = $('#events-result');
    for (var i = 0; i < onlineUsers.length; i++) {
        if (typeof ticTacToeHub != 'undefined' && onlineUsers[i].ConnectionId == ticTacToeHub.connection.id) {
            continue;
        }
        var row = table.insertRow(j++);
        row.className = "getrow";
        var cell1 = row.insertCell(0); cell1.className = "getrow";
        var cell2 = row.insertCell(1); cell2.className = "getrow";
        var cell3 = row.insertCell(2); cell3.className = "getrow";
        cell1.innerHTML = onlineUsers[i].ConnectionId;
        cell2.innerHTML = onlineUsers[i].UserName;
        cell3.innerHTML = onlineUsers[i].Status;
    }

    $("tr.getrow").on("click", function () {
        ////debugger
        var tableData = $(this).children("td").map(function () {
            return $(this).text();
        }).get();
       
        console.log(tableData);
        connectToOpponent(ticTacToeHub, tableData);
    });
}

function connectToOpponent(ticTacToeHub, row1) {
    //debugger
    var row = { "ConnectionId": row1[0], "UserName": row1[1], "Status": row1[2] };
    console.log("row = " + row.connectionId);
    if (!_status.connectedToOpponent && row.connectionId != "") {
        _status.connectedToOpponent = true;
        var tr = JSON.stringify(row);
      
        ticTacToeHub.server.requestToConnectionId(tr).done(function (result) {
            console.log("ticTacToeHub.server.requestToConnectionId - successful " + result);
        }).fail(function (error) {
            console.log("ticTacToeHub.server.requestToConnectionId - failed " + error);
            _status.connectedToOpponent = false;
        });
    }
    else {
        alert("already connected");
    }
}

function clearStatus() {
    _status.requesterUserId = "";
    _status.requesterName = "";
    _status.connectedToOpponent = false;
    _status.groupName = "";
    _status.opponentUserId = "";
    window.activePlayer = playerType.NONE;
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
            { ConnectionId: "id " + id, UserName: "diker" + id, Status: "fails" });
        id++;
    }
    return rows;
}

function registerClientMethods(ticTacToeHub) {

    // Calls when user successfully logged in
    ticTacToeHub.client.onConnected = function (id, userName, connectedUsers) {
        ////debugger
        // setScreen(true);
        var $connectionResult = $('#connection-result');
        $connectionResult.text(currentUserName + " Connected");
        updateOnlineUserList(connectedUsers);
    }

    // On New User Connected
    ticTacToeHub.client.onNewUserConnected = function (id, userName, connectedUsers) {
        ////debugger
        var $connectionResult = $('#connection-result');
        $connectionResult.text("UserName : " + currentUserName + " Connected");
        updateOnlineUserList(connectedUsers);
    }

    // On setup complete
    ticTacToeHub.client.setupComplete = function (connectedUsers) {
        updateOnlineUserList(connectedUsers);
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

    ticTacToeHub.client.playersReadyToPlay = function (user, opponentUser, groupName, isRestartGame) {
        //debugger
        clearStatus();
        window.groupName = "";
        // var JSONObject = jQuery.parseJSON(user);
        $("#restartGame").hide();
        var JSONObject = user;
        window.groupName = groupName;
        _status.requesterUserId = opponentUser.ConnectionId;
        _status.requesterName = opponentUser.UserName;
        _status.groupName = groupName;
        _status.opponentUserId = JSONObject.ConnectionId;
        
        if (JSONObject.ConnectionId == ticTacToeHub.connection.id) {
            console.log("playersReadyToPlay :: you are requested to play with... " + opponentUser.UserName);
            var $connectionResult = $('#player-status');
            $connectionResult.text("you are requested to play with... " + opponentUser.UserName);
            if (!isRestartGame) {
                getUserConfirmation();
            }
            if (isRestartGame) {
                createBoard();
                alert("Game Restarted");
            }
            window.activePlayer = playerType.BOT;
        } else {
            console.log("playersReadyToPlay :: your opponent is connected...");
            window.activePlayer = playerType.HUMAN;
            var $connectionResult = $('#player-status');
            $connectionResult.text("your opponent is connected...");
        }
        // var connectionIds [] = result.split("/");
    }

    ticTacToeHub.client.playYourFirstTurn = function () {
        canvas.addEventListener("click", cellOnClick, false);
        console.log("ticTacToeHub.client.playYourFirstTurn - successful");
        var $connectionResult = $('#player-status');
        $connectionResult.text("its your turn...");
        //alert("its your turn...");
        // connectedToOpponent = true;
    }

    ticTacToeHub.client.playYourTurn = function (index, activePlayer) {
        //debugger
        updateCell(index, activePlayer);
        canvas.addEventListener("click", cellOnClick, false);
        console.log("ticTacToeHub.client.playYourTurn - successful");
        var $connectionResult = $('#player-status');
        $connectionResult.text("Play your turn....");
        //alert("Play your turn....");
        // connectedToOpponent = true;
    }

    ticTacToeHub.client.updateCellOfOpponent = function(index, activePlayer){
        updateCell(index, activePlayer)
        var winner = isGameOver();
        if (winner[0]) {
            showWinnerMessage(winner);
            var $connectionResult = $('#player-status');
            $connectionResult.text("Game Over; Restart the Game");

            if (_status.requesterUserId === ticTacToeHub.connection.id) {
                //debugger
                $("#restartGame").show();
            }

            canvas.removeEventListener("click", cellOnClick, false);
            $("body").off("click", "tr.getrow");
            ////ticTacToeHub.server.removeGroup(_status.requesterUserId, _status.requesterName, _status.groupName).done(function () {
            ////    console.log("ticTacToeHub.server.removeGroup - successful ");
            ////    // connectedToOpponent = true;
            ////}).fail(function () {
            ////    console.log("ticTacToeHub.server.removeGroup - failed");
            ////});
            ticTacToeHub.server.OnlineUserList().done(function () {
                console.log("ticTacToeHub.server.updateOnlineUsers - successful " + ticTacToeHub.hubName);
                // connectedToOpponent = true;
            }).fail(function () {
                console.log("ticTacToeHub.server.updateOnlineUsers - failed");
            });
            clearStatus();
        }
        console.log("ticTacToeHub.client.updateCellOfOpponent - successful");
    }

    ticTacToeHub.client.opponentIsOccupied = function (userDetail) {
        _status.requesterName = userDetail.UserName;
        showOpponentBusy();
        clearStatus();
        console.log("ticTacToeHub.client.opponentIsOccupied - successful");
    }

    ticTacToeHub.client.updateOnlineUsers = function (connectedUsers) {
        ////debugger
        // setScreen(true);
        //var $connectionResult = $('#connection-result');
        //$connectionResult.text("onConnected : " + id + " " + userName);
        updateOnlineUserList(connectedUsers);
    }

    ticTacToeHub.client.checkAlive = function () {
        //debugger
        alert("Alive");
    }
}

function registerEvents(ticTacToeHub) {
    if ($.trim(currentUserName) != '') {
        ticTacToeHub.server.connect(currentUserName).done(function () {
            console.log("ticTacToeHub.server.connect - successful " + ticTacToeHub.hubName);
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

function getUserConfirmation() {
    $("#confirmationModal").modal();
}

function showOpponentBusy() {
    $("#opponentBusyDialog").modal();
}

function cellOnClick(evt) {
    var pos = getMousePos(canvas, evt);
    var x = pos.x;
    var y = pos.y;
    var index = Math.floor(x / 105);
    index += Math.floor(y / 105) * 3;
    canvas.removeEventListener("click", cellOnClick, false);
    if (activePlayer !== playerType.NONE && index >= 0 && index <= 8) {
        makeMove(index, activePlayer);
    }
    else {
        console.log("invalid index = " + index + " or invalid player = " + activePlayer);
    }

}

function restartGame() {
    //debugger
    createTicTacToeBoard();
    isRestartGame = true;
    ticTacToeHub.server.restartGame(_status.opponentUserId, ticTacToeHub.connection.id, groupName, isRestartGame).done(function () {
        console.log("ticTacToeHub.server.restartGame - successful");
        // connectedToOpponent = true;
    }).fail(function (e) {
        console.log("ticTacToeHub.server.restartGame - failed "+ e);
    });
    //clearStatus();
}

var SQUREWIDTH = 100;
var CELLCOLOR = "skyblue";
var playerType = {
    NONE: 0,
    HUMAN: 1,
    BOT: 2
};
var board = [];
var activePlayer = playerType.NONE;

function Cell(x, y, w, h, fill, playerType) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.fill = fill;
    this.player = playerType;
}

function createBoard() {
    var _x = 0;
    var _y = 0;
    var i = 0;

    for (var i = 0; i < 9; i++) {
        var _x = (i % 3) * 100 + 5 * (((i % 3) + 1));
        var _y = Math.floor(i / 3) * 100 + 5 * (Math.floor(i / 3) + 1);
        var cell = new Cell(_x, _y, SQUREWIDTH, SQUREWIDTH, CELLCOLOR, playerType.NONE);
        board[i] = cell;
        ctx.beginPath()
        ctx.rect(cell.x, cell.y, cell.w, cell.h);
        ctx.fillStyle = cell.fill;
        ctx.fill();
        //ctx.lineWidth = 1;
        //ctx.strokeStyle = 'black';
        //ctx.stroke();
    }
}

function hasWon(player) {

    for (var i = 0; i < 9; i += 3) {
        if (board[i].player === player && board[i + 1].player === player && board[i + 2].player === player) {
            return true;
        }
    }
    for (var i = 0; i < 3; i++) {
        if (board[i].player === player && board[i + 3].player === player && board[i + 6].player === player) {
            return true;
        }
    }

    if (board[0].player === player && board[4].player === player && board[8].player === player) {
        return true;
    }
    else if (board[2].player === player && board[4].player === player && board[6].player === player) {
        return true;
    }

    return false;
}

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}


function renderBoard(board) {
    // //debugger
    var board = board;
    var k = 0;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 3; j++) {
            var cell = board[k++];
            ctx.fillStyle = "skyblue";
            ctx.lineWidth = 3;
            ctx.strokeStyle = "black";
            ctx.lineCap = "round";
            ctx.beginPath()
            ctx.fillRect(cell.x, cell.y, cell.w, cell.h);
            if (cell.player === playerType.HUMAN) {
                ctx.arc(cell.x + SQUREWIDTH / 2, cell.y + SQUREWIDTH / 2, 30, 0, 2 * Math.PI);
            } else if (cell.player === playerType.BOT) {
                ctx.moveTo(cell.x + 20, cell.y + 20);
                ctx.lineTo(cell.x + 80, cell.y + 80);
                ctx.moveTo(cell.x + 80, cell.y + 20);
                ctx.lineTo(cell.x + 20, cell.y + 80);
            }
            ctx.fillStyle = cell.fill;
            ctx.fill();
            ctx.stroke();
        }
    }
}

function updateCell(index, activePlayer) {
    if (activePlayer != playerType.NONE && index >= 0 && index <= 8) {
        //board[index].player = activePlayer;
        //console.log("index = " + index);
        if (board[index].player === playerType.NONE) {
            board[index].player = activePlayer;
            renderBoard(board);
        }
    }
}

function makeMove(index, activePlayer) {
    //debugger   
    if (activePlayer === window.activePlayer) {
        updateCell(index, activePlayer);
        var winner = isGameOver();
        if (winner[0]) {
            updateCellOfOpponent(index, window.activePlayer);
            //debugger
            showWinnerMessage(winner);
            var $connectionResult = $('#player-status');
            $connectionResult.text("Game Over; Restart the Game");

            if (_status.requesterUserId === ticTacToeHub.connection.id) {
                //debugger
                $("#restartGame").show();
            }
            canvas.removeEventListener("click", cellOnClick, false);
            $("body").off("click", "tr.getrow");

            //TO REMOVE GROUP
            ////ticTacToeHub.server.removeGroup(_status.requesterUserId, _status.requesterName, _status.groupName).done(function () {
            ////    console.log("ticTacToeHub.server.removeGroup - successful ");
            ////    // connectedToOpponent = true;
            ////}).fail(function () {
            ////    console.log("ticTacToeHub.server.removeGroup - failed");
            ////});
            // clearStatus();
            ticTacToeHub.server.OnlineUserList().done(function () {
                console.log("ticTacToeHub.server.updateOnlineUsers - successful " + ticTacToeHub.hubName);
                // connectedToOpponent = true;
            }).fail(function () {
                console.log("ticTacToeHub.server.updateOnlineUsers - failed");
            });
            return;
        }
        else {

            makeMoveByOpponentPlayer(index, activePlayer, groupName);
        }
        var $connectionResult = $('#player-status');
        $connectionResult.text("waiting for apponent move...");
        //alert("waiting for apponent move...");
    }
}

function updateCellOfOpponent(index, activePlayer) {
    ticTacToeHub.server.updateCellOfOpponent(index, activePlayer, groupName).done(function () {
        console.log(" ticTacToeHub.server.updateCellOfOpponent - successful");
    }).fail(function () {
        console.log(" ticTacToeHub.sserver.updateCellOfOpponent - failed");
    });
}

function checkAlive() {
    ticTacToeHub.server.checkAlive(ticTacToeHub.connection.id, _status.groupName).done(function () {
        console.log(" ticTacToeHub.server.checkAlive - successful");
    }).fail(function () {
        console.log(" ticTacToeHub.sserver.checkAlive - failed");
    });
}

function makeMoveByOpponentPlayer(index, activePlayer, groupName) {
    //debugger
    ticTacToeHub.server.playYourTurn(index, activePlayer, groupName).done(function () {
        console.log("ticTacToeHub.server.playYourTurn - successful");
        // connectedToOpponent = true;
    }).fail(function () {
        console.log("ticTacToeHub.server.playYourTurn - failed");
    });
}

function isGameOver() {
    ////debugger
    var winner = playerType.NONE;
    var isGameOver = true;

    if (hasWon(playerType.BOT)) {
        winner = playerType.BOT;
        console.log("BOT wins");
        return [true, winner];
    } else if (hasWon(playerType.HUMAN)) {
        winner = playerType.HUMAN;
        console.log("HUMAN wins");
        return [true, winner];
    }

    for (var i = 0; i < board.length; i++) {
        if (board[i].player === playerType.NONE) {
            isGameOver = false;
            break;
        }
    }

    if (isGameOver) {
        console.log("its a draw...");
        return [true, winner];
    }

    return [isGameOver, winner];
}


function showWinnerMessage(winner) {
    var mesg = "";
    switch (winner[1]) {
        case playerType.BOT:
            if (window.activePlayer == playerType.BOT) {
                mesg = "  you are the winner...";
            }
            else {
                mesg = " your Opponent is the winner... ";
            }

            break;
        case playerType.HUMAN:
            if (window.activePlayer == playerType.HUMAN) {
                mesg = "  you are the winner... ";
            }
            else {
                mesg = " your Opponent is the winner...";
            }

            break;
        case playerType.NONE:
            mesg = " its a draw... ";
            break;
    }

    alert("Game is over..." + mesg);
}

function getActivePlayer() {
    return activePlayer === playerType.NONE ? playerType.HUMAN : activePlayer === playerType.HUMAN ? playerType.BOT : playerType.HUMAN;
}



