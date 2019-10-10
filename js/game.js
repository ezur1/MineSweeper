'use strict';

var MINE = '<img src="img/bomb.png">';
var COOL = '<img src="img/cool.png" >';
var HAPPY = '<img src="img/happy.png" onclick="init(gLevel)" >';
var INJURY = '<img src="img/injury.png">';
var FLAG = '<img src="img/flag.png">';
var HEART = '<img src="img/heart.png" >';
var DEAD = '<img src="img/dead.png" >';
var SAFE = '<img src="img/safe.png" onclick="safeClick()" >';

var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    hearts: 3,
    safeClicks: 3,
    secsPassed: 0
};
var gLevels = [{
        NAME: 'Easy',
        SIZE: 4,
        MINES: 4
    },
    {
        NAME: 'Moderat',
        SIZE: 8,
        MINES: 12
    },
    {
        NAME: 'Hard',
        SIZE: 12,
        MINES: 20
    }
];

var gMines = [];
var gLevel;
var gBoard;
var gFirstClickNegs;
var gFirstClickLoc;
var gTimer;

function levels() {
    renderLevels();
    document.querySelector('.highScoore').style.display = 'block';
    renderHighScooreList();
}

function init(levelIdx) {
    clearInterval(gTimer);
    var elModal = document.querySelector('.modal');
    elModal.style.display = 'none';
    gGame.isOn = false;
    gGame.shownCount= 0;
    gGame.safeClicks = 3;
    gGame.hearts = 3;
    gLevel = levelIdx;
    gFirstClickLoc = null;
    gFirstClickNegs = [];
    gMines = [];
    gBoard = buildBoard(gLevels[levelIdx].SIZE);
    printMat(gBoard, '.board-container', levelIdx);
    var table = document.querySelector('.board-container');
    if (levelIdx === 0) table.classList.add('easyT');
    else if (levelIdx === 1) table.classList.add('moderatT');
    else table.classList.add('hardT');
    var elSmiley = document.querySelector('.smiley');
    elSmiley.innerHTML = HAPPY;
    var elHearts = document.querySelector('.hearts');
    elHearts.innerHTML = HEART + HEART + HEART;
    var elSafeClick = document.querySelector('.safe');
    elSafeClick.innerHTML = SAFE + SAFE + SAFE;
    document.querySelector('.highScoore').style.display = 'none';
}

function expandSpot(btn, i, j) {
    var location = {
        i: i,
        j: j
    };
    if (!gGame.isOn) {
        var elTimer = document.querySelector('.timer');
        elTimer.innerText = '0:0';
        setTimer();
        gFirstClickLoc = location;
        gFirstClickNegs = countMines(i, j);

        for (var x = 0; x < gLevels[gLevel].MINES; x++) {
            createMine(gLevels[gLevel].SIZE);
        }
        gGame.isOn = true;
        updateMineCountObj(gBoard);
        printMat(gBoard, '.board-container');
        console.log(gBoard);
    }
    if (gBoard[i][j].isShown) return;
    if (gBoard[i][j].isMine) {
        var elHearts = document.querySelector('.hearts');
        if (gGame.hearts === 3) {
            elHearts.innerHTML = HEART + HEART;
            renderCell(location, MINE);
            gGame.hearts--;
            console.log(gGame.hearts);
            
        } else if (gGame.hearts === 2) {
            elHearts.innerHTML = HEART;
            renderCell(location, MINE);
            gGame.hearts--;
            console.log(gGame.hearts);
        } else gameOver();
    } else {
        renderCell(location, (gBoard[i][j].minesAroundCount === 0) ? '' : gBoard[i][j].minesAroundCount);
        if (gBoard[i][j].minesAroundCount === 0) {
            btn.classList.add('checked');
            findEmpties(i, j, gBoard);
        } else findNegs(i, j, gBoard)
        
    }
    // debugger;
    if((gGame.shownCount>=(gLevels[gLevel].SIZE**2)-gLevels[gLevel].MINES)&&(gGame.markedCount === gLevels[gLevel].MINES))victory();
    else if((gGame.shownCount>(gLevels[gLevel].SIZE**2)-gLevels[gLevel].MINES)&&gGame.hearts>0)victory();

}


function createMine(size) {
    var mine = {
        i: getRandomIntInclusive(0, size - 1),
        j: getRandomIntInclusive(0, size - 1)
    };
    for (var x = 0; x < gMines.length; x++) {
        if (gMines[x].i === mine.i && gMines[x].j === mine.j) createMine(size);
    }
    for (var y = 0; y < gFirstClickNegs.length; y++) {
        if (mine.i === gFirstClickNegs[y].i && mine.j === gFirstClickNegs[y].j) createMine(size);
    }
    // debugger;
    if (mine.i !== gFirstClickLoc.i && mine.j !== gFirstClickLoc.j && gMines.length < gLevels[gLevel].MINES) {
        gMines.push(mine);
        // console.log(gMines);

        gBoard[mine.i][mine.j].isMine = true;
    } else if (gMines.length < gLevels[gLevel].MINES) createMine(size);
    else return;

}

function cellMarked(elCell, event, idxI, idxJ) {
    if (event.type === "contextmenu") event.preventDefault();
    if (!gBoard[idxI][idxJ].isShown && !gBoard[idxI][idxJ].isMarked) {
        elCell.innerHTML = FLAG;
        (gBoard[idxI][idxJ].isMine)?gBoard[idxI][idxJ].isMarked = true:gBoard[idxI][idxJ].isMarked = false;
        gGame.markedCount++;

    } else if (!gBoard[idxI][idxJ].isShown) {
        elCell.innerHTML = '';
        gBoard[idxI][idxJ].isMarked = false;
        gGame.markedCount--;
    }
    console.log('Marked count: '+gGame.markedCount);
    // debugger;
    if((gGame.shownCount>=(gLevels[gLevel].SIZE**2)-gLevels[gLevel].MINES)&&(gGame.markedCount === gLevels[gLevel].MINES))victory();
    else if((gGame.shownCount>(gLevels[gLevel].SIZE**2)-gLevels[gLevel].MINES)&&gGame.hearts>0)victory();
}

function safeClick() {
    var rendI = getRandomIntInclusive(0, gBoard.length - 1);
    var rendJ = getRandomIntInclusive(0, gBoard.length - 1);

    for (var i = rendI; i < gBoard.length; i++) {
        for (var j = rendJ; j < gBoard.length; j++) {
            if (!gBoard[i][j].isShown && !gBoard[i][j].isMarked && !gBoard[i][j].isMine) {
                var className = '.cell' + i + '-' + j;
                var cell = document.querySelector(`${className}`);
                cell.classList.remove('cell');
                cell.classList.add('safe-click');
                setTimeout(function () {
                    cell.classList.remove('safe-click');
                    cell.classList.add('cell');
                }, 1000);
                gGame.safeClicks--;
                var elSafeClick = document.querySelector('.safe');
                if (gGame.safeClicks === 2) elSafeClick.innerHTML = SAFE + SAFE;
                else if (gGame.safeClicks === 1) elSafeClick.innerHTML = SAFE;
                else elSafeClick.innerHTML = '';
                return;
            }
        }

    }
}

function gameOver() {
    gGame.isOn = false;
    clearInterval(gTimer);
    showAllMines();
    var elSmiley = document.querySelector('.smiley');
    elSmiley.innerHTML = INJURY;
    var elHearts = document.querySelector('.hearts');
    elHearts.innerHTML = DEAD;
    var elModal = document.querySelector('.modal');
    elModal.style.display = 'block';
    elModal.style.height = '250px';
    var txt2 = elModal.querySelector('h5');
    txt2.style.display = 'none';
    var txt = elModal.querySelector('h3');
    txt.innerText = 'Oh no,\n You Lost.. \n ';
    var elInput = elModal.querySelector('input');
    elInput.style.display = 'none';
    document.querySelector('.highScoore').style.display = 'block';
    renderHighScooreList();

}

function victory() {
    gGame.isOn = false;
    clearInterval(gTimer);
    var elSmiley = document.querySelector('.smiley');
    elSmiley.innerHTML = COOL;
    var elModal = document.querySelector('.modal');
    elModal.style.height = '340px';
    elModal.style.display = 'block';
    var txt = elModal.querySelector('h3');
    txt.innerText = 'Such a Winner! \n Awsome job!';
    var txt2 = elModal.querySelector('h5');
    txt2.style.display = 'block';
    var elInput = elModal.querySelector('input');
    elInput.style.display = 'inline-block';
    txt2.innerText = 'Enter your name to save your score!';
    document.querySelector('.highScoore').style.display = 'block';
    renderHighScooreList();
}