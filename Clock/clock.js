let INSTRUMENT_WIDTH = utils_getWindowShortestSideLength() - 20; //px
let INSTRUMENT_HEIGHT = utils_getWindowShortestSideLength() - 20; //px

let back = document.getElementById("back");
let timersec = document.getElementById("timersec");
let timermin = document.getElementById("timermin");
let seconds = document.getElementById("seconds");
let hours = document.getElementById("hours");
let minutes = document.getElementById("minutes");

// Presentation
[back, timersec, timermin, seconds, hours, minutes].forEach(element => utils_centerElement(element, INSTRUMENT_WIDTH, INSTRUMENT_HEIGHT));



function newTime(s, m, h, timer) {
    
    utils_rotate(seconds, s * 6);
    utils_rotate(minutes, m * 6);
    utils_rotate(hours, h * 30 + (m * 6 / 12));
    let timermins = (timer /60) % 60;
    let timersecs = timer % 60;
    utils_rotate(timersec, timersecs * 6);
    utils_rotate(timermin, timermins * 6);
}

let connection = new AppConnection(__configuredHost, { name: "Clock", identifier: "nz.isim.clock" }, (connection) => {

    connection.datarefSubscribe(
        newTime, this, 
        "sim/cockpit2/clock_timer/local_time_seconds",
        "sim/cockpit2/clock_timer/local_time_minutes",
        "sim/cockpit2/clock_timer/local_time_hours",
        "sim/time/timer_elapsed_time_sec"
    );
});
