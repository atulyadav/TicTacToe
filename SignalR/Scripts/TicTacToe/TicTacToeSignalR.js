$(document).ready(function () {
    console.log("ready!");
    setScreen();
    // Declare a proxy to reference the hub. 
    //var ticTacToeHub = $.connection.ticTacToeHub;
    //registerClientMethods(ticTacToeHub);
    //getUserAndConnect();
    // Start Hub
    //$.connection.hub.start().done(function () {

    //    registerEvents(chatHub)

    //});
    getUserAndConnect();
    $('#basic-events-table').next().click(function () {
        $(this).hide();
        var $result = $('#events-result');
        $('#events-table').bootstrapTable({
        }).on('all.bs.table', function (e, name, args) {
            console.log('Event:', name, ', data:', args);
        }).on('click-row.bs.table', function (e, row, $element) {
            $result.text('Event: click-row.bs.table, data: ' + JSON.stringify(row));
        }).on('dbl-click-row.bs.table', function (e, row, $element) {
            $result.text('Event: dbl-click-row.bs.table, data: ' + JSON.stringify(row));
        }).on('load-success.bs.table', function (e, data) {
            $result.text('Event: load-success.bs.table');
        }).on('load-error.bs.table', function (e, status) {
            $result.text('Event: load-error.bs.table, data: ' + status);
        });
    });
    $("#btn-save-user").click(function (e) {
        e.preventDefault();
       // $("#userNameDialog").modal('hide');
    })
});

function updateOnlineUserList(onlineUsers) {
    $('#table').bootstrapTable({
        data: onlineUsers
    });
}

function setScreen(isLogin) {

    if (!isLogin) {
    }
    else {
    }

}

function registerClientMethods(chatHub) {

    // Calls when user successfully logged in
    chatHub.client.onConnected = function (id, userName) {

        setScreen(true);
        var $connectionResult = $('#connection-result');
        $connectionResult.text("onConnected : " + id + " " + userName);
    }

    // On New User Connected
    chatHub.client.onNewUserConnected = function (id, name) {

        var $connectionResult = $('#connection-result');
        $connectionResult.text("onNewUserConnected : " + id + " " + userName);
    }

    // On User Disconnected
    chatHub.client.onUserDisconnected = function (id, userName) {

        var $connectionResult = $('#connection-result');
        $$connectionResult.text("onUserDisconnected : " + id + " " + userName);

        //$(disc).hide();
        //$('#divusers').prepend(disc);
        //$(disc).fadeIn(200).delay(2000).fadeOut(200);
    }

    chatHub.client.messageReceived = function (userName, message) {
      
    }


    chatHub.client.sendPrivateMessage = function (windowId, fromUserName, message) {

    }

}

function registerEvents(chatHub) {

    $("#btnStartChat").click(function () {

        var name = $("#txtNickName").val();
        if (name.length > 0) {
            chatHub.server.connect(name);
        }
        else {
            alert("Please enter name");
        }
    });
}

function getUserAndConnect() {   
    $("#userNameDialog").modal();
}