/* 'auto' - Instrument will attempt to connect first to Flight-Connect application on localhost
*         If not found, it will then attempt to connect to X-Plane on localhost.
*         The Flight-Connect Application can be used to redirect the connection to an X-Plane
*         instance anywhere on the local network that is running the Flight-Connect plugin.
*
*  'localhost' or any other local network IP address - Attempt to connect directly  
*         to X-Plane running at this address, bypassing Flight-Connect application.
*/
const __configuredHost = 'auto';
