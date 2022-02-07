$(function() {

let isMouseDown = false;
$('body').mouseup(function() {
    isMouseDown = false;
})

let selectType = $('[data-type][data-selected="true"]').attr('data-type');

let $board = $('#board');

// timer.js
let Timer = {};
let startTime = new Date();
let timeStopped;
let timerSelect = document.querySelector('.timer .text');
let timerDiv = document.querySelector('.timer');
let oscillate = 1;

let updateInterval;
let oscInterval;

Timer.start = function() {
    startTime = new Date();
    updateInterval = setInterval(Timer.update, 50);
    oscInterval = setInterval(Timer.oscillate, 1000);
}

Timer.stop = function() {
    timeStopped = new Date();
    clearInterval(updateInterval);
    clearInterval(oscInterval);
}

Timer.getSeconds = function(d) {
    return Math.floor((d-startTime)/1000);
}

Timer.update = function() {
    timerSelect.innerHTML = Timer.getSeconds(new Date());
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

let currentDifficulty;
let currentRuleset;
let boardSize = { x: 15, y: 15 };
let percentChanceBlue = 0.5;
let messUps = 0;

Game.start = function(size, difficulty, ruleset) {
    currentDifficulty = difficulty;
    currentRuleset = ruleset;
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

Game.checkWin = function() {
    let hasNotWon = $('[data-answer="1"]').length ? false : true;
    $('[data-answer="1"]').each(function() {
        if ($(this).attr('data-answered') != 'true')
            hasNotWon = true;
    });

    return !hasNotWon;
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

    if (Game.checkWin()) {
        Timer.stop();

        let isHiscore = Storage.saveHiscore(Timer.getSeconds(timeStopped), currentDifficulty, boardSize.x, boardSize.y, currentRuleset);
        if (isHiscore)
            $('#isHiscore').show();
        else
            $('#isWin').show();
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

// storage.js
let Storage = {};
Storage.getHiscoreStorageName = function(difficulty, sizeX, sizeY, ruleset) {
    let name = sizeX+'-'+sizeY+'-'+difficulty+'-hiscore';
    if (ruleset)
        name += '-'+ruleset;

    return name;
}

Storage.getHiscore = function(difficulty, sizeX, sizeY, ruleset) {
    let hiscoreStorageName = Storage.getHiscoreStorageName(difficulty, sizeX, sizeY, ruleset);

    let hiscore = localStorage.getItem(hiscoreStorageName);
    if (hiscore)
        hiscore = parseInt(hiscore);

    return hiscore;
}

Storage.saveHiscore = function(hiscoreTime, difficulty, sizeX, sizeY, ruleset) {
    let isHiscore = false;
    let allowHiscore = true;
    if (ruleset == 'three') {
        if (messUps > 3)
            allowHiscore = false;
    } else if (ruleset == 'perfect') {
        if (messUps)
            allowHiscore = false;
    }

    if (allowHiscore) {
        let hiscoreStorageName = Storage.getHiscoreStorageName(difficulty, sizeX, sizeY, ruleset);

        let currentHiscore = Storage.getHiscore(difficulty, sizeX, sizeY, ruleset);
        if (!currentHiscore || hiscoreTime < currentHiscore) {
            localStorage.setItem(hiscoreStorageName, hiscoreTime);
            isHiscore = true;
        }
    }

    return isHiscore;
}


// settings.js
$('#startGame').click(function() {
    let ruleset = Select.getSelectValue('ruleset');
    let difficulty = Select.getSelectValue('difficulty');
    let size = Select.getSelectValue('size');

    Game.start(size, difficulty, ruleset);
    $('[data-view="game"]').attr('data-gamesize', size);
    View.change('game');
});

$('#hiscores').click(function() {
    View.change('hiscores');
})


// hiscores.js
$('#settings').click(function() {
    View.change('settings');
})

$('[data-select="difficulty"] [data-option]').each(function() {
    let difficulty = $(this).attr('data-value');

    $('#hiscoresList').append(`
        <h3>`+difficulty+`</h3>
    `);

    $('#hiscoresListThree').append(`
        <h3>`+difficulty+`</h3>
    `);

    $('#hiscoresListPerfect').append(`
        <h3>`+difficulty+`</h3>
    `);

    $('[data-select="size"] [data-option]').each(function() {
        let label = $(this).text();
        let value = Storage.getHiscore(difficulty, $(this).attr('data-value'), $(this).attr('data-value'));
        if (value) {
            value += 's';
        } else {
            value = 'None';
        }
        
        $('#hiscoresList').append(`
            <div class="hiscore">
                <span class="label">`+label+`: </span>
                <span class="value">`+value+`</span>
            </div>
        `);
        
        let value2 = Storage.getHiscore(difficulty, $(this).attr('data-value'), $(this).attr('data-value'), 'three');
        if (value2) {
            value2 += 's';
        } else {
            value2 = 'None';
        }
        $('#hiscoresListThree').append(`
            <div class="hiscore">
                <span class="label">`+label+`: </span>
                <span class="value">`+value2+`</span>
            </div>
        `);
        
        let value3 = Storage.getHiscore(difficulty, $(this).attr('data-value'), $(this).attr('data-value'), 'perfect');
        if (value3) {
            value3 += 's';
        } else {
            value3 = 'None';
        }
        $('#hiscoresListPerfect').append(`
            <div class="hiscore">
                <span class="label">`+label+`: </span>
                <span class="value">`+value3+`</span>
            </div>
        `);
    });

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

    $('[data-select-view="'+select_id+'"]').hide();
    $('[data-select-view="'+select_id+'"][data-select-view-value="'+$(this).attr('data-value')+'"]').show();
})

$('[data-option][data-selected="true"]').trigger('click');

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