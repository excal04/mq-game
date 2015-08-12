// main.js



$(document).ready(function() {

    var $startTimer = $("#btnStart");

    $startTimer.click(function() {

        var game = Game(function() {

        });
    });

}); // end of document.ready

function Game() {
    var timer = Timer(10);
    this.meow = "cat";
    timer.start(function() {
        console.log("meow is ", this.meow);
    });
}

// countdown timer
function Timer(startTime) {
    var currTime = startTime || 60;
    var timerID;

    this.interval = 1000;
    this.task = function() {
        console.log("currTime = ", currTime);
    };

    // start timer
    this.start = function(callback) {
        console.log("func start");
        if (callback) {
            this.task = callback;
        }
        timerID = setInterval(function() {
            if(this.tick())
                this.task();
            else
                this.stop();
            console.log("inside callbak");

        }, interval);
    }

    // returns true if timer can tick, else false means time is up
    this.tick = function() {
        if (currTime === 0) {
            clearInterval(timerID);
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


    return this;
}
