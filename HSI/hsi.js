let INSTRUMENT_WIDTH = utils_getWindowShortestSideLength(); //px
let INSTRUMENT_HEIGHT = utils_getWindowShortestSideLength(); //px

let bgrd = document.getElementById("hsi_bgrd");
let rose = document.getElementById("hsi_rose");
let center = document.getElementById("hsi_center");
let arrow = document.getElementById("hsi_arrow");
let arrow_center = document.getElementById("hsi_arrow_centre");
let obs_to = document.getElementById("hsi_obs_to");
let obs_from = document.getElementById("hsi_obs_from");
let glideslope = document.getElementById("hsi_glideslope");
let hdgflag = document.getElementById("hsi_hdg_flag");
let navflag = document.getElementById("hsi_nav_flag");
let bug = document.getElementById("hsi_bug");
let frame = document.getElementById("hsi_frame");


// Presentation
[bgrd, rose, center, obs_to, obs_from, arrow, arrow_center, hdgflag, navflag, bug, frame]
    .forEach(item => utils_centerElement(item, INSTRUMENT_WIDTH, INSTRUMENT_HEIGHT));

utils_setElemSize(glideslope, INSTRUMENT_WIDTH, 'auto');
utils_setElemPos(glideslope, (window.innerWidth - INSTRUMENT_WIDTH) / 2, (window.innerHeight / 2) - (glideslope.offsetHeight / 2))

function hsi(heading, headingBug, source, obs, hdev, vdev, fail, glideslopeFlag, nav1Flag, nav2Flag, gpsFromTo)
{
    utils_rotate(rose, heading * -1);
    utils_rotate(bug, headingBug - heading);
    utils_rotate(arrow, obs - heading);
    utils_rotate(center, obs - heading);
    utils_rotate(obs_to, obs - heading);
    utils_rotate(obs_from, obs - heading);

    hdev = utils_constrain(hdev, -2.5, 2.5);
    vdev = utils_constrain(vdev, -2.5, 2.5);
  
    arrow_center.style.transform = `rotate(${obs-heading}deg) translate(${INSTRUMENT_WIDTH * 0.065 * hdev}px)`;  
    glideslope.style.transform = `translate(0px, ${INSTRUMENT_HEIGHT * 0.085 * vdev}px)`;  
    
    const to = ((source == 0 && nav1Flag == 1) || (source == 1 && nav2Flag == 1) || (source == 2 && gpsFromTo == 1));
    const from = ((source == 0 && nav1Flag == 2) || (source == 1 && nav2Flag == 2) || (source == 2 && gpsFromTo == 2));

    utils_setVisible(obs_to, to);
    utils_setVisible(obs_from, from);

    const nav_inop = ((source == 0 && nav1Flag == 0) || (source == 1 && nav2Flag == 0));
    utils_setVisible(navflag, nav_inop);

    utils_setVisible(hdgflag, fail == 6);
    utils_setVisible(glideslope, glideslopeFlag == 0);
}

const metadata = { 
    name: "Horizontal Situation Indicator",
    identifier: "nz.isim.hsi"
}

let connection = new AppConnection(__configuredHost, metadata, (connection) => {
    console.log("Connection established")

    connection.datarefSubscribe(
        hsi, this,
        "sim/cockpit2/gauges/indicators/heading_AHARS_deg_mag_pilot",   // Heading
        "sim/cockpit2/autopilot/heading_dial_deg_mag_pilot",            // Heading bug
        "sim/cockpit2/radios/actuators/HSI_source_select_pilot",        // Source
        "sim/cockpit2/radios/actuators/hsi_obs_deg_mag_pilot",          // OBS
        "sim/cockpit2/radios/indicators/hsi_hdef_dots_pilot",           // Horizontal deviation
        "sim/cockpit2/radios/indicators/hsi_vdef_dots_pilot",           // Vertical deviation
        "sim/operation/failures/rel_ss_dgy",                            // Failure
        "sim/cockpit2/radios/indicators/hsi_flag_glideslope_pilot",
        "sim/cockpit2/radios/indicators/nav1_flag_from_to_pilot",
        "sim/cockpit2/radios/indicators/nav2_flag_from_to_pilot",
        "sim/cockpit/radios/gps_fromto"
    );
});
