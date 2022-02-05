$(function() {

let isMouseDown = false;
$('body').mouseup(function() {
    isMouseDown = false;
})

let selectType = $('[data-type][data-selected="true"]').attr('data-type');

let $board = $('#board');

// timer.js
let Timer = {};
let d = new Date();
let timerSelect = document.querySelector('.timer .text');
let timerDiv = document.querySelector('.timer');
let oscillate = 1;

Timer.start = function() {
    d = new Date();
    setInterval(Timer.update, 50);
    setInterval(Timer.oscillate, 1000);
}

Timer.update = function() {
    timerSelect.innerHTML = Math.floor((new Date()-d)/1000);
}

Timer.oscillate = function() {
    if (!oscillate) {
        oscillate = 1;
        timerDiv.setAttribute('style', 'font-size: 6em;');
    } else {
        oscillate = 0;
        timerDiv.setAttribute('style', 'font-size: 10em;');
    }
}



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






// game.js
let Game = {};
let $messUpText = $('.messUpText');

let boardSize = { x: 15, y: 15 };
let percentChanceBlue = 0.5;
let messUps = 0;

Game.start = function(size, difficulty) {
    messUps = 0;
    boardSize = { x: size, y: size };

    if (difficulty == 'easy') {
        percentChanceBlue = 0.6;
    } else if (difficulty == 'medium') {
        percentChanceBlue = 0.5;
    } else if (difficulty == 'hard') {
        percentChanceBlue = 0.4;
    }

    Board.generate();
    Timer.start();
}

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

Game.addEventListeners = function() {
    $('#board').on('mousedown', '.tile', function() {
        isMouseDown = true;
    
        let $tile = $(this);
        if ($tile.attr('data-answered') != 'true') {
            clickTile($tile);
        }
    })
    
    // $('#board').on('mousemove touchmove', '.tile', function(e) {
    //     if (isMouseDown) {
    //         let $tile = $(this);
    
    //         if ($tile.attr('data-answered') != 'true') {
    //             clickTile($tile);
    //         }
    //     }
    // })
    
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
}


// settings.js
$('#startGame').click(function() {
    let difficulty = Select.getSelectValue('difficulty');
    let size = Select.getSelectValue('size');

    Game.start(size, difficulty);
    $('[data-view="game"]').attr('data-gamesize', size);
    View.change('game');
});


// views.js
let View = {};
View.change = function(id) {
    $('[data-view]').hide();
    $('[data-view="'+id+'"]').show();
}


// select.js
let Select = {};

$('[data-option]').click(function() {
    let select_id = $(this).attr('data-option');
    $('[data-option="'+select_id+'"]').removeAttr('data-selected');
    $(this).attr('data-selected', 'true');
})

Select.getSelectValue = function(id) {
    let $selectedOption = $('[data-option="'+id+'"][data-selected="true"]');
    
    let value = "";
    if ($selectedOption.length)
        value = $selectedOption.attr('data-value');

    return value;
}



// index.js
Game.addEventListeners();





});