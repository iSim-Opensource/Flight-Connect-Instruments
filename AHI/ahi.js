const INSTRUMENT_SIZE = utils_getWindowShortestSideLength(); //px
const INPUT_SMOOTHING_ON = false;
const SMOOTHING_WINDOW_SIZE = 25;

// Presentation
let bgMask = document.getElementById("backgroundMask");
let horiz = document.getElementById("ah_bgrd");
let fd_h = document.getElementById("ah_fd_hor");
let fd_v = document.getElementById("ah_fd_vert");
let bank = document.getElementById("ah_rose");
let frame = document.getElementById("ah_frame");

let attfront = document.getElementById("ah_bird");
let gyroflag = document.getElementById("ah_flag");
let calibrate = document.getElementById("calibrate");

// Frame
utils_centerElement(frame, INSTRUMENT_SIZE, INSTRUMENT_SIZE)

// Background mask
utils_setElemSize(bgMask, INSTRUMENT_SIZE*0.8, INSTRUMENT_SIZE*0.8)
bgMask.style.border = '1px solid pink';
bgMask.style.overflow = 'hidden';
bgMask.style.borderRadius = '25%'
utils_centerElement(bgMask, INSTRUMENT_SIZE * 0.9, INSTRUMENT_SIZE * 0.9);

// Horiz
utils_setElemSize(horiz, INSTRUMENT_SIZE*0.66, INSTRUMENT_SIZE*1.297)
utils_setElemPos(horiz, bgMask.offsetWidth*0.5-horiz.offsetWidth*0.5, bgMask.offsetHeight*0.5-horiz.offsetHeight*0.507)


// fd_h
utils_centerElement(fd_h, INSTRUMENT_SIZE, INSTRUMENT_SIZE);

// fd_v
utils_centerElement(fd_v, INSTRUMENT_SIZE, INSTRUMENT_SIZE);
utils_moveElemBy(fd_v, 2, 0);

// bank
utils_centerElement(bank, INSTRUMENT_SIZE, INSTRUMENT_SIZE);

// Bird
utils_centerElement(attfront, INSTRUMENT_SIZE, INSTRUMENT_SIZE);

// Gyroflag
gyroflag.style.position = "absolute";
gyroflag.style.width = `${INSTRUMENT_SIZE}px`;
gyroflag.style.height = `${INSTRUMENT_SIZE}px`;
gyroflag.style.top = `${(window.innerHeight - INSTRUMENT_SIZE) / 2+30}px`;
gyroflag.style.left = `${(window.innerWidth - INSTRUMENT_SIZE) / 2}px`;
gyroflag.style.zIndex = "3";

let rollWindow = [];
let pitchWindow = [];
let horizRollWindow = [];

function smooth(newVal, array, size) {

    if (array.length > size) {
        array.pop();
        array.unshift(newVal);
    }
    else {
        array.unshift(newVal);
    }

    return array.reduce((acc, val) => { return acc + val }, 0) / array.length;
}

function newAttitude(roll, pitch, APMode, FDPitch, FDRoll, fail, horizAdj) {

    // Electrical fail, gauge freezes
    if (fail == 6) {
        return;
    }
    
    // Roll outer ring
    let rollDeg = utils_constrain(roll, -180, 180) * -1;
    if (INPUT_SMOOTHING_ON) {
        rollDeg = smooth(rollDeg, horizRollWindow, SMOOTHING_WINDOW_SIZE);
    }
    utils_rotate(bank, rollDeg);

    // Roll horizon
    utils_rotate(horiz, rollDeg);

    // Move horizon pitch
    let pitchVal = utils_constrain(pitch, -50, 50);
    if (INPUT_SMOOTHING_ON) {
        pitchVal = smooth(pitchVal, pitchWindow, SMOOTHING_WINDOW_SIZE);
    }

    const pitchPercentPerDegree = 0.009;
    const pitchPx = INSTRUMENT_SIZE * pitchPercentPerDegree * pitchVal;

    const fdPercentPerDegree = 0.009;
    const fdPitchPx = (INSTRUMENT_SIZE * fdPercentPerDegree) * FDPitch * -1;

    // Move the horizon
    horiz.style.transform = `rotate(${rollDeg}deg) translateY(${pitchPx}px)`

    horizonTrim(horizAdj);

    // Flight director
    if (APMode < 1) { // If AP is off
        utils_setVisible(fd_h, false);
        utils_setVisible(fd_v, false);
    }
    else { // If AP is on
        // Calculate max deflections
        utils_setVisible(fd_h, true);
        utils_setVisible(fd_v, true);
        const maxDeflection = fdPercentPerDegree * 30 * INSTRUMENT_SIZE;
        const minDeflection = fdPercentPerDegree * -30 * INSTRUMENT_SIZE;

        let finalRoll = (FDRoll - roll) * 3;

        // Constrain between max deflections then translate
        fd_h.style.transform = `translateY(${utils_constrain(pitchPx + fdPitchPx, minDeflection, maxDeflection)}px)`;
        fd_v.style.transform = `translateX(${utils_constrain(finalRoll, minDeflection, maxDeflection)}px)`;
    }
}

function showGyroFlag(fail) {
    utils_setVisible(gyroflag, fail == 6);
}

const birdZeroPos = utils_getElemPos(attfront);

function horizonTrim(value) {
    utils_setElemPos(attfront, birdZeroPos.x, birdZeroPos.y + (value * -2.1));
}


let connection = new AppConnection(__configuredHost, { name: "Attitude", identifier: "nz.isim.AS350.attitude" }, () => {
    
    connection.datarefSubscribe(
        newAttitude, this, 
        "sim/cockpit2/gauges/indicators/roll_vacuum_deg_pilot",
        "sim/cockpit2/gauges/indicators/pitch_vacuum_deg_pilot",
        "sim/cockpit/autopilot/autopilot_mode",
        "sim/cockpit2/autopilot/flight_director_pitch_deg",
        "sim/cockpit2/autopilot/flight_director_roll_deg",
        "sim/operation/failures/rel_ss_ahz",
        "sim/cockpit/misc/ah_adjust",
    );
    
    connection.datarefSubscribe(
        showGyroFlag, this,
        "sim/operation/failures/rel_ss_ahz",
    );
});