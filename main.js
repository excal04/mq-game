// main.js



$(document).ready(function() {

    var $startTimer = $("#btnStart");

    $startTimer.click(function() {

        var game = Game();
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
