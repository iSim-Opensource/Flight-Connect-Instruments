let INSTRUMENT_WIDTH = utils_getWindowShortestSideLength(); //px
let INSTRUMENT_HEIGHT = utils_getWindowShortestSideLength(); //px


// Presentation
let bgrd= document.getElementById("ralt_bgrd");
let needle = document.getElementById("ralt_needle");
let set = document.getElementById("ralt_bug");
let cover = document.getElementById("ralt_cover");
let alt_off = document.getElementById("ralt_off");
let alt_on = document.getElementById("ralt_on");
let frame = document.getElementById("ralt_frame");


let all = [bgrd, needle, set, cover, alt_off, alt_on, frame];

var zindex = 0;
for (elem of all) {
    elem.style.position = "absolute";
    elem.style.width = `${INSTRUMENT_WIDTH}px`;
    elem.style.height = `${INSTRUMENT_HEIGHT}px`;
    elem.style.top = `${(window.innerHeight - INSTRUMENT_HEIGHT) / 2}px`;
    elem.style.left = `${(window.innerWidth - INSTRUMENT_WIDTH) / 2}px`;
    elem.style.zindex = `${zindex}`;
    zindex += 1;
}

const audio = new Audio("assets/dh_warning.wav");

let audioShouldPlay = true;
function newRadAlt(altitude, bug, power, test) {

   
    // Operation state on power state
    if (power==0) {
        utils_setVisible(alt_on, false);
        utils_rotate(needle, 0);
        return; // Exit early because of power failure, nothing else needs to happen
    }
    
    // Calculate and set rotation of the needle
    const alt = utils_constrain(altitude, -30, 2500); // Constrain the altitude between a minimum and maxiumum value
    if (alt > 500) {
        const needleDegrees = 160 + (alt - 500) * 0.04;
        utils_rotate(needle, needleDegrees);
    }
    else {
        const needleDegrees = alt * 0.32;
        utils_rotate(needle, needleDegrees);
    }


    // Calculate and set rotation of the bug
    const bugalt = utils_constrain(bug, -30, 2500);
    if (bugalt > 500) {
        const bugDegrees = 160 + (bugalt - 500) * 0.04;
        utils_rotate(set, bugDegrees);
    }
    else {
        const bugDegrees = bugalt * 0.32;
        utils_rotate(set, bugDegrees);
    }


    // Set DH warning
    if (altitude < bug || test == 1) {
        utils_setVisible(alt_on, true);

        if (audioShouldPlay) {
            audio.play();
            audioShouldPlay = false;
        }
    }
    else {
        utils_setVisible(alt_on, false);
        audioShouldPlay = true;
    }
}

const connection = new AppConnection(__configuredHost, { name: "Radar altimeter", identifier: "nz.isim.radalt" }, (connection) => {

    connection.datarefSubscribe(
        newRadAlt, this,
        "sim/cockpit2/gauges/indicators/radio_altimeter_height_ft_pilot",
        "sim/cockpit2/gauges/actuators/radio_altimeter_bug_ft_pilot",
        "sim/cockpit2/switches/avionics_power_on",
        "sim/cockpit/warnings/annunciator_test_pressed",
    );
});
