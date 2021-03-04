import { GlobalsDev } from './globals.js';
import { GlobalsProd } from './globals.js';

Meteor.methods({
	spacebarInvert(env){
		// change global "spacebar"
		// which is used to track who can fetch text
		// during the performance.

		// this is pretty redundant and could certainly 
		// be improved, see issue " Code Bloat #2 "
		if (env=="prod"){
			actual = GlobalsProd.find({"spacebar":{$exists:true}}).fetch()[0]
			if (actual.spacebar=="client"){
				_spacebar = "admin"
			}else{
				_spacebar = "client"
			}
		    GlobalsProd.update(actual._id, { $set: {
		      spacebar: _spacebar,
		    } })
		}else{
			actual = GlobalsDev.find({"spacebar":{$exists:true}}).fetch()[0]
			if (actual.spacebar=="client"){
				_spacebar = "admin"
			}else{
				_spacebar = "client"
			}
		    GlobalsDev.update(actual._id, { $set: {
		      spacebar: _spacebar,
		    } })

		}
	}	
});