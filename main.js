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
    var $ansPane = $("#ansPane");
    var $qPane = $("#qPane");


    $startBtn.click(function() {
        startGame();
    });

    $btnSubmit.click(function() {
        // game logic
        game.addAns($answerBox.val());
        nextQuestion();
        $answerBox.val("");
    });

    $("#getAns").click(function() {
        console.log(game.checkStruct);
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

    function displayAnswers() {
        var ansData = game.checkStruct;
        $ansPane.removeClass("hidden");

        console.log("ansData = ", ansData);
        // iterate over the answers then display
        ansData.forEach(function(data) {
            // put some id or class here for styling
            // create template elements
            var $ansTemplate = $("<div class='ansTemp'></div>");
            var $letterTemplate = $("<span class='ansLetter'></span>");
            var $categoryTemplate = $("<span class='ansCategory'></span>");
            var $wordTemplate = $("<span class='ansWord'></span>");
            var $correctTemplate = $("<span class='correctAns'></span>");

            // put the data
            $letterTemplate.text(data.correct.charAt(0));
            $categoryTemplate.text(data.category);
            $wordTemplate.text(data.answer);
            $correctTemplate.text(data.correct);
            $ansTemplate.append($letterTemplate);
            $ansTemplate.append($categoryTemplate);
            $ansTemplate.append($wordTemplate);
            $ansTemplate.append($correctTemplate);
            // append to parent div
            $ansPane.append($ansTemplate);
        });
    }

    // load JSON game data
    function loadGameData(processData) {
        $.getJSON("assets/categories.json", function(data) {
            processData(data);
        });
    }


    function Game(seconds) {
        var randPlace = 1000000;    // change to const (ES6 i think?)
        var WRONG = "WRONG";
        var CORRECT = "CORRECT";
        var ALMOST = "ALMOST";
        var wordStruct = {};
        var words = [];
        var answers = [];
        var $timerUI;
        var seconds;
        var currWordIndex;  // index of the current word in words[]

        // object used for checking
        this.checkStruct = [];

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
                // color: "#FCB03C",
                // trailColor: "#ddd",
                // duration: 970,
                text: {
                    value: timer.getInitTime()
                },
                svgStyle: {
                    width: "100%"   // occupies the whole container
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
            },
            function() {
                checkAnswers.call(this);
                // actually there should be some kind of screen saying time is up before displaying the answers
                // for a more.. smooth experience?
                displayAnswers();
            }.bind(this));

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
            }
        };

        // add a user's answer
        this.addAns = function(ans) {
            answers.push(ans.toLowerCase());
        };

        var checkMisspelled = function(target, check) {
            if (target.length !== check.length) return false;

            var diff = 0;   // number of different characters
            for (var i = 0; i < target.length; i++) {
                if (target[i] !== check[i])
                    diff++;
            }

            return diff < 2 ? true : false;
        };

        var checkAnswers = function() {
            this.checkStruct = [];
            for (var i = 0; i < answers.length; i++) {
                currCat = words[i].category;
                if (answers[i].charAt(0) != words[i].firstLetter) {
                    this.checkStruct.push({
                        answer : answers[i],
                        correct : words[i].word,
                        category : words[i].category,
                        verdict : WRONG
                    });
                } else if(wordStruct[currCat][answers[i]]) {    // is not null / undefined
                    this.checkStruct.push({
                        answer : answers[i],
                        correct : words[i].word,
                        category : words[i].category,
                        verdict : CORRECT
                    });
                } else {    // same first letter but not sure if misspelled so we will search entire category
                    var misspelled = false;
                    for (var w in wordStruct[currCat]) {
                        if (wordStruct[currCat].hasOwnProperty(w)) {
                            if (checkMisspelled(wordStruct[currCat][w], answers[i])) {
                                misspelled = true;
                                var correctWord = wordStruct[currCat][w];
                                break;
                            }
                        }
                    }
                    if (misspelled) {
                        this.checkStruct.push({
                            answer : answers[i],
                            correct : correctWord,
                            category : words[i].category,
                            verdict : ALMOST
                        });
                    } else {
                        this.checkStruct.push({
                            answer : answers[i],
                            correct : words[i].word,
                            category : words[i].category,
                            verdict : WRONG
                        });
                    }
                }
            }

            console.log("checkstruct in checker = ", this.checkStruct);
            console.log("checkstruct this = ", this);
        };


        var generateWords = function(obj) {
            obj.categories.forEach(function(cat) {
                var currCat = cat.name.toUpperCase();
                wordStruct[currCat] = {};
                cat.words.forEach(function(w) {
                    var word = new Word(w.toLowerCase(), currCat);
                    wordStruct[currCat][w] = w;
                    words.push(word);
                });
            });

            console.log("gen words: struct = ", wordStruct);
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

        // callback to do every tick
        this.task = function() {
            console.log("currTime = ", currTime);
        };

        // callback when timer is done
        this.lastTask = function() {
            console.log("TIME IS UP");
        };

        // start timer
        this.start = function(callback, lastTask) {
            this.task = callback || this.task;
            this.lastTask = lastTask || this.lastTask;
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
            this.lastTask();
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

    }

    // word object
    function Word(word, category) {
        this.word = word;
        this.firstLetter = this.word[0];
        this.category = category;

        // todo: equals / comparator for slight misspelling
    }

}); // end of document.ready
