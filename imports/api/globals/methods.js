import { GlobalsDev } from './globals.js';
import { GlobalsProd } from './globals.js';

Meteor.methods({
	spacebarInvert(env){
		// change global "spacebar"
		// which is used to track who can fetch text
		// during the performance.

		// this is pretty redundant and could certainly 
		// be improved, see issue " Code Bloat #2 "
		if (env=="Prod"){
			actual = GlobalsProd.find({"spacebar":{$exists:true}}).fetch()[0]
			if (actual.spacebar.control=="client"){
				_spacebar = "admin"
			}else{
				_spacebar = "client"
			}
		    GlobalsProd.update(actual._id, { $set: {
		      spacebar:{control: _spacebar, adminAtIndex:actual.spacebar.adminAtIndex}
		    } })


		}else{
			actual = GlobalsDev.find({"spacebar":{$exists:true}}).fetch()[0]
			if (actual.spacebar.control=="client"){
				_spacebar = "admin"
			}else{
				_spacebar = "client"
			}
		    GlobalsDev.update(actual._id, { $set: {
		      spacebar:{control: _spacebar, adminAtIndex:actual.spacebar.adminAtIndex}
		    } })

		}
	},

	spacebarAdmin(_atIndex){
		actual = GlobalsDev.find({"spacebar":{$exists:true}}).fetch()[0]
		GlobalsDev.update(actual._id, { $set: {
		    spacebar:{control: actual.spacebar.control, adminAtIndex:_atIndex}
		}})
	}

});