// main.js



$(document).ready(function() {

    var $startTimer = $("#btnStart");
    var $getfileBtn = $("#btngetfile");

    $startTimer.click(function() {

        var game = Game();
    });

    $getfileBtn.click(function() {
        console.log("get file click");
        $.getJSON("test.json", function(data) {
            console.log("data = ", data);
        });
        // $.get("test.json", function(data, status) {
        //     console.log("data = ", data);
        //     console.log("status = ", status);
        // });
    });

}); // end of document.ready

function Game() {
    var timer = new Timer(10);
    console.log(timer);
    this.meow = "cat";
    timer.start(function() {
        console.log("meow is ", meow);

    });
}

// timer object: countdown timer
function Timer(startTime) {
    var currTime = startTime || 60;
    var timerID;

    this.interval = 1000;
    this.task = function() {
        console.log("currTime = ", currTime);
    };

    // start timer
    this.start = function(callback) {
        if (callback) {
            this.task = callback;
        }
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
