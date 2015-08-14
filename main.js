// main.js

$(document).ready(function() {

    var game = new Game();
    game.init();

    var $startBtn = $("#btnStart");
    var $getfileBtn = $("#btngetfile");
    var $category = $("#cat");
    var $firstLetter = $("#letter");
    var $answerBox = $("#txtAns");
    var $btnSubmit = $("#btnSubmit");


    $startBtn.click(function() {
        startGame();
    });

    $btnSubmit.click(function() {
        // game logic
        game.addAns($answerBox.val());
        nextQuestion();
        $answerBox.val("");
    });


    function startGame() {
        // starts the timer and generates the words to guess
        game.start();

        // load the first question
        nextQuestion();
    }

    function nextQuestion() {
        // get and display the question
        var question = game.nextQuestion();
        $firstLetter.text(question.letter);
        $category.text(question.category);
    }

}); // end of document.ready


// load JSON game data
function loadGameData(processData) {
    $.getJSON("assets/categories.json", function(data) {
        processData(data);
    });
}


function Game(seconds) {
    var randPlace = 1000000;    // change to const (ES6 i think?)
    var words = [];
    var answers = [];
    var $timerUI;
    var seconds;
    var currWordIndex;  // index of the current word in words[]

    this.init = function() {
        loadGameData(function(data) {
            generateWords(data);
            console.log("data inside callback = ", data);

        });
        // initialize timer elements
        $timerUI = document.getElementById("timerUI");

    };


    this.start = function() {
        // initialize word deck and set the first question
        shuffleWords();
        currWordIndex = 0;
        answers = [];

        var timer = new Timer(5);
        // initialize clock
        // if timer ui already exists, destroy first before recreation
        seconds && seconds.destroy();
        seconds = new ProgressBar.Circle($timerUI, {
            color: "#FCB03C",
            trailColor: "#ddd",
            // duration: 970,
            text: {
                style: {
                    fontSize: "100px",
                    position: "relative",
                    top: "10px"
                },
                value: timer.getInitTime()
            },
            svgStyle: {
                width: "25%"
            },
            trailWidth: 5,
            strokeWidth: 5
        });
        seconds.set(timer.getTime() / timer.getInitTime());

        timer.start(function() {
            // do something here that changes every second (progress bar moving ? perhaps)
            seconds.animate(timer.getTime() / timer.getInitTime(), function() {
                seconds.setText(timer.getTime());
            });

        });

        // while (timer.running) {
        //     console.log("do something");
        // }
        console.log("game start: random words = ", words);
    };

    this.end = function() {
        // disable a button for example
        console.log("game ended");
    };

    // return the next question
    this.nextQuestion = function() {
        try {
            return {
                letter : words[currWordIndex].firstLetter,
                category : words[currWordIndex++].category
            };
        } catch (e) {
            console.log("Error: ", e.message);
            alert("Oops! Something went, we probably ran out of questions :/");
        } finally {
            // clean it up? idk reload browswer?
        }

    };

    // add a user's answer
    this.addAns = function(ans) {
        answers.push(ans);
    };

    var generateWords = function(obj) {
        obj.categories.forEach(function(cat) {
            var currCat = cat.name;
            cat.words.forEach(function(word) {
                var word = new Word(word, currCat);
                words.push(word);
            });
        });

        // console.log("gen words: words = ", words);
    };

    var shuffleWords = function() {
        for (var i = words.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * randPlace) % (i + 1);
            var temp = words[i];
            words[i] = words[j];
            words[j] = temp;
        }
    };
}

// timer object: countdown timer
function Timer(startTime) {
    var currTime = startTime || 60;
    var initialTime = startTime;
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
    };

    // returns true if timer can tick, else false means time is up
    this.tick = function() {
        if (currTime === 0) {
            this.stop();
            return false;
        } else {
            currTime--;
            return true;
        }
    };

    // stop timer
    this.stop = function() {
        clearInterval(timerID);
        this.running = false;
    };

    // decreases current time with param seconds
    this.skip = function(seconds) {
        currTime -= seconds;
    };

    this.getTime = function() {
        return currTime;
    };

    this.getInitTime = function() {
        return initialTime;
    };

    // return Object.create(Timer);
}

// word object
function Word(word, category) {
    this.word = word;
    this.firstLetter = this.word[0];
    this.category = category;

    // todo: equals / comparator for slight misspelling
}
