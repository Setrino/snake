Snake-MMO
=========

Snake MMO is an online team game with elements of RPG

*Note: The game is still at the stage of development.*

The game uses **[node.js](http://nodejs.org/)** server which
you need to install to run the game. Also you need to install
a couple of node-modules:

* [socket.io](http://socket.io/) *Required*
* [node-mysql](https://github.com/felixge/node-mysql) *Required*
* [forever.js](https://github.com/nodejitsu/forever) *Optional*

### If you are running on localhost
---------------------

* Start your XAMPP/MAMP/WAMP server

*Note: MySQL port here is 8889, so if it is different for you,*
*got to ../js/server.js file and change it there.*

* Go to ../js/server.js in terminal/cmd and run "node server.js" command.

*Note: Socket.io is running on port 8000, check by entering*
*"http://localhost:8000/" in the browser you should receive*
*"Welcome to socket.io".*

### If you are running on an external server
----------------------

* Change in the ../js/client/client.js file the localhost to your URI
(e.g. http://localhost -> http://google.com)

* Follow the steps as above (to start node.js you will probably need
SSH or Telnet access to your server. If you don't have them, you cannot
install nor run node.js).

=========
**Happy Snaking!**


