var currentUserName;

$(document).ready(function () {
    console.log("ready!");
    setScreen();

    $('#onlineUserList').bootstrapTable({
        data: getRows()
    });


    //Declare a proxy to reference the hub. 
    var ticTacToeHub = $.connection.ticTacToeHub;
    $.connection.hub.logging = true;
    registerClientMethods(ticTacToeHub);
    getUserAndConnect();
    //Start Hub

    $.connection.hub.start().done(function () {
        registerEvents(ticTacToeHub)
        console.log("connection.hub.start() : connected");
    }).fail(function () {
        alert("connection.hub.start() failed");
    });
    getUserAndConnect();

    $("#btn-save-user").click(function (e) {
        e.preventDefault();
        var name = $("#userName").val();
        if ($.trim(name) != '') {
            currentUserName = name;
            $("#userNameDialog").modal('hide');
        }
        else {
        }
    })

    
    $('#onlineUserList').click(function (e) {
        //$(this).hide();
        e.preventDefault();
        debugger
        var $result = $('#events-result');

        $('#events-table').bootstrapTable({
        }).on('all.bs.table', function (e, name, args) {
            console.log('Event:', name, ', data:', args);
        }).on('click-row.table', function (e, row, $element) {
            $result.text('Event: click-row.bs.table, data: ' + JSON.stringify(row));
        }).on('dbl-click-row.bs.table', function (e, row, $element) {
            $result.text('Event: dbl-click-row.bs.table, data: ' + JSON.stringify(row));
        }).on('sort.bs.table', function (e, name, order) {
            $result.text('Event: sort.bs.table, data: ' + name + ', ' + order);
        }).on('check.bs.table', function (e, row) {
            $result.text('Event: check.bs.table, data: ' + JSON.stringify(row));
        }).on('uncheck.bs.table', function (e, row) {
            $result.text('Event: uncheck.bs.table, data: ' + JSON.stringify(row));
        }).on('check-all.bs.table', function (e) {
            $result.text('Event: check-all.bs.table');
        }).on('uncheck-all.bs.table', function (e) {
            $result.text('Event: uncheck-all.bs.table');
        }).on('load-success.bs.table', function (e, data) {
            $result.text('Event: load-success.bs.table');
        }).on('load-error.bs.table', function (e, status) {
            $result.text('Event: load-error.bs.table, data: ' + status);
        }).on('column-switch.bs.table', function (e, field, checked) {
            $result.text('Event: column-switch.bs.table, data: ' +
                field + ', ' + checked);
        }).on('page-change.bs.table', function (e, size, number) {
            $result.text('Event: page-change.bs.table, data: ' + number + ', ' + size);
        }).on('search.bs.table', function (e, text) {
            $result.text('Event: search.bs.table, data: ' + text);
        });
    });
});

function updateOnlineUserList(onlineUsers) {
    var users = humps.camelizeKeys(onlineUsers);

    $('#onlineUserList').bootstrapTable({
        data: users
    });
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
        ticTacToeHub.server.connect(currentUserName);
        var $connectionResult = $('#connection-result');
        $connectionResult.text("you are connected" + userName);
    }

}

function getUserAndConnect() {
    $("#userNameDialog").modal();
}