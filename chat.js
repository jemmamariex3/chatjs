//Global Variables
var http = require('http');
var app = http.createServer(response);
var io = require('socket.io')(app);
var fs = require('fs');
var network = require('network');

let clientIP;

const readline = require('readline');
const question = "Select one of the possible options.\nCommand Manual (select options 1-8):\n1) Help\n2) MyIP\n3) MyPort\n4) Connect IP PORT\n5) List IP Peers\n6) Terminate IP\n7) Send IP Message\n8) Exit"
const help ="\nHELP COMMAND\n"+"1) Help - Display information about the available user interface options or command manual."+"\n"+"2) MyIP - Display the IP address of this process."
    +"\n\tNote: The IP should not be your “Local” address (127.0.0.1). It should be the actual IP of the computer."+"\n"+"3) MyPort - Display the port on which this process is listening for incoming connections." +
    "4) connect IP Port : This command establishes a new TCP connection to the specified IP address of the computer at the specified port no. Any attempt to connect to an invalid IP should be rejected and suitable error message should be displayed. " +"\n"+
    "Success or failure in connections between two peers should be indicated by both the peers using suitable messages. Self-connections and duplicate connections should be flagged with suitable error messages."+"\n"+"5) List IP Peers - Display a numbered list of all the connections " +
    "this process is part of. This numbered list will include connections initiated by this process and connections initiated by other processes. The output should display the IP address and the listening port of all the peers the process is connected to." +"\n"+
    "6) Terminate IP - This command will terminate the connection listed under the specified number when LIST is used to display all connections. " +
    "\n\tE.g., terminate 2. In this example, the connection with 192.168.21.21 should end. An error message is displayed if a valid connection does not exist as number 2. If a remote machine terminates one of your connections, you should also display a message." +"\n"+
    "7) Send IP Message - (For example, send 3 Oh! This project is a piece of cake). \nThis will send the message to the host on the connection that is designated by the number 3 when command “list” is used. The message to be sent can be up-to 100 characters long, including blank spaces.\n" +
    "On successfully executing the command, the sender should display “Message sent to IP” on the screen.On receiving any message from the peer, the receiver should display the received message along with the sender information." +
    "\n\t(Eg. If a process on 192.168.21.20 sends a message to a process on 192.168.21.21 then the output on 192.168.21.21 when receiving a message should display as shown:" +
    "\n\tMessage received from 192.168.21.20" +
    "\n\tSender’s Port: < The port no. of the sender >" +
    "\n\tSender’s Port: < The port no. of the sender >"+"\n"+"8) Exit - Exits out of the Chat Application."

//TODO: connect IP PORT: establishes a new TCP connection to the specified <destination> at the specified < port no>
//TODO: list: The output should display the IP address and the listening port of all the peers the process is connected to.
//TODO: terminate <connection id.>: This command will terminate the connection listed under the specified number when LIST is used to display all connections
//TODO: send <connection id.> <message>: This will send the message to the host on the connection that is designated by the number 3 when command “list” is used.
//The message to be sent can be up-to 100 characters long, including blank spaces.
// On successfully executing the command, the sender should display “Message sent to <connection id>” on the screen.
// On receiving any message from the peer, the receiver should display the received message along with the sender information.

//Socket connection
io.on("connection", function(socket){
    socket.on("send message", function(sent_msg, callback){
        sent_msg = "[ " + getCurrentDate() + " ]: " + sent_msg;

        io.sockets.emit("update messages", sent_msg);
        callback();
    });
});

//network is a library that helps retrieve public IP
network.get_private_ip(function(err, ip) {
    clientIP = err || ip; // err may be 'No active network interface found'.
})

//user can set IP address using PORT=.
//If no IP is indicated, the program will default to 3000
var port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0');
console.log("Open browser at localhost:" +port);

//If user inputs any value 1-8, case will determine what function or variable to call
r = readline.createInterface(process.stdin, process.stdout),
r.on('line', function(line) {
    switch(line) {
        case '1':
            console.log("\n"+help);
            console.log("\n___________________________________________\n");
            console.log("\n"+question);
            break;
        case '2':
            console.log("\nClient IP Address: " +clientIP);
            console.log("\n___________________________________________\n");
            console.log("\n"+question);
            break;
        case '3':
            console.log('\nListening for connection on port: '+port);
            console.log("\n___________________________________________\n");
            console.log("\n"+question);
            break;
        case '4':
            console.log('4');
            console.log("\n___________________________________________\n");
            console.log("\n"+question);
            break;
        case '5':
            console.log('5');
            console.log("\n___________________________________________\n");
            console.log("\n"+question);
            break;
        case '6':
            console.log('6');
            console.log("\n___________________________________________\n");
            console.log("\n"+question);
            break;
        case '7':
            console.log('7');
            console.log("\n___________________________________________\n");
            console.log("\n"+question);
            break;
        case '8':
            r.close();
            break;
        default:
            console.log('\nInvalid selection.' +"\n"+ question);
            break;
    }
    r.prompt();
}).on('close', function() {
    console.log('Exiting Application');
    process.exit(0);
});

console.log("\n"+question);
r.prompt();

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
}

function getCurrentDate(){
    var currentDate = new Date();
    var day = (currentDate.getDate()<10 ? '0' : '') + currentDate.getDate();
    var month = ((currentDate.getMonth() + 1)<10 ? '0' : '') + (currentDate.getMonth() + 1);
    var year = currentDate.getFullYear();
    var hour = (currentDate.getHours()<10 ? '0' : '') + currentDate.getHours();
    var minute = (currentDate.getMinutes()<10 ? '0' : '') + currentDate.getMinutes();
    var second = (currentDate.getSeconds()<10 ? '0' : '') + currentDate.getSeconds();

    return year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
}
