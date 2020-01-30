

let instrumentWidth = utils_getWindowShortestSideLength(); //px
let instrumentHeight = utils_getWindowShortestSideLength(); //px

// Presentation
let QHN_set = document.getElementById("QNH_disk");
let chess_box = document.getElementById("chessbox");
let bgrd_disk = document.getElementById("bgrd");
let arrow_small = document.getElementById("arrow1");
let arrow_big = document.getElementById("arrow2");
let arrow_sec = document.getElementById("arrow3");
let top_disk = document.getElementById("top");
let frame_bgnd = document.getElementById("frame");

let all = [QHN_set, chess_box, bgrd_disk, arrow_small, arrow_big, arrow_sec, top_disk, frame_bgnd];

all.forEach(elem => utils_centerElement(elem, instrumentWidth, instrumentHeight));



function newAltitude(altitude, baro_setting) {
     
    let baro_set = utils_constrain(baro_setting, 29.1, 30.7);
    utils_rotate(QHN_set, (((baro_set - 29.1) * 100) * -1) + 0.6)

    let k = (altitude / 10000) * 36;
    let h = ((altitude - Math.floor(altitude / 10000) * 10000) / 1000) * 36;
    let t = (altitude - Math.floor(altitude / 10000) * 10000) * 0.36;
    let y = (altitude - 10000) * 0.04;
    
    if (altitude > 10000) {
        utils_rotate (chess_box, y);
    } else {
        utils_rotate (chess_box, 0);
    }

    utils_rotate(arrow_sec, k);
    utils_rotate(arrow_small, h);
    utils_rotate(arrow_big, t);
}

const metadata = { 
    name: "Altimeter IN",
    identifier: "nz.isim.altimeterin",
    dataref_metadata: {
        "sim/cockpit/misc/barometer_setting": { 
            alias: "barometer setting",
            control: "slider",
            testing_range: { start: 29.1, end: 30.7 },
            step: 0.01,
        }
    }
}

let connection = new AppConnection(__configuredHost, metadata, (connection) => {
    console.log("Connection established")

    connection.datarefSubscribe(
        newAltitude, this,
        "sim/cockpit2/gauges/indicators/altitude_ft_pilot", 
        "sim/cockpit/misc/barometer_setting",
    );
});
