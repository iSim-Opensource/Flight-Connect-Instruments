// Define width and height of the gauge in the window.
const INSTRUMENT_WIDTH = utils_getWindowShortestSideLength(); //px
const INSTRUMENT_HEIGHT = utils_getWindowShortestSideLength(); //px

// Get reference to image elements
const back = document.getElementById("back");
const needle = document.getElementById("needle");

// Center the images in the window
utils_centerElement(back, INSTRUMENT_WIDTH, INSTRUMENT_HEIGHT);
utils_centerElement(needle, INSTRUMENT_WIDTH, INSTRUMENT_HEIGHT);


// Given an airspeed, calculate degrees of rotation for the needle.
function degreesForKnots(airspeed) {

	let degreesTotal = 0.0;

	// Degrees of rotation per knot
	const degrees15to80 = 2.77;
	const degrees80to190 = 1.6;

	// Number of knots in each range
	const knots15to80 = utils_amountBetween(airspeed, 15, 80);
	const knots80to190 = utils_amountBetween(airspeed, 80, 190);

	degreesTotal += knots15to80 * degrees15to80;
	degreesTotal += knots80to190 * degrees80to190;

	return degreesTotal;
}

// Define function that will apply the needle rotation
function rotateNeedle(airspeed) {
	const rotation = degreesForKnots(airspeed);
	// Apply a rotation transformation to the image
    needle.style.transform = `rotate(${rotation}deg)`;
}

// Connect to Flight-Connect
new AppConnection(__configuredHost, { name: "Airspeed", identifier: "nz.isim.airspeed" }, (connection) => {

	// Subscribe to dataref with rotateNeedle callback
	connection.datarefSubscribe(
		rotateNeedle, this, 
		"sim/cockpit2/gauges/indicators/airspeed_kts_pilot"
	);
});
