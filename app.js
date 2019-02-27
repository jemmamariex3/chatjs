var app = require('http').createServer(response);
var fs = require('fs');
var io = require('socket.io')(app);
const readline = require('readline');


//TODO: take in user input for port and change here
app.listen(3000);

//TODO: take user port and output here
console.log("App running...");

//TODO: 'help' interface that will call another function to print the other options (callback)
//function for prompt interface
function ask(question, callback) {
    const r = readline.createInterface({
        input: process.stdin,
        output: process.stdout});
    r.question(question + '\n', function(answer) {
        r.close();
        callback(null, answer);
    });
}

// asks prompt questions on terminal
ask('Did you find this useful?', function(answer) {
    console.log(answer)
});


//TODO: myip: figure out how to output laptop IP address
//TODO: nyport: display port on which this process is listening for incoming connections.
//TODO: connect <destination> <port no>: establishes a new TCP connection to the specified <destination> at the specified < port no>
//TODO: list: The output should display the IP address and the listening port of all the peers the process is connected to.
//TODO: terminate <connection id.>: This command will terminate the connection listed under the specified number when LIST is used to display all connections
//TODO: send <connection id.> <message>: This will send the message to the host on the connection that is designated by the number 3 when command “list” is used.
    //The message to be sent can be up-to 100 characters long, including blank spaces.
    // On successfully executing the command, the sender should display “Message sent to <connection id>” on the screen.
    // On receiving any message from the peer, the receiver should display the received message along with the sender information.
//TODO: exit: Close all connections and terminate this process. The other peers should also update their connection list by removing the peer that exits.

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

io.on("connection", function(socket){
    socket.on("send message", function(sent_msg, callback){
        sent_msg = "[ " + getCurrentDate() + " ]: " + sent_msg;

        io.sockets.emit("update messages", sent_msg);
        callback();
    });
});

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
