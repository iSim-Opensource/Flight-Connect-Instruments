// The width and height of the instruments is determined by the window size when they first load
// So in order for them to look right when the device is rotated, they should be reloaded when
// the device changes orientation.

const query = window.matchMedia("(orientation: landscape)");

function orientationChangedTest() {
    for (var i = 0; i < window.frames.length; i++) {
        window.frames[i].location.reload();
    }
}

query.addListener(orientationChangedTest);