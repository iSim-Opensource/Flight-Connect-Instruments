# iSim Flight-Connect Instruments 🛩

## Getting started
To use the instruments provided in this repository, you need X-Plane with the Flight-Connect Plugin installed. 

### Connection IP address 📡
If you are running X-Plane and the instruments on the same computer, leave the configuredHost field as ```auto```, otherwise enter the IP address of the computer you want your instruments to connect to.

## Running the instruments 🏃‍♂️

### Running from file 🗄
Simply open the index.html file of the instrument in a web browser.

### Using Flight-Connect: Instruments & Panels 🖥
In Flight-Connect, open the preferences window and choose the directory containing these instruments as your instrument directory. Flight-Connect will automatically detect copies of X-Plane with the Flight-Connect plugin installed on your local network and allow you to connect.

Flight-Connect will also allow you to open instruments on other devices on your network that have web browsers such as tablets and smartphones. Visit the url displayed in the application in your device's web browser to do this.

### Using your own web server 
You can use your own web server at the root of the Instruments directory to serve them yourself if you wish.

## Developing new instruments 👩‍🍳
For a guide on developing a new instrument, visit:
[Creating an airspeed indicator](/docs/tutorial.md)

For API reference visit:

* [Client API](/docs/client.md)
* [Utils API](/docs/utils.md)

### Sharing your instruments
If you wish to share any of the custom instruments you make, you may submit a pull request to this repository. Acceptance is at the discretion of the repository mainainers.