// Jeremy Doneghue
// iSim
// Created on: 09-05-2019

class AppConnection {

    constructor(ip, metadata, onReady) {

        const connectionConfigs = {
            XPLANE_PORT: 9002,
            FC_PORT: 9003,
        }
        let portToTry = connectionConfigs.FC_PORT;

        if (ip === 'auto') {
            if (window.location.protocol === "file:") {
                ip = 'localhost';
            }
            else if (window.location.protocol === "http:" || window.location.protocol === "https:") {
                ip = window.location.hostname;
            }
        }

        const getURL = (port) => {
            return `ws://${ip}:${port}`;
        }
     
        let _socket = new WebSocket(getURL(portToTry));
        this.ready = false;
        this.firstResponse = true;
        this.identifier = null;

        var state = {};

        // The array of subscribers
        this.globalDatarefs = {}; // Obj containing unique datarefs that have been subscribed to
        this.keySets = {};

        const addListeners = (sock) => {

            sock.onopen = (event) => {
                this.ready = true;
            };
            sock.onmessage = (event) => {
                let shouldReload = false;
                if (this.firstResponse) {
                    let res = JSON.parse(event.data);
                    if (res.type == "LOG") {
                        console.warn(res.value);
                        if (res.value === "Subscription limit for free trial version exceeded") {
                            const elem = document.createElement('div');
                            elem.innerHTML = "Subscription limit for free trial version exceeded";
                            elem.setAttribute('style', 'color: red; font-family: sans-serif;');
                            document.body.appendChild(elem);
                        }
                        return;
                    }
                    else if (res.type == "ID") {
                        this.identifier = res.value;
                        console.log("identifier: " + res.value);
                        this._sendIdentity(metadata)
                        onReady(this);
                        return;
                    }
                    else if (res.type == "RES") {
                        for (let key of Object.keys(res.value)) {
                            if(res.value[key] == "null") {
                                shouldReload = false;
                                console.warn("Invalid dataref: " + key);
                            }
                            if (shouldReload) {
                                console.warn("Window will reload in 5 seconds");
                                window.setTimeout(window.location.reload.bind(window.location), 5000);
                                break;
                            }
                        }
                        this.firstResponse = false;
                    }
                }
                if (!shouldReload && this.identifier !== null) {

                    // Parse the latest data
                    let diff = JSON.parse(event.data);
                    if (diff.type == "LOG") {
                        console.warn(diff.value);
                        return;
                    }
                    if (typeof diff.value === 'undefined') {
                        console.warn("Problem with response")
                        return;
                    }
                    if (diff.type == "CHNGCONN") {
                        const newPort = diff.value.port;
                        const newHost = diff.value.host;
                        ip = newHost;

                        if (typeof newPort !== 'undefined' && newPort != null &&
                            typeof newHost !== 'undefined' && newHost != null)
                        {
                            console.info(`The instrument is now connecting to ws://${newHost}:${newPort}`);
                            const newSock = new WebSocket(`ws://${newHost}:${newPort}`);
                            addListeners(newSock);
                            this.socket.close();
                            this.firstResponse = true;
                            this.socket = newSock;
                        }
                        return;
                    }

                    // Note which datarefs have new values
                    let valuesChanged = {};
                    Object.keys(diff.value).forEach((key) => {
                        valuesChanged[key] = (state[key] != diff.value[key]);
                    });
        
                    // Update the master state
                    state = Object.assign(state, diff.value);
                    
                    // For each subscriber, check whether any of the requested datarefs have changed
                    // If they have, call the function
                    for (let item of Object.keys(this.keySets)) {

                        const val = this.keySets[item]
        
                        var changes = false;
                        for (let key of val.datarefs) {
                            if (valuesChanged[key] == true) {
                                changes = true;
                                break;
                            } 
                        }
                        if (changes) {
                            // Use map to convert the array of dataref keys into their respective values
                            let results = val.datarefs.map((key) => {
                                // If it's an array dataref, it must be parsed from string form
                                if (String(state[key]).startsWith('[')) {
                                    state[key] = JSON.parse(state[key]);
                                }
                                return state[key];
                            });
                            // Call it with the values
                            val.function.apply(val.this, results);
                        }
                    }
                }      
            };
            sock.onerror = () => {
                console.warn('Unspecified error with socket')
            };
            sock.onclose = (event) => {
                switch (event.code) {
                    case 1006:
                        setTimeout(() => {
                            console.log('Reconnecting...');
                            portToTry = (portToTry === connectionConfigs.FC_PORT) 
                                ? connectionConfigs.XPLANE_PORT : connectionConfigs.FC_PORT;

                            _socket = new WebSocket(getURL(portToTry));
                            this.firstResponse = true;
                            this.identifier = null;
                            addListeners(_socket);
                            this.socket = _socket;
                        }, 5000);
                        break;
                    default:
                        break;
                }
            };
        }

        addListeners(_socket);
        this.socket = _socket;
    }

    setDataref(dataref, type, value) {
        const message = {
            id: this.identifier,
            command: "SET",
            dataref: dataref,
	        data: String(value),
	        type: type,
        }
        try {
            this.socket.send(JSON.stringify(message));
        } catch {
            console.warn("Problem with socket, reloading page in 5s");
            window.setTimeout(window.location.reload.bind(window.location), 5000);
        }
    }

    setArrayDataref(dataref, type, array, offset) {

        if (type==="INT") { type = "INT_ARRAY"; }
        if (type==="FLOAT") { type = "FLOAT_ARRAY"; }
        if (type != "FLOAT_ARRAY" && type != "INT_ARRAY") { throw "Type must be INT_ARRAY or FLOAT_ARRAY" }

        // null elements of the array wont overwrite existing values in the array on the host       ?
        const message = {
            id: this.identifier,
            command: "ASET",
            dataref: dataref,
            type: type,
            data: array,
            offset: offset
        };
        try {
            this.socket.send(JSON.stringify(message));
        } catch {
            console.warn("Problem with socket, reloading page in 5s");
            window.setTimeout(window.location.reload.bind(window.location), 5000);
        }
    }

    moveToAirport(icao) {
        const message = {
            id: this.identifier,
            command: "REPOSITION",
            data: icao,
        }
        try {
            this.socket.send(JSON.stringify(message));
        } catch {
            console.warn("Problem with socket, reloading page in 5s");
            window.setTimeout(window.location.reload.bind(window.location), 5000);
        }
    }

    runCommand(name) {
        const message = {
            id: this.identifier,
            command: "RUN_COMMAND",
            data: name,
        }
        try {
            this.socket.send(JSON.stringify(message));
        } catch {
            console.warn("Problem with socket, reloading page in 5s");
            window.setTimeout(window.location.reload.bind(window.location), 5000);
        }
    }

    _sendSubscribeMessage() {

        const message = {
            id: this.identifier,
            command: "SUBSCRIBE",
            data: Object.keys(this.globalDatarefs),
        }
        console.log(JSON.stringify(message));

        try {
            this.socket.send(JSON.stringify(message));
        } catch {
            console.warn("Problem with socket, reloading page in 5s");
            window.setTimeout(window.location.reload.bind(window.location), 5000);
        }
    }

    // 2.0

    // From https://stackoverflow.com/a/2117523
    _uuidv4() {
        return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
          (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    }

    datarefSubscribe(func, context, ...datarefs) {

        const uuid = this._uuidv4()
        let res = {};
        res["name"] = uuid;
        res["datarefs"] = datarefs;
        res["function"] = func;
        res["this"] = context;
      
        // Update the global dataref
        const reducer = (acc, val) => {
            acc[val] = val;
            return acc;
        }
        const drObj = datarefs.reduce(reducer, {});
        Object.assign(this.globalDatarefs, drObj);

        this._sendSubscribeMessage();

        this.keySets[uuid] = res;
    }

    _sendIdentity(metadata) {
        //const msg = `${this.identifier}:IDENTIFY:${JSON.stringify(metadata)}`;
        const message = {
            id: this.identifier,
            command: "IDENTIFY",
            data: metadata,
        }
        try {
            this.socket.send(JSON.stringify(message));
        } catch {
            console.warn("Problem with socket, reloading page in 5s");
            window.setTimeout(window.location.reload.bind(window.location), 5000);
        }
    }
}

function utils_setElemSize(element, width, height) {
    element.style.width = `${width}px`;
    element.style.height = `${height}px`;
}

/**
 * Get the length of the shortest side of the window
 * @returns {Number}
 */
function utils_getWindowShortestSideLength({ margin = 0 } = {}) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    return ((width < height) ? width : height) - margin;
}

/**
* Center an element in the middle of the window, given the size you want the element to be.
 * @param {Element} elem 
 * @param {Number} elementWidth 
 * @param {Number} elementHeight
 */
function utils_centerElement(elem, elementWidth, elementHeight) {
    elem.style.position = "absolute";
    elem.style.width = `${elementWidth}px`;
    elem.style.height = `${elementHeight}px`;
    elem.style.top = `${(window.innerHeight - elementHeight) / 2}px`;
    elem.style.left = `${(window.innerWidth - elementWidth) / 2}px`;
}

/**
 * Constrain a value to be between min and max
 * @param {Number} value Input value
 * @param {Number} min Returned if input value < min
 * @param {Number} max Returned if input value > max
 */
function utils_constrain(value, min, max) {
    value = Number(value);
    if (value < min) {
        return min;
    }
    if (value > max) {
        return max;
    }
    return value;
}

/**
 * The absolute value of the amount of *value* constrained between max and min.
 * @example utils_amountBetween(75, 50, 100) -> 25
 * @param {Number} value 
 * @param {Number} min 
 * @param {Number} max 
 */
function utils_amountBetween(value, min, max) {
	if (value < min)
		return 0;
	if (value > max)
		return Math.abs(max - min);
	return Math.abs(value - min);
}

// Moving elements

/**
 * Rotate an element using the CSS transform property
 * 
 * @param {Element} elem The element to rotate
 * @param {Number} degrees Degrees to rotate the element
 */
function utils_rotate(elem, degrees) {
    elem.style.transform = `rotate(${degrees}deg)`;
}

/**
 * Get the x and y position of an element in pixels from the origin (top left)
 * 
 * @param {Element} elem 
 * @returns {{x: Number, y: Number}}
 */
function utils_getElemPos(elem) {

    return {
        x: Number(elem.style.left.slice(0, -2)),
        y: Number(elem.style.top.slice(0, -2))
    }
}

/**
 * Set the x and y position of an element in pixels from the origin (top left)
 * Uses CSS 'left' and 'top' attributes with position absolute.
 * 
 * @param {Element} elem The element to set the position of
 * @param {Number} x The X position in pixels to set
 * @param {Number} y The Y position in pixels to set
 */
function utils_setElemPos(elem, x, y) {
    elem.style.position = 'absolute';
    elem.style.left = `${x}px`;
    elem.style.top = `${y}px`;
}

/**
 * Moves an element by the given number of pixels from it's current position
 * @param {Element} elem The element to move
 * @param {Number} x Pixels to move on X axis
 * @param {Number} y Pixels to move on Y axis
 */
function utils_moveElemBy(elem, x, y) {
    let startPos = utils_getElemPos(elem);
    let newX = startPos.x + x;
    let newY = startPos.y + y;
    utils_setElemPos(elem, newX, newY);
}

/**
 * Sets an element's css visiblity property to 'visible' or 'hidden'
 * @param {Element} elem The element
 * @param {Boolean} bool Whether or not to make it visible or invisible
 */
function utils_setVisible(elem, bool) {
    elem.style.visibility = (bool) ? 'visible' : 'hidden';
}

// Math

/**
 * Convert radians to degrees
 * @param {Number} radians 
 * @returns {Number} degrees
 */
function utils_radToDeg(radians) {

    return (radians * 180) / Math.PI;
}

/**
 * Convert degrees to radians
 * @param {Number} degrees 
 * @returns {Number} radians
 */
function utils_degToRad(degrees) {

    return (degrees * Math.PI) / 180;
}

// Text

/**
 * Sets the innerHTML attribute of the element to the given text
 * For more information on this see: https://www.w3schools.com/jsref/prop_html_innerhtml.asp
 * 
 * @param {Element} elem The element
 * @param {String} text Inner HTML content to set
 */
function utils_setText(elem, text) {

    elem.innerHTML = text;
}

/**
 * Sets the inner text of an element to a number with a specified number of decimal places
 * 
 * @param {Element} elem The element
 * @param {Number} number The number 
 * @param {Number} dplaces The number of decimal places to show
 */
function utils_setTextNumeric(elem, number, dplaces) {
    utils_setText(elem, Number(number).toFixed(dplaces));
}

/**
 * Set the colour of an element's text using the CSS color property 
 * Can be name of colour like 'red' or hex value like '#FF0000'
 * 
 * @param {Element} elem 
 * @param {String} colour 
 */
function utils_setTextColour(elem, colour) {

    elem.style.color = colour;
}

// For more details on attributes see:
// https://developer.mozilla.org/en-US/docs/Web/SVG/Element/text#Attributes
function utils_createSVGTextElement(content, x, y, attributes = {}) {

    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.appendChild(document.createTextNode(content))

    text.setAttribute('x', x);
    text.setAttribute('y', y);
    
    Object.keys(attributes).forEach(key => {
        text.setAttribute(key, attributes[key]);
    });

    return text;
}

// https://developer.mozilla.org/en-US/docs/Web/SVG/Element/rect
function utils_createSVGRectElement(x, y, width, height, attributes = {}) {
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute('x', x);
    rect.setAttribute('y', y);
    rect.setAttribute('width', width);
    rect.setAttribute('height', height);

    Object.keys(attributes).forEach(key => {
        rect.setAttribute(key, attributes[key]);
    });

    return rect;
}

// Audio

/**
 * Loop a piece of audio
 * @param {Element} audio 
 */
function utils_loopAudio(audio) {
    audio.loop = true;
    audio.play();
}

/**
 * Stop looping the audio element
 * @param {Element} audio 
 */
function utils_stopLooping(audio) {
    audio.loop = false;
}
