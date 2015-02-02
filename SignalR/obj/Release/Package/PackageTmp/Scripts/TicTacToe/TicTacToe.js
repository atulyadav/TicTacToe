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

function cellOnClick(evt) {
    var pos = getMousePos(canvas, evt);
    var x = pos.x;
    var y = pos.y;
    var index = Math.floor(x / 105);
    index += Math.floor(y / 105) * 3;

    activePlayer = getActivePlayer();
    if (activePlayer !== playerType.NONE && index >= 0 && index <= 8) {
        makeMove(index, activePlayer);
    }
    else {
        console.log("invalid index = " + index + " or invalid player = " + activePlayer);
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
    if (activePlayer === playerType.HUMAN) {
        updateCell(index, activePlayer);
        var winner = isGameOver();
        if (winner[0]) {
            showWinnerMessage(winner);
            canvas.removeEventListener("click", cellOnClick, false);
            return;
        }
        //chek for winner or drow if not then call BOT
        window.activePlayer = getActivePlayer();
        makeMoveByBOT();
        var winner = isGameOver();
        if (winner[0]) {
            showWinnerMessage(winner);
            canvas.removeEventListener("click", cellOnClick, false);
            return;
        }
    }
}

function showWinnerMessage(winner) {
    var mesg = "";
    switch (winner[1]) {
        case playerType.BOT:
            mesg = " BOT is the winner... ";
            break;
        case playerType.HUMAN:
            mesg = "  you are the winner... ";
            break;
        case playerType.NONE:
            mesg = " its a draw... ";
            break;
    }

    alert("Game is over..." + mesg);
}

function makeMoveByBOT() {

    if (activePlayer === playerType.BOT) {
        var move = [];
        move = minimax(7, activePlayer);
        var indx = move[1];
        //debugger
        if (indx >= 0 && indx <= 8) {
            console.log("index moved by BOT = " + indx + " and scor = " + move[0]);
            updateCell(indx, activePlayer);
        }
    }
}

function getActivePlayer() {
    return activePlayer === playerType.NONE ? playerType.HUMAN : activePlayer === playerType.HUMAN ? playerType.BOT : playerType.HUMAN;
}

function isGameOver() {
    //debugger
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

function renderBoard(board) {
    // debugger
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

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

function printBoard(board) {
    var board = board;
    for (var i = 0; i < board.length; i++) {
        console.log(" index=>" + i + " x = " + board[i].x + " y = " + board[i].y + " playerType = " + board[i].player);
    }
}

function minimax(depth, player) {
    /** Recursive minimax at level of depth for either maximizing or minimizing player.
Return int[3] of {score, row, col}  */

    // Generate possible next moves in a List of int[2] of {row, col}.
    var nextMoves = generateMoves();

    // mySeed is maximizing; while oppSeed is minimizing
    var bestScore = (player === playerType.BOT) ? -1e100 : 1e100;
    var currentScore;
    var bestCell = -1;

    if (nextMoves.length == 0 || depth == 0) {
        // Gameover or depth reached, evaluate score
        bestScore = evaluate();
    }
    else {
        for (var i = 0; i < nextMoves.length; i++) {

            var m = nextMoves[i];
            // Try this move for the current "player"
            board[m].player = player;
            if (player === playerType.BOT) {  // mySeed (computer) is maximizing player
                currentScore = minimax(depth - 1, playerType.HUMAN)[0];
                if (currentScore > bestScore) {
                    bestScore = currentScore;
                    bestCell = m;
                }
            }
            else {  // oppSeed is minimizing player
                currentScore = minimax(depth - 1, playerType.BOT)[0];
                if (currentScore < bestScore) {
                    bestScore = currentScore;
                    bestCell = m;
                }
            }
            // Undo move
            board[m].player = playerType.NONE;
        }
    }
    return [bestScore, bestCell];

}

/** The heuristic evaluation function for the current board
@Return +100, +10, +1 for EACH 3-, 2-, 1-in-a-line for computer.
-100, -10, -1 for EACH 3-, 2-, 1-in-a-line for opponent.
0 otherwise   */


function evaluate() {
    var s = 0;
    // Evaluate score for each of the 8 lines (3 rows, 3 columns, 2 diagonals)
    s += evaluateLine(0, 1, 2);
    s += evaluateLine(3, 4, 5);
    s += evaluateLine(6, 7, 8);
    s += evaluateLine(0, 3, 6);
    s += evaluateLine(1, 4, 7);
    s += evaluateLine(2, 5, 8);
    s += evaluateLine(0, 4, 8);
    s += evaluateLine(2, 4, 6);
    return s;

}

function generateMoves() {
    var nextMoves = []; // allocate List
    var i = 0;
    // If gameover, i.e., no next move
    if (hasWon(playerType.BOT) || hasWon(playerType.HUMAN)) {
        //Console.WriteLine("WooooooooooooN");
        return nextMoves;   // return empty list
    }

    // Search for empty cells and add to the List
    for (var row = 0; row < 9; row++) {
        if (board[row].player === playerType.NONE) {
            nextMoves[i++] = row;
        }
    }
    return nextMoves;
}

/** The heuristic evaluation function for the given line of 3 cells
@Return +100, +10, +1 for 3-, 2-, 1-in-a-line for computer.
       -100, -10, -1 for 3-, 2-, 1-in-a-line for opponent.
       0 otherwise */
function evaluateLine(indx1, indx2, indx3) {
    var score = 0;

    // First cell
    if (board[indx1].player === playerType.BOT) {
        score = 1;
    }
    else if (board[indx1].player === playerType.HUMAN) {
        score = -1;
    }

    // Second cell
    if (board[indx2].player === playerType.BOT) {
        if (score == 1) {   // cell1 is mySeed
            score = 10;
        }
        else if (score == -1) {  // cell1 is oppSeed
            return 0;
        }
        else {  // cell1 is empty
            score = 1;
        }
    }
    else if (board[indx1].player === playerType.HUMAN) {
        if (score == -1) { // cell1 is oppSeed
            score = -10;
        }
        else if (score == 1) { // cell1 is mySeed
            return 0;
        }
        else {  // cell1 is empty
            score = -1;
        }
    }

    // Third cell
    if (board[indx3].player === playerType.BOT) {
        if (score > 0) {  // cell1 and/or cell2 is mySeed
            score *= 10;
        }
        else if (score < 0) {  // cell1 and/or cell2 is oppSeed
            return 0;
        }
        else {  // cell1 and cell2 are empty
            score = 1;
        }
    }
    else if (board[indx1].player === playerType.HUMAN) {
        if (score < 0) {  // cell1 and/or cell2 is oppSeed
            score *= 10;
        }
        else if (score > 1) {  // cell1 and/or cell2 is mySeed
            return 0;
        }
        else {  // cell1 and cell2 are empty
            score = -1;
        }
    }
    return score;
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


window.onload = function main() {
    canvas = document.createElement("canvas");
    canvas.id = "canvasId";
    canvas.width = canvas.height = 300 + 15;
    ctx = canvas.getContext("2d");
    canvas.addEventListener("click", cellOnClick, false);
    createBoard();
    document.body.appendChild(canvas);

    //SIGNALR
    // Declare a proxy to reference the hub. 
    var chatHub = $.connection.chatHub;

    registerClientMethods(chatHub);

    // Start Hub
    $.connection.hub.start().done(function () {

       // registerEvents(chatHub)

    });

    //activePlayer = playerType.NONE;
    //printBoard(board);
}
