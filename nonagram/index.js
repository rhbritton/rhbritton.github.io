$(function() {

let d = new Date();
let timerSelect = document.querySelector('.timer .text');
setInterval(function() {
    timerSelect.innerHTML = Math.floor((new Date()-d)/1000);
}, 50)

let timerDiv = document.querySelector('.timer');
let oscillate = 1;
setInterval(function() {
    if (!oscillate) {
        oscillate = 1;
        timerDiv.setAttribute('style', 'font-size: 6em;');
    } else {
        oscillate = 0;
        timerDiv.setAttribute('style', 'font-size: 10em;');
    }
    
}, 1000)

let isMouseDown = false;

let selectType = $('[data-type][data-selected="true"]').attr('data-type');
let boardSize = { x: 10, y: 10 };
let messUps = 0;

let $board = $('#board');

let percentChanceBlue = 0.4;

// tile.js
let Tile = {};
Tile.getHTML = function(x, y, answer) {
    return `
        <div 
            class="tile" 
            data-x="`+x+`"
            data-y="`+y+`" 
            data-answer="`+answer+`"
        ></div>
    `;
}

Tile.create = function(x, y) {
    let answer = Math.random();
    if (answer <= percentChanceBlue) {
        answer = 1;
    } else {
        answer = 0;
    }

    let html = Tile.getHTML(x, y, answer);

    return {
        answer: !!answer,
        html: html
    }
}

Tile.checkAnswer = function($tile, answerToCheck) {
    console.log($tile.attr('data-answer'))
    console.log(answerToCheck)
    return answerToCheck == $tile.attr('data-answer');
}



// board.js
let Board = {};
let boardSolution = {};

Board.clear = function() {
    boardSolution = {};
    $board.empty();
}

Board.getHintNums = function(axis, i) {
    let nums = [];
    console.log(boardSolution)
    if (axis == 'y') {
        let count = 0;
        for (var j=0; j<boardSize.y; j++) {
            if (boardSolution[j][i].answer) {
                count++;
            } else {
                if (count) {
                    nums.push(count);
                    count = 0;
                }
            }
        }

        if (count) {
            nums.push(count);
            count = 0;
        }
    } else if (axis == 'x') {
        let count = 0;
        for (var j=0; j<boardSize.x; j++) {
            if (boardSolution[i][j].answer) {
                count++;
            } else {
                if (count) {
                    nums.push(count);
                    count = 0;
                }
            }
        }

        if (count) {
            nums.push(count);
            count = 0;
        }
    }

    return nums;
}

Board.getHintsHTML = function(hintsArr) {
    let hintsHTML = '<div class="hints">';
    
    hintsArr.forEach(function(hint) {
        hintsHTML += `
            <span class="hint">
                `+hint+`
            </span>
        `;
    });

    hintsHTML += `</div>`;
    
    return hintsHTML;
}

Board.addNumberHints = function(axis, i) {
    let hintNums = Board.getHintNums(axis, i);
    console.log(hintNums)
    let hintHTML = Board.getHintsHTML(hintNums);
    
    let $hints = $('.hints_'+axis);
    $hints.append(hintHTML);
}

Board.addTile = function(x, y) {
    let tile = Tile.create(x, y);

    if (!boardSolution[x])
        boardSolution[x] = {};

    boardSolution[x][y] = tile;
    $board.append(tile.html);
}

Board.generate = function() {
    Board.clear();

    for (var i=0; i<boardSize.y; i++) {
        for (var j=0; j<boardSize.x; j++) {
            Board.addTile(j, i);
        }
    }

    for (var i=0; i<boardSize.y; i++) {
        Board.addNumberHints('y', i);
    }
    
    for (var i=0; i<boardSize.x; i++) {
        Board.addNumberHints('x', i);
    }
}






// index.js
Board.generate();

let $messUpText = $('.messUpText');
function clickTile($tile) {
    if (selectType == 'select' && Tile.checkAnswer($tile, '1')) {
        $tile.attr('data-answered', 'true');
    } else if (selectType == 'prevent' && Tile.checkAnswer($tile, '0')) {
        $tile.attr('data-answered', 'true');
    } else if ($tile.attr('data-answered') != 'true') {
        isMouseDown = false;
        messUps++;
        $messUpText.html(messUps);
    }
}

$('body').mouseup(function() {
    isMouseDown = false;
})

$('#board').on('mousedown touchstart', '.tile', function() {
    isMouseDown = true;

    let $tile = $(this);
    if ($tile.attr('data-answered') != 'true') {
        clickTile($tile);
    }
})

$('#board').on('mousemove touchmove', '.tile', function(e) {
    if (isMouseDown) {
        console.log(e)
        console.log(e.currentTarget)
        console.log(e.target)

        let $tile = $(this);

        if ($tile.attr('data-answered') != 'true') {
            clickTile($tile);
        }
    }
})

$('[data-type="select"]').click(function() {
    $('[data-type="prevent"]').removeAttr('data-selected');
    $(this).attr('data-selected', true);
    
    selectType = 'select';
});

$('[data-type="prevent"]').click(function() {
    $('[data-type="select"]').removeAttr('data-selected');
    $(this).attr('data-selected', true);
    
    selectType = 'prevent';
});



});