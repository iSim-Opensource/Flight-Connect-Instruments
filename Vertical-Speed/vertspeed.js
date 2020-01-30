// Define width and height of the gauge in the window.
const INSTRUMENT_WIDTH = utils_getWindowShortestSideLength() - 20; //px
const INSTRUMENT_HEIGHT = utils_getWindowShortestSideLength() - 20; //px

// Presentation
let back = document.getElementById("back");
let needle = document.getElementById("needle");


// Center the images in the window
utils_centerElement(back, INSTRUMENT_WIDTH, INSTRUMENT_HEIGHT);
utils_centerElement(needle, INSTRUMENT_WIDTH, INSTRUMENT_HEIGHT);
utils_rotate(needle, 170);

function newVario(verticalSpeed) {
    
    if (verticalSpeed < 0.001 && verticalSpeed > -0.001)
        verticalSpeed = 0;

    let speed = utils_constrain(verticalSpeed, -3000, 3000);
    
    let rotation;
    if (speed >= 0 && speed <= 500) {
        rotation = speed * 0.05;
        utils_rotate(needle, rotation);
    }
    else if (speed < 0 && speed > -500) {
        rotation = speed * 0.05;
        utils_rotate(needle, rotation);
    }
    else if (speed >= 500 && speed < 2000) {
        rotation = 500 * 0.05;
        rotation += (speed - 500) * 0.065;
        utils_rotate(needle, rotation);
    }
    else if (speed <= -500 && speed > -2000) {
        rotation = -500 * 0.05;
        rotation += (speed + 500) * 0.065;
        utils_rotate(needle, rotation);
    }
    else if (speed >= 2000) {
        rotation = 125; // Degrees from sub 2000 speed
        rotation += (speed - 2000) * 0.045; // Degrees from above 2000 speed
        utils_rotate(needle, rotation);
    }
    else if (speed <= -2000) {
        rotation = -125; // Degrees from sub 2000 speed
        rotation += (speed + 2000) * 0.045; // Degrees from above 2000 speed
        utils_rotate(needle, rotation);
    }
}


const connection = new AppConnection(__configuredHost, { name: "Vertical Speed Indicator", identifier: "nz.isim.verticalspeed" }, (conn) => {

    conn.datarefSubscribe(
        newVario, this, 
        "sim/cockpit2/gauges/indicators/vvi_fpm_pilot"
    );
});
