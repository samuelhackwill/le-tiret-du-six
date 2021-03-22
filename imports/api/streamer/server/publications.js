import { streamer } from '../streamer.js'

streamer.allowRead('all');
streamer.allowWrite('all');

streamer.on('message', function(message) {
	// console.log('server message : ', message);
})