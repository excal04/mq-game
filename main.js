// main.js
// This file is specifically for play.html thus document.ready initializes the game right after the
// page loads, If this will be the js file for the whole web app, adjust ready() accordingly.

// I am also not sure if putting everything inside the ready function advisable...


$(document).ready(function() {

    var game = new Game();
    game.init();

    var $btnRetry = $("#btnRetry");
    var $category = $("#cat");
    var $firstLetter = $("#letter");
    var $answerBox = $("#txtAns");
    var $btnSubmit = $("#btnSubmit");
    var $ansPane = $("#ansPane");
    var $qPane = $("#qPane");
    var $readyText = $("#readyText");
    var $readyLeft = $("#readyLeft");
    var $readyRight = $("#readyRight");

    var ENTERKEY = 13;

    // start game after 3 seconds of ready time
    // within that time display some divs that say alerts the user to get ready
    // question: after 3 seconds, is the ajax request alerady finish?
    $(window).load(function() {
        initGamePage();
    });

    $btnRetry.click(function() {
        console.log("btn retry clicked");
        $ansPane.addClass("hidden");
        $btnRetry.addClass("hidden");    // btnretry is best placed in the div, gonna transfer sometime
        initGamePage();

    });

    $btnSubmit.click(function() {
        // game logic
        game.addAns($answerBox.val());
        cardSlide($("#question"), 0);
        nextQuestion();
        $answerBox.val("");
    });

    $answerBox.keyup(function(event) {
        if (event.which === ENTERKEY) {
            $btnSubmit.click();
        }
    });

    function initGamePage() {
        clearElements();
        $answerBox.focus();
        setTimeout(startGame, 3000);

        // this executed first
        $readyLeft.css('margin-left', '0');
        $readyRight.css('margin-left', '0');
        $readyText.text("Ready");
        $readyText.fadeIn(400).                 // i think this fadeIn does not execute since item is already visible
            fadeOut(600, function() {
                $(this).text("Set")
                    .fadeIn(400)
                    .fadeOut(600, function() {
                        $(this).text("Go")
                            .fadeIn(400)
                            .fadeOut(800, function() {
                                // will execute in sync
                                $readyLeft.animate({
                                    'margin-left' : '-=1000'
                                }, 200);
                                $readyRight.animate({
                                    'margin-left' : '+=1000'
                                }, 200);
                            });
                    });
            });
    }


    function startGame() {
        // starts the timer and generates the words to guess
        game.start();

        // load the first question
        nextQuestion();
    }

    function clearElements() {
        // clear the answer box
        $answerBox.val("");

        // clear answer pane
        $ansPane.empty();

        // clear spans that contain question details
        $category.text("");
        $firstLetter.text("");
    }

    function nextQuestion() {
        // get and display the question
        var question = game.nextQuestion();
        $firstLetter.text(question.letter);
        $category.text(question.category);
    }

    // baseMargin: string that represents original(expected value) margin-left of $elem
    function cardSlide($elem, baseMargin) {
        // do not slide if in between animations
        if($elem.css('margin-left') !== baseMargin + "px") return;
        $elem.css('margin-left', '-=1000')
            .animate({
                'margin-left': '+=1000'
            }, 200);    // change transition speed here
    }

    function addClickWordListener(elem) {
        if (!elem.hasClass("rightAns")) {   // right answer does not need a listener
            elem.click(function() {
                $(this).next(".rightAns").toggleClass("hidden");
                $(this).toggleClass("hidden");
            });
        }
    }

    // should there be any animation on the displaying of answers
    function displayAnswers() {
        var ansData = game.checkStruct;
        $ansPane.removeClass("hidden");
        $btnRetry.removeClass("hidden");
        $answerBox.blur();

        console.log("ansData = ", ansData);
        // iterate over the answers then display
        ansData.forEach(function(data) {
            // put some id or class here for styling
            // create template elements
            var $ansTemplate = $("<div class='ansTemp'></div>");
            var $letterTemplate = $("<div class='ansLetter'></div>");
            var $categoryTemplate = $("<div class='ansCategory'></div>");
            var $wordTemplate = $("<div class='ansWord'></div>");
            var $correctTemplate = $("<div class='rightAns hidden'></div>");
            var $pointsTemlate = $("<div class='points'></div>");

            // put the data
            $letterTemplate.text(data.correct.charAt(0));
            $categoryTemplate.text(data.category);
            $wordTemplate.text(data.answer);
            $correctTemplate.text(data.correct);
            $pointsTemlate.text(data.points);
            switch (data.verdict) {
                case game.WRONG: $wordTemplate.addClass("wrongAns"); break;
                case game.CORRECT: $wordTemplate.addClass("rightAns"); break;
                case game.ALMOST: $wordTemplate.addClass("almostAns"); break;
                default: throw new Error("Invalid verdict");
            }
            addClickWordListener($wordTemplate);

            $ansTemplate.append($letterTemplate);
            $ansTemplate.append($categoryTemplate);
            $ansTemplate.append($wordTemplate);
            $ansTemplate.append($correctTemplate);
            $ansTemplate.append($pointsTemlate);
            $ansTemplate.addClass("hidden");
            // append to parent div
            $ansPane.append($ansTemplate);
        });

        var $totalPointsTemplate = $("<div class='totalPoints'>" + game.getTotalPoints() + "</div>");
        $ansPane.append($totalPointsTemplate);
        $ansPane.append($("<a href='index.html' id='backHome'>HOME</a>"));
        // $ansPane.append('<button id="btnRetry">Play Again</button>');
        // $btnRetry = $("#btnRetry");

        // slide back readyLeft and readyRight
        $readyLeft.animate({'margin-left' : '0'}, 200);
        $readyRight.animate({'margin-left' : '0'}, 200);

        // animate display
        var allansTemp = $ansPane.children("div.ansTemp");
        for (var i = 0; i < allansTemp.length; i++) {
            var $elem = $(allansTemp[i]);
            setTimeout(function() {
                this.removeClass("hidden");
                cardSlide(this, 0);
            }.bind($elem), (i + 1) * 200 );

        }
    }

    // load JSON game data
    function loadGameData(processData) {
        $.getJSON("assets/categories.json", function(data) {
            processData(data);
        });
    }


    function Game() {
        var randPlace = 1000000;    // change to const if supported (ES6 i think?)
        this.WRONG = "WRONG";        // these are constants too
        this.CORRECT = "CORRECT";
        this.ALMOST = "ALMOST";
        var wordStruct = {};        // object structure representing the whole word-category relation
        var words = [];
        var answers = [];           // user answers
        var totalPoints;
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
            totalPoints = 0;

            // initialize clock
            var timer = new Timer(60);
            // if timer ui already exists, destroy first before recreation
            seconds && seconds.destroy();
            seconds = new ProgressBar.Circle($timerUI, {
                color: "#3ddab4",
                trailColor: "#ddd",
                duration: 970,
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
            answers.push(ans.toLowerCase().trim());
        };

        this.getTotalPoints = function() {
            return totalPoints;
        };

        var checkMisspelled = function(target, check) {
            if (target.length !== check.length || target.charAt(0) !== check.charAt(0)) return false;

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
                console.log("debug: checkAns, i =", i, ", currCat=",currCat, ", words[i] = ", words[i]);
                if (answers[i].charAt(0) !== words[i].firstLetter) {
                    // console.log("first cond ");
                    this.checkStruct.push({
                        answer : answers[i],
                        correct : words[i].word,
                        category : words[i].category,
                        verdict : this.WRONG,
                        points : 0
                    });
                } else if(wordStruct[currCat][answers[i]]) {    // is not null / undefined
                    totalPoints += 2;
                    this.checkStruct.push({
                        answer : answers[i],
                        correct : words[i].word,
                        category : words[i].category,
                        verdict : this.CORRECT,
                        points : 2
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
                        totalPoints += 1;
                        this.checkStruct.push({
                            answer : answers[i],
                            correct : correctWord,
                            category : words[i].category,
                            verdict : this.ALMOST,
                            points : 1
                        });
                    } else {
                        this.checkStruct.push({
                            answer : answers[i],
                            correct : words[i].word,
                            category : words[i].category,
                            verdict : this.WRONG,
                            points : 0
                        });
                    }
                }
            }

            console.log("checkstruct in checker = ", this.checkStruct);
            console.log("checkstruct this = ", this);
        };


        var generateWords = function(obj) {
            obj.categories.forEach(function(cat) {
                var currCat = cat.name.toUpperCase().trim();
                wordStruct[currCat] = {};
                cat.words.forEach(function(w) {
                    var lowerW = w.toLowerCase().trim();
                    var word = new Word(lowerW, currCat);
                    wordStruct[currCat][lowerW] = lowerW;
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
        // I made an implementation above, not too Object Oriented but hmm works great
    }

}); // end of document.ready
