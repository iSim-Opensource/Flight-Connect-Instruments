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

        this.state = {};

        // The array of subscribers
        this.globalDatarefs = {}; // Obj containing unique datarefs that have been subscribed to
        this.keySets = [];
        this.timeOfLastMessage = new Date().getTime();
        this.timeSinceLastMessage = 0;

        // Event callbacks
        this.onTimeoutCallback = null;
        this.onLoadingStateChanges = null;

        // Once time dataref request callbacks
        this.drRequestCallbacks = [];

        // Command callbacks
        this.commandCallbacks = {};

        this.xplaneProbablyIsLoading = true;

        const logMessageTime = () => {

            // const now = new Date().getTime();
            // this.timeSinceLastMessage = now - this.timeOfLastMessage;
            // this.xplaneProbablyIsLoading = (this.timeSinceLastMessage > 2000);
            console.log(`${this.timeSinceLastMessage}ms`);

            this.onLoadingStateChanges && this.onLoadingStateChanges(this.xplaneProbablyIsLoading);

            setTimeout(logMessageTime, 1000);
        }

        const addListeners = (sock) => {

            sock.onopen = (event) => {
                this.ready = true;
                // logMessageTime();
            };
            sock.onmessage = (event) => {

                const now = new Date().getTime();
                // this.timeSinceLastMessage = now - this.timeOfLastMessage;
                this.timeOfLastMessage = now;
                const res = JSON.parse(event.data);

                if (this.identifier === null) {
                    if (res.type === "LOG") {
                        console.warn(res.value);
                        if (res.value === "Subscription limit for free trial version exceeded") {
                            const elem = document.createElement('div');
                            elem.innerHTML = "Subscription limit for free trial version exceeded";
                            elem.setAttribute('style', 'color: red; font-family: sans-serif;');
                            document.body.appendChild(elem);
                        }
                        return;
                    }
                    else if (res.type === "ID") {
                        this.identifier = res.value;
                        console.log("identifier: " + res.value);
                        this._sendIdentity(metadata)
                        onReady(this);
                        return;
                    }
                }
                else {
                    switch (res.type) {
                    case "RES": {
                        // For each subscriber, check whether any of the requested datarefs have changed
                        // If they have, call the function
                        
                        var subscriber;
                        var changes = false;
                        for (var i = 0; i < this.keySets.length; i++) {
                            subscriber = this.keySets[i];

                            // Check for Ch-ch-ch-ch-changes
                            changes = false;
                            for (let key of subscriber.datarefs) {
                                if (res.value[key] !== this.state[key] || res.value[key] !== undefined) {
                                    changes = true;
                                    break;
                                }
                            }
                            if (changes) {
                                // If the minimum time has elapsed
                                if (subscriber.minDeltaTime !== 0) { 
                                    if (now - subscriber.timeOfLast < subscriber.minDeltaTime * 1000) {
                                        break;
                                    }
                                }

                                const results = [];
                                for (const key of subscriber.datarefs) {
                                    let val = res.value[key] || this.state[key];
                                    if (val === undefined) {
                                        val = 0;
                                    }
                                    results.push(val);
                                }
                                // Call it with the values
                                subscriber.timeOfLast = now;
                                subscriber.function.apply(subscriber.this, results);
                            }
                        }
                        this.state = Object.assign(this.state, res.value);
                        break;
                    }
                    case "COMMAND": {
                        Object.values(this.commandCallbacks[res.value]).forEach(f => f());
                        break;
                    }
                    case "ONCE": {
                        this.drRequestCallbacks.shift()(res.value);
                        break;
                    }
                    case "LOG": {
                        console.warn(res.value);
                        break;
                    }
                    case "CHNGCONN": {
                        const newPort = res.value.port;
                        const newHost = res.value.host;
                        ip = newHost;

                        if (typeof newPort !== 'undefined' && newPort != null &&
                            typeof newHost !== 'undefined' && newHost != null)
                        {
                            console.info(`The instrument is now connecting to ws://${newHost}:${newPort}`);
                            const newSock = new WebSocket(`ws://${newHost}:${newPort}`);
                            addListeners(newSock);
                            this.socket.close();
                            this.identifier = null;
                            this.commandCallbacks = {};
                            this.socket = newSock;
                        }
                        break;
                    }
                    default:
                        console.warn("Problem with response")
                        break;
                    }
                }
            };
            sock.onerror = () => {
                console.warn('Unspecified error with socket');
                this.onTimeoutCallback && this.onTimeoutCallback();
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
        this.sendMessage({
            id: this.identifier,
            command: "SET",
            dataref: dataref,
	        data: String(value),
	        type: type,
        });
    }

    getDatarefs(datarefs, callback) {
        this.drRequestCallbacks.push(callback);
        this.sendMessage({
            data: datarefs,
            command: "GET_ONCE",
            id: this.identifier,
        });
    }

    setArrayDataref(dataref, type, array, offset) {

        if (type==="INT") { type = "INT_ARRAY"; }
        if (type==="FLOAT") { type = "FLOAT_ARRAY"; }
        if (type !== "FLOAT_ARRAY" && type !== "INT_ARRAY") { throw "Type must be INT_ARRAY or FLOAT_ARRAY" }

        this.sendMessage({
            id: this.identifier,
            command: "ASET",
            dataref: dataref,
            type: type,
            data: array,
            offset: offset
        });
    }

    on(event, call) {
        if (event === 'loadingStateChanges') {
            this.onLoadingStateChanges = call;
        }
        else if (event === 'connectionTimeout') {
            this.onTimeoutCallback = call;
        }
    }

    registerCommandCallback(command, callback) {

        // Prepare to receive
        const cbid = this._uuidv4();
        if (this.commandCallbacks.hasOwnProperty(command)) {
            this.commandCallbacks[command][cbid] = callback;
        } else {
            this.commandCallbacks[command] = { [cbid]: callback };  
        }

        // Send subscribe message
        this.sendMessage({
            command: "REGISTER_CMD_CALLBACK",
            data: command,
        });

        // Return the id used to unsubscribe
        return cbid;
    }

    removeCommandCallback(command, cbid) {
        delete this.commandCallbacks[command][cbid];
    }

    moveToAirport(icao) {
        this.sendMessage({
            id: this.identifier,
            command: "REPOSITION",
            data: icao,
        });
    }

    moveToPosition(lat, lon, hdg, alt, speed, fast) {
        this.sendMessage({
            id: this.identifier,
            command: "REPOSITION",
            data: { lat, lon, hdg, alt, speed, fast }
        });
    }

    runCommand(name) {
        this.sendMessage({
            id: this.identifier,
            command: "RUN_COMMAND",
            data: name,
            type: 0,
        });
    }

    commandOnce(name) {
        this.runCommand(name);
    }

    commandBegin(name) {
        this.sendMessage({
            id: this.identifier,
            command: "RUN_COMMAND",
            data: name,
            type: 1,
        });
    }

    commandEnd(name) {
        this.sendMessage({
            id: this.identifier,
            command: "RUN_COMMAND",
            data: name,
            type: 2,
        });
    }

    commandForDuration(name, durationMs) {
        this.commandBegin(name);
        setTimeout(() => {
            this.commandEnd(name);
        }, durationMs);
    }

    // From https://stackoverflow.com/a/2117523
    _uuidv4() {
        return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    }

    datarefSubscribeWithPrecision({ func, minDeltaTime, precision, datarefs}) {
        if (typeof minDeltaTime === 'undefined')
            minDeltaTime = 0;

        const uuid = this._uuidv4()
        let res = {
            minDeltaTime,
            timeOfLast: new Date().getTime(),
            datarefs: datarefs,
            name: uuid,
            "function": func,
            "this": window,
        };
        this.keySets.push(res);

        // Initialise dataref state to zero
        for (let dataref of datarefs) {
            this.state[dataref] = 0;
        }

        // Send
        this.sendMessage({
            id: this.identifier,
            command: "SUBSCRIBE",
            precision: precision || 0,
            data: datarefs,
        });
    }

    datarefSubscribe(func, minDeltaTime, ...datarefs) {

        if (typeof minDeltaTime === 'undefined')
            minDeltaTime = 0;

        const uuid = this._uuidv4()
        let res = {
            minDeltaTime,
            timeOfLast: new Date().getTime(),
            datarefs: datarefs,
            name: uuid,
            "function": func,
            "this": window,
        };
        this.keySets.push(res);

        // Send
        const message = {
            id: this.identifier,
            command: "SUBSCRIBE",
            precision: 0.01,
            data: [...datarefs],
        }
        this.sendMessage(message);
    }

    sendMessage(objectToSerialize) {
        console.log(objectToSerialize)
        try {
            this.socket.send(JSON.stringify(objectToSerialize));
        } catch {
            console.warn("Problem with socket, reloading page in 5s");
            window.setTimeout(window.location.reload.bind(window.location), 5000);
        }
    }

    _sendIdentity(metadata) {
        const message = {
            id: this.identifier,
            command: "IDENTIFY",
            data: metadata,
        }
        this.sendMessage(message);
    }
}

function utils_setElemSize(element, width, height) {
    if (typeof width === 'number') {
        element.style.width = `${width}px`;
    } else {
        element.style.width = width;
    }
    if (typeof height === 'number') {
        element.style.height = `${height}px`;
    } else {
        element.style.height = height;
    }
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

function utils_centerElementIn(elem, inside) {
    elem.style.position = "absolute";
    elem.style.top = `${(inside.offsetHeight - elem.offsetHeight) / 2}px`;
    elem.style.left = `${(inside.offsetWidth - elem.offsetWidth) / 2}px`;
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

function utils_SVGApplyAttributes(svg, attributes = {}) {
    Object.keys(attributes).forEach(key => {
        svg.setAttribute(key, attributes[key]);
    });
}

function utils_createSVGElementWithAttributes(type, attributes) {

    const element = document.createElementNS("http://www.w3.org/2000/svg", type);

    Object.keys(attributes).forEach(key => {
        element.setAttribute(key, attributes[key]);
    });

    return element;
}

function utils_updateSVGTextContent(svgTextElement, content) {
    svgTextElement.childNodes[0].nodeValue = content;
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
