export const streamer = new Meteor.Streamer('chat');

sendMessage = function(message) {
	streamer.emit('message', message);
};

