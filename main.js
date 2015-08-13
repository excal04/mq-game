// main.js

$(document).ready(function() {

    var game = new Game();
    game.init();

    var $startBtn = $("#btnStart");
    var $getfileBtn = $("#btngetfile");

    $startBtn.click(function() {
        startGame();
    });

    $getfileBtn.click(function() {
        console.log("get file click");

        // $.get("test.json", function(data, status) {
        //     console.log("data = ", data);
        //     console.log("status = ", status);
        // });
    });


    function startGame() {
        // starts the timer and generates the words to guess
        game.start();
    }

}); // end of document.ready


// load JSON game data
function loadGameData(processData) {
    $.getJSON("assets/categories.json", function(data) {
        processData(data);
    });
}


function Game(seconds) {
    var timer = new Timer(seconds || 10);
    var randPlace = 1000000;    // change to const (ES6 i think?)
    var words = [];

    // var gameData;
    this.gameData;


    console.log("game constructor timer = ", timer);

    this.init = function() {
        loadGameData(function(data) {
            generateWords(data);
            console.log("data inside callback = ", data);

        });
    }


    this.start = function() {
        randomizeWords();
        timer.start(function() {
            // do something here that changes every second (progress bar moving ? perhaps)
            console.log("this is what timer does, words[0] = ", words[0]);
        });

        // while (timer.running) {
        //     console.log("do something");
        // }
        console.log("game start: random words = ", words);
    }

    this.end = function() {
        // disable a button for example
        console.log("game ended");

    }

    var generateWords = function(obj) {
        obj.categories.forEach(function(cat) {
            var currCat = cat.name;
            cat.words.forEach(function(word) {
                var word = new Word(word, currCat);
                words.push(word);
            });
        });

        // console.log("gen words: words = ", words);
    }

    var randomizeWords = function() {
        for (var i = words.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * randPlace) % (i + 1);
            var temp = words[i];
            words[i] = words[j];
            words[j] = temp;
        }
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
