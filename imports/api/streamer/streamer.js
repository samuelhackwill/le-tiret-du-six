export const streamer = new Meteor.Streamer('chat');

sendMessage = function(message) {
	streamer.emit('message', message);
};

if(Meteor.isClient) {
	streamer.on('message', function(message) {
		console.log('client message : ', message);

		if (message.action=="adminSpacebarPress"){
			adminNext(message.adminAtIndex)
		}
	});

}