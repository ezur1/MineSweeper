'use strict';

function buildBoard(size) {
    var board = [];

    for (var i = 0; i < size; i++) {
        board.push([]);
        for (var j = 0; j < size; j++) {
            board[i][j] = {
                isShown: false,
                isMarked: false,
                isMine: false
            };
        }
    }
    return board;
}

function printMat(board, selector) {
    var cell;
    var strHTML = '<table><tbody>';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < board[0].length; j++) {
            // if (board[i][j].isMine === true) cell = MINE;
            // else 
            cell = '';
            var className = 'cell cell' + i + '-' + j;
            strHTML += `<td oncontextmenu="cellMarked(this,event,${i},${j})" onclick="expandSpot(this,${i},${j})" class="${className}">${cell}</td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>';
    var elContainer = document.querySelector(selector);
    elContainer.innerHTML = strHTML;
    console.log(elContainer);

}

function renderCell(location, value) {
    var elCell = document.querySelector(`.cell${location.i}-${location.j}`);
    elCell.innerHTML = value;
    var x = location.i;
    var y = location.j;
    if (gBoard[x][y].minesAroundCount === 0 && !gBoard[x][y].isMine) elCell.classList.add('checked');
    if (!gBoard[x][y].isShown) {
        gBoard[x][y].isShown = true;
        gGame.shownCount++;
        console.log('shown count: ' + gGame.shownCount);

    }
}

function renderLevels() {
    var strHTML = '';
    for (var i = 0; i < gLevels.length; i++) {
        strHTML += `<button class="btn" onclick="init(${i})">${gLevels[i].NAME}</button>`;
    }
    var elAnswer = document.querySelector('.board-container');
    elAnswer.innerHTML = strHTML;
}

function countMines(cellI, cellJ) {
    var minesCount = 0;
    var negsLocation = [];
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue;
            if (i === cellI && j === cellJ) continue;
            if (gBoard[i][j].isMine) {
                minesCount++;
            }
            if (!gGame.isOn) negsLocation.push({
                i: i,
                j: j
            });
        }
    }
    if (!gGame.isOn) return negsLocation;
    return minesCount;
}

function findEmpties(cellI, cellJ, board) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= board[i].length) continue;
            if (i === cellI && j === cellJ) continue;
            if (board[i][j].isShown) continue;
            if (!gBoard[i][j].isMine) {
                var location = {
                    i: i,
                    j: j
                };
                var className = '.cell' + i + '-' + j;
                var cell = document.querySelector(`${className}`);
                renderCell(location, (gBoard[i][j].minesAroundCount === 0) ? '' : gBoard[i][j].minesAroundCount);
                if (cell.innerText === '') {
                    (cell.classList.contains('checked')) ? console.log(''): cell.classList.add('checked');
                    findEmpties(i, j, gBoard);
                }
            }
        }
    }
}

function findNegs(cellI, cellJ, board) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= board[i].length) continue;
            if (i === cellI && j === cellJ) continue;
            if (board[i][j].isShown) continue;
            if (!gBoard[i][j].isMine) {
                var location = {
                    i: i,
                    j: j
                };
                if (gBoard[i][j].minesAroundCount !== 0) renderCell(location, gBoard[i][j].minesAroundCount);
                else continue;
            }
        }
    }
}

function showAllMines() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            var location = {
                i: i,
                j: j
            };
            if (gBoard[i][j].isMine || gBoard[i][j].isMarked) renderCell(location, MINE);
        }
    }
}

function updateMineCountObj(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            board[i][j].minesAroundCount = countMines(i, j, board)
        }
    }
}

function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function setTimer() {
    var sec = 0;
    var min = 0;
    var elTimer = document.querySelector('.timer');
    elTimer.innerText = min + ':' + sec;
    gTimer = setInterval(function () {
        if (sec === 60) {
            min++;
            sec = 0;
        }
        sec++;
        elTimer.innerText = min + ':' + sec;

    }, 1000);

}

function saveToLS() {
    var elInput = document.querySelector('input').value;
    if (elInput.length > 0) {
        var elTimer = document.querySelector('.timer').innerText;
        localStorage.setItem(elInput, elTimer + ' - ' + gLevels[gLevel].NAME);
    }

}

function renderHighScooreList() {
    var names = Object.keys(localStorage);
    var scoores = [];
    var i = names.length;

    while (i--) {
        scoores.push(localStorage.getItem(names[i]));
    }
    console.log(names);
    console.log(scoores);





    var strHTML = '<h3>Best Players</h3><ol>';
    for (var i = 0; i < names.length; i++) {
        strHTML += `<li> ${names[i]}  -  ${scoores[i]}</li>`
    }
    strHTML += '</ol>';
    var elContainer = document.querySelector('.highScoore');
    elContainer.innerHTML = strHTML;
    // console.log(elContainer);
}