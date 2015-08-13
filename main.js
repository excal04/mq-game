// main.js

$(document).ready(function() {

    var game = new Game();
    initGameData(game);
    console.log("game.gameData after init = ", game.gameData);
    // game.start();

    var $startTimer = $("#btnStart");
    var $getfileBtn = $("#btngetfile");

    $startTimer.click(function() {

        var game = Game();
    });

    $getfileBtn.click(function() {
        console.log("get file click");

        // $.get("test.json", function(data, status) {
        //     console.log("data = ", data);
        //     console.log("status = ", status);
        // });
    });

}); // end of document.ready


// intialization of game data
function initGameData(game) {
    console.log("game.gameData 0 = ", game.gameData);

    $.getJSON("assets/categories.json", function(data) {
        game.setGameData(data);
        console.log("game.gameData 1 = ", game.gameData);

    });
    console.log("game.gameData 2 = ", game.gameData);
}


function Game(timer) {
    var timer = new Timer(timer || 10);
    // var gameData;
    this.gameData;


    console.log("game constructor timer = ", timer);
    this.start = function() {
        timer.start(function() {
            // do something here that changes every second (progress bar moving ? perhaps)
            console.log("this is what timer does");
        });

        while (timer.running) {
            console.log("do something");
        }
    }

    this.end = function() {
        // disable a button for example
        console.log("game ended");

    }

    // sets the game data
    this.setGameData = function(obj) {
        this.gameData = obj;
    }

    this.printData = function() {
        console.log("game data: ", this.gameData);
        console.log("type of this.gameData: ", typeof this.gameData);
        console.log("this.gameData.categories: ", this.gameData.categories);
        console.log("this.gameData.categories[0].name: ", this.gameData.categories[0].name);
    }
}

// timer object: countdown timer
function Timer(startTime) {
    var currTime = startTime || 60;
    var timerID;

    this.interval = 1000;
    this.running = false;
    this.task = function() {
        console.log("currTime = ", currTime);
    };

    // start timer
    this.start = function(callback) {
        this.task = callback || this.task;
        this.running = true;

        timerID = setInterval(function() {
            if(this.tick())
                this.task();

            // console.log("this = ", this);
            // var x = function() {
            //     console.log("this2 = ", this);
            // }();

        }.bind(this), this.interval);
    }

    // returns true if timer can tick, else false means time is up
    this.tick = function() {
        if (currTime === 0) {
            this.stop();
            return false;
        } else {
            currTime--;
            return true;
        }
    }

    // stop timer
    this.stop = function() {
        clearInterval(timerID);
        this.running = false;
    }

    // decreases current time with param seconds
    this.skip = function(seconds) {
        currTime -= seconds;
    }


    // return Object.create(Timer);
}

// word object
function Word(word, category) {
    this.word = word;
    this.firstLetter = this.word[0];
    this.category = category;

    // todo: equals / comparator for slight misspelling
}

function getJSONData() {

}
