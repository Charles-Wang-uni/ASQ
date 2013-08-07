var socketIo     = require('socket.io')
, lib 				   = require('./socket-utils')
, authentication = require('./authentication');



var init = function(server) {
	var io = socketIo.listen(server);

	io.configure('development', function() {
  	io.set('log level', 2);
  });

	/* 
	 *  Control the presentation and when to send the stats
	 *  Requires to be granted control in the whitelist.
	 */
	io.of('/ctrl')
		.authorization(authentication.ctrlAuthorize);
		.on('connection', function(socket) {
			//handle connection

			/*
			 *  Handle the request to go to a specific slide.
			 */
			socket.on('asq:goto', function(event){
				lib.goto(io, socket.id, event);
			});

			/*
			 *  Handle the request to go to a specific element in a slide.
			 */
			socket.on('asq:gotosub', function(event){
				lib.gotosub(io, socket.id, event);
			});

			/*
			 *  Handle the request to display and broadcast stats.
			 */
			socket.on('asq:stats', function(event){
				lib.stats(io, event);
			});

			/*
			 *  Handle the disconnection of a socket from the namespace.
			 */
			socket.on('disconnect', function() {
				lib.ctrlDisconnect(io, socket);
			});
		});

	/*
	 *  Gets updated with the curent state of the presentation.
	 *  But cannot control it. Handles the submission to questions.
	 */
	io.of('/folo')
		.authorization(authentication.liveAuthorize);
		.on('connection', function(socket) {
			//handle connection

			/*
			 *  Handle a submission to a question.
			 */
			socket.on('asq:submit', function(event){
				lib.submit(io, event);
			});

			/*
			 *  Handle the disconnection of a socket from the namespace.
			 */
			socket.on('disconnect', function() {
				lib.foloDisconnect(io, socket);
			});
		});

	/* 
	 *  Wiretap of the presentation, similar to folo but
	 *  does not allow to submit answers.
	 *  Requires to be granted control in the whitelist.
	 */
	io.of('/wtap')
		.authorization(authentication.ctrlAuthorize);
		.on('connection', function(socket) {
			//handle connection

			/*
			 *  Handle the disconnection of a socket from the namespace.
			 */
			socket.on('disconnect', function() {
				lib.wtapDisconnect(io, socket);
			});
		});

	/* 
	 *  Sends updates with the current stats.
	 *  Requires to be granted control in the whitelist.
	 */
	io.of('/stat')
		.authorization(authentication.ctrlAuthorize);
		.on('connection', function(socket) {
			//handle connection

			/*
			 *  Handle the disconnection of a socket from the namespace.
			 */
			socket.on('disconnect', function() {
				lib.statDisconnect(io, socket);
			});
		});
}