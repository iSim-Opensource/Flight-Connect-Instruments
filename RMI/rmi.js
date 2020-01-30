let INSTRUMENT_WIDTH = utils_getWindowShortestSideLength(); //px
let INSTRUMENT_HEIGHT = utils_getWindowShortestSideLength(); //px

let bgrd = document.getElementById("rmi_bgrd");
let rose = document.getElementById("rmi_rose");
let arrow_adf = document.getElementById("rmi_adf");
let arrow_vor = document.getElementById("rmi_vor");
let centre = document.getElementById("rmi_centre");
let frame = document.getElementById("rmi_frame");

// Presentation
let all = [bgrd, rose, arrow_adf, arrow_vor, centre, frame];
all.forEach(elem => utils_centerElement(elem, INSTRUMENT_WIDTH, INSTRUMENT_HEIGHT));


function newRMI(heading, adfyellow, adfgreen) {
    
    utils_rotate(rose, heading * -1);

    utils_rotate(arrow_adf, adfyellow);

    utils_rotate(arrow_vor, adfgreen);
}


const metadata = {
    name: "RMI",
    identifier: "nz.isim.rmi",
    dataref_metadata: {
        "sim/cockpit2/gauges/indicators/heading_AHARS_deg_mag_pilot": { 
            alias: "Heading magnetic",
            control: "slider",
            testing_range: { start: 0, end: 360 }
        },
        "sim/cockpit2/radios/indicators/adf1_relative_bearing_deg": { 
            alias: "ADF1 relative bearing",
            control: "slider",
            testing_range: { start: 0, end: 360 }
        },
        "sim/cockpit2/radios/indicators/nav2_relative_bearing_deg": { 
            alias: "NAV2 relative bearing",
            control: "slider",
            testing_range: { start: 0, end: 360 }
        }
    }
}

let connection = new AppConnection(__configuredHost, metadata, (connection) => {
    console.log("Connection established")

    connection.datarefSubscribe(
        newRMI, this,
        "sim/cockpit2/gauges/indicators/heading_AHARS_deg_mag_pilot",
        "sim/cockpit2/radios/indicators/adf1_relative_bearing_deg",
        "sim/cockpit2/radios/indicators/nav2_relative_bearing_deg"
    );
});