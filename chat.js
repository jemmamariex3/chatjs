//Global Variables
var http = require('http');
var app = http.createServer(response);
var io = require('socket.io')(app);
var fs = require('fs');
var network = require('network');


// Create a clientsSockets array to hold each new client socket
var clientSockets = [];
// array that holds new client socket id
var client_id = [];
// array that holds the IP choices to terminate part 6.
var connectionArr = [];
var clientCount = 0;
var i;
var clientID = 0;

const readline = require('readline');
const question = "Select one of the possible options.\nCommand Manual (select options 1-8):\n1) Help\n2) MyIP\n3) MyPort\n4) Connect IP PORT\n5) List IP Peers\n6) Terminate IP\n7) Send IP Message\n8) Exit";
const help =
    "\nHELP COMMAND" +
    "\n\n1) Help - Display information about the available user interface options or command manual."+
    "\n\n2) MyIP - Display the IP address of this process." +
    "\n     Note: The IP should not be your “Local” address (127.0.0.1). It should be the actual" +
    "\n           IP of the computer."+
    "\n\n3) MyPort - Display the port on which this process is listening for incoming connections." +
    "\n\n4) Connect IP Port - This command establishes a new TCP connection to the specified IP" +
    "\n   address of the computer at the specified port no.Any attempt to connect to an invalid IP" +
    "\n   should be rejected and suitable error message should be displayed. Success or failure in" +
    "\n   connections between two peers should be indicated by both the peers using suitable" +
    "\n   messages. Self-connections and duplicate connections should be flagged with suitable" +
    "\n   error messages." +
    "\n\n5) List IP Peers - Display a numbered list of all the connections this process is part of." +
    "\n   This numbered list will include connections initiated by this process and connections" +
    "\n   initiated by other processes. The output should display the IP address and the listening" +
    "\n   port of all the peers the process is connected to."+
    "\n\n6) Terminate IP - This command will terminate the connection listed under the specified" +
    "\n   number when LIST is used to display all connections. " +
    "\n     E.g. Terminate 2. In this example, the connection with 192.168.21.21 should end. An" +
    "\n          error message is displayed if a valid connection does not exist as number 2. If a" +
    "\n          remote machine terminates one of your connections, you should also display a" +
    "\n          message." +
    "\n\n7) Send IP Message - (For example, send 3 Oh! This project is a piece of cake). This will" +
    "\n   send the message to the host on the connection that is designated by the number 3 when" +
    "\n   command “list” is used. The message to be sent can beup-to 100 characters long," +
    "\n   including blank spaces. On successfully executing the command, the sender should display" +
    "\n   message sent to IP on the screen. On receiving any message from the peer, the receiver" +
    "\n   should display the received message along with the sender information." +
    "\n     E.g. If a process on 192.168.21.20 sends a message to a process on 192.168.21.21 then" +
    "\n           the output on 192.168.21.21 when receiving a message should display as shown:" +
    "\n             Message received from 192.168.21.20" +
    "\n             Sender’s Port: < The port no. of the sender >" +
    "\n             Sender’s Port: < The port no. of the sender >"+
    "\n\n8) Exit - Exits out of the Chat Application.";

//TODO: connect IP PORT: establishes a new TCP connection to the specified <destination> at the specified < port no>
//TODO: terminate <connection id.>: This command will terminate the connection listed under the specified number when LIST is used to display all connections

//Socket connection
io.on("connection", function(socket){
    // Check if this ip address is already connected
    var close = isIPConnected(socket);
    // console.log(close);
    if (close) { // if true, disconnect new socket connection
        replaceExistingClient(socket);
    } else { // otherwise, add new socket to clientSockets array
        addNewClient(socket);
    };


    socket.on("send message", function(sent_msg, callback){
        sent_msg = "[ " + getCurrentDate() + " ]: " + sent_msg;
        io.sockets.emit("update messages", sent_msg);
        callback();
    });


    // socket.on('disconnect', function () {
    //     console.log(socket.id);
        // console.log('A user disconnected');
        // clientSockets[clientID].disconnect();
        // io.emit('broadcast', clientID + ' has left the chat room');
        // console.log(clientID + ' has left the chat room');
        // console.log('check', clientSockets[clientID].disconnected); //console.logs status of disconnected client. if successful - true, else-false
    // });
}); // End io connection

//network is a library that helps retrieve public IP
network.get_private_ip(function(err, ip) {
    clientIP = err || ip; // err may be 'No active network interface found'.
}); // End network get private

//user can set IP address using PORT=.
//If no IP is indicated, the program will default to 3000
var port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0');
console.log("Open browser at localhost:" +port);

var inquirer = require('inquirer');
var prompts = inquirer.createPromptModule();

// New inquirer module function to display and select options.
function showOptions() {
    var options;
    inquirer
        .prompt([
            {
                type: 'list',
                name: 'options',
                message: 'Select one of the possible options (select options 1-8):',
                pageSize: 10,
                choices: [
                    '1) Help',
                    '2) MyIP',
                    '3) MyPort',
                    '4) Connect IP PORT',
                    '5) List IP Peers',
                    '6) Terminate IP',
                    '7) Send IP Message',
                    '8) Exit',
                    new inquirer.Separator()
                ]
            }
        ])
        .then(answers => {
            var str = answers.options;
            // console.log(str);
            options = str.charAt(0);
            // console.log(options);

            if (options == 1) {
                console.log("\n" +help+"\n");
                showOptions();
            } else if (options == 2) {
                console.log("\nClient IP Address: " +clientIP+ "\n");
                showOptions();
            } else if (options == 3) {
                console.log("\nListening for connection on port: " +port+ "\n");
                showOptions();
            } else if (options == 4) { //TODO
                console.log("In progress...");
                showOptions();
            } else if (options == 5) {
                displayConnections();
                showOptions();
            } else if (options == 6) { //TODO
                disconnectClient();
                // showOptions();
            } else if (options == 7) {
                // if no users, display message and return to showOptions()
                if (clientSockets.length === 0) {
                    console.log("\nThere are no clients to send a message to.\n");
                    showOptions();
                } else {
                    sendMessageId();
                }

            } else if (options == 8) {
                console.log("Exiting Application");
                process.exit(0);
            }
        }); // end answers
} // end show options

// Start of the application
showOptions();

function response(req, res) {
    var file = "";
    if(req.url == "/"){
        file = __dirname + '/index.html';
    } else {
        file = __dirname + req.url;
    }
    fs.readFile(file,
        function (err, data) {
            if (err) {
                res.writeHead(404);
                return res.end('Page or file not found');
            }
            res.writeHead(200);
            res.end(data);
        }
    );
} // End response()

// Return current date
function getCurrentDate(){
    var currentDate = new Date();
    var day = (currentDate.getDate()<10 ? '0' : '') + currentDate.getDate();
    var month = ((currentDate.getMonth() + 1)<10 ? '0' : '') + (currentDate.getMonth() + 1);
    var year = currentDate.getFullYear();
    var hour = (currentDate.getHours()<10 ? '0' : '') + currentDate.getHours();
    var minute = (currentDate.getMinutes()<10 ? '0' : '') + currentDate.getMinutes();
    var second = (currentDate.getSeconds()<10 ? '0' : '') + currentDate.getSeconds();

    return year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
} // End getCurrentDate()

// Add new client to clientSockets array
function addNewClient(socket) {
    //pushing each new client connection's id into an array of clientIDs -JT
    client_id.push(socket.id);
    if (clientSockets.length < 1) {
        clientSockets.push(socket);
        clientCount++;
    } else {
        // Make sure not to store multiple clients with the same id
        var isMatch = false;
        for(i = 0; i < clientSockets.length; i++) {
            if (socket.id === clientSockets[i].id) {
                isMatch = true;
                // console.log("Socket already exists");
            }
        }
        if (!isMatch) {
            clientSockets.push(socket);
            clientCount++;
        }
    }
} // End addNewClient()

//  This function replaces a socket in the clientSockets array with
// the latest socket connection based on matching IP addresses.
function replaceExistingClient(socket) {
    // console.log("[New client replacement]");
    for(i = 0; i < clientSockets.length; i++)  {
        // console.log("socket: " + socket.handshake.address);
        // console.log("clientSockets [" + i + "]: " + clientSockets[i].handshake.address);
        if (socket.handshake.address === clientSockets[i].handshake.address) {
            clientSockets[i] = socket;
        }
    }
} // End replaceExistingClient()

// This functions if a new socket connection IP address already exists
// in another socket created before
function isIPConnected(socket) {
    // Check if this sockets ip address is already exists in the clientSockets array
    for (i = 0; i < clientSockets.length; i++) {
        // socket.handshake.address returns the IP address
        if (socket.handshake.address === clientSockets[i].handshake.address) {
            return true;
        }
    }
    return false;
} // End isIPConnected()

// Part 5 of the assignment, this function display all current connected clients/hosts
function displayConnections() {
    console.log("id:\tIP Address\t\tPort No.");
    for (i = 0; i < clientSockets.length; i++) {
        var ip = clientSockets[i].handshake.address;

        if (ip == '127.0.0.1') {
            ip = clientIP;
        }

        var str = clientSockets[i].handshake.headers.host;
        var port = str.split(":")[1];
        console.log((i + 1) + "\t" + ip + "\t\t" + port)
    } // End displayConnections()
}

//Part 6:
// Goal: go through the list of connected clients. When user selects option, that ip will be disconnected
// Todo: must broadcast that a user has been disconnected and also console.logged in the terminal
// function initializeArr() will return the connectionArr array in order to be used for disconnectClient() as choices for the prompt
// It will also initialize the socket ID array in order to disconnect/terminate user's choice of client -JT
// function initializeArr(){
//     for (i = 0; i < clientSockets.length; i++) {
//         var ip = clientSockets[i].handshake.address;
//
//         if (ip == '127.0.0.1') {
//             ip = clientIP;
//         }
//
//         var str = clientSockets[i].handshake.headers.host;
//         var port = str.split(":")[1];
//
//         //checks if the element already exists in the client_id array. if true - dont do anything, -JT
//         var socketID = clientSockets[i].id;
//         var id_exists = client_id.includes(socketID);
//         if(id_exists === false){
//             // if false - push new element. This is done b/c every time user checks the list of connections, the elements duplicate in the array due to the push
//             // when initializeArr() is called in command 6. -JT
//             client_id.push(clientSockets[i].id);
//         }
//
//         //checks if the element already exists in the connectionArr array. if true - dont do anything, -JT
//         var result = (i + 1) + ") " + ip + ":" + port;
//         var bool = connectionArr.includes(result);
//         if(bool === false){
//             // if false - push new element. This is done b/c every time user checks the list of connections, the elements duplicate in the array due to the push
//             // when initializeArr() is called in command 6. -JT
//             connectionArr.push((i + 1) + ") " + ip + ":" + port);
//         }
//
//         // console.log(clientSockets[i].id);
//         // console.log(client_id[i]);
//     }
//     return connectionArr;
// }

function disconnectClient(){
// inquirer.prompt([
// //     {
// //         type: 'list',
// //         name: 'client',
// //         message: 'Which would you like to disconnect?',
// //         choices: initializeArr(),
// //     }
// // ]).then(answers => {
// //         // substring takes the first character of the prompt choice and the 'string' id number is converted to an int and stores
// //         // The int is used as an index to extract socket id from the client_id array -JT
// //         clientID = client_id[parseInt(answers.client.substring(0,1))-1];
// //         console.log("client_id array console.log: "+client_id);
// //         console.log("ID: "+clientID+" IP " +answers.client);
// //
// //         // example output: -JT
// //         // Todo: figure out why every client connection comes with 2 ids. for this example, there should only be 1 id for each connection (2 elements in client_id array)
// //         //     ? Which would you like to disconnect? 1) 192.168.0.5:3000
// //         // client_id array console.log: 06WYjshypvh1KtQQAAAA,oSauWgBhDP3SRPeeAAAB,oX_um20UZok3iquEAAAC,xS9splG_JpXpqi2cAAAD
// //         // ID: 06WYjshypvh1KtQQAAAA IP 1) 192.168.0.5:3000
// //         //     ? Select one of the possible options (select options 1-8): 6) Terminate IP
// //         //     ? Which would you like to disconnect? 2) 192.168.0.17:3000
// //         // client_id array console.log: 06WYjshypvh1KtQQAAAA,oSauWgBhDP3SRPeeAAAB,oX_um20UZok3iquEAAAC,xS9splG_JpXpqi2cAAAD
// //         // ID: oSauWgBhDP3SRPeeAAAB IP 2) 192.168.0.17:3000
// //
// //         // Todo: figure out where/how to disconnect client with its ip address
// //         io.on("connection", function(socket){
// //             socket.on('disconnect',function(){
// //
// //                 io.sockets.connected[clientID].disconnect();
// //                 io.emit('broadcast', clientID + ' has left the chat room');
// //                 console.log(clientID + ' has left the chat room');
// //                 console.log('check', clientSockets[clientID].disconnected); //console.logs status of disconnected client. if successful - true, else-false
// //             });
// //         })
// //         showOptions();
// //     });
    displayConnections();
    inquirer.prompt([
        {
            type: 'input',
            name: 'socket_id',
            message: 'Enter socket id to terminate:',
            pageSize: 10,
            validate: function (id) {
                if (isNaN(id) || id < 1) {
                    return 'Please enter a valid connection id number';
                } else if (id > clientSockets.length) {
                    return 'Socket id: ' + id + ' doesn\'t exist!';
                }
                return true;
            }
        }
    ]).then(answers => {
        // console.log(answers);
        socket_id = answers.socket_id;
        clientSockets[socket_id - 1].disconnect();
        showOptions();
    }); // end inquirer.prompt
}
// Part 7: This is the new sendMessage function that asks for a specific id and message
// to send to that specified user.  It also has input validation. I would consider this complete
// TODO Make new condition -> where if there is no user, just return to main page.
function sendMessageId() {
    var conn_id = 0;
    var message = '[Terminal] ';

    // Show user list of users.
    console.log("\n___________________________________________\n");
    displayConnections();
    console.log("\n___________________________________________\n");
    var questions = [
        {
            type: 'input',
            name: 'conn_id',
            message: 'Enter connection id:',
            pageSize: 10,
            validate: function(id) {
                if (isNaN(id) || id < 1) {
                    return 'Please enter a valid connection id number';
                } else if (id > clientSockets.length) {
                    return 'Connection id: ' +id+ ' doesn\'t exist!';
                }
                return true;
            }
        },
        {
            type: 'input',
            name: 'message',
            message: 'Enter your message:',
            pageSize: 10,
            validate: function(message) {
                if (message.length > 100) {
                    return 'Your message is way too long!';
                }
                return true;
            }
        }
    ]; // end questions array

    inquirer.prompt(questions).then(answers => {
        // console.log(answers);
        conn_id = answers.conn_id;
        message += answers.message;
        clientSockets[conn_id - 1].emit("test message", message);
        showOptions();
    }); // end inquirer.prompt
} // End sendMessage()

// Test Function --> Keep this until project is finished.
function itsPizzaTime() {
    inquirer
        .prompt([
            {
                type: 'list',
                name: 'theme',
                message: 'What do you want to do?',
                choices: [
                    'Order a pizza',
                    'Make a reservation',
                    new inquirer.Separator(),
                    'Ask for opening hours',
                    {
                        name: 'Contact support',
                        disabled: 'Unavailable at this time'
                    },
                    'Talk to the receptionist'
                ]
            },
            {
                type: 'list',
                name: 'size',
                message: 'What size do you need?',
                choices: ['Jumbo', 'Large', 'Standard', 'Medium', 'Small', 'Micro'],
                filter: function(val) {
                    return val.toLowerCase();
                }
            }
        ])
        .then(answers => {
            console.log(JSON.stringify(answers, null, '  '));
            showOptions();
        });
}
