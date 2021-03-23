import { Globals } from './globals.js';

Meteor.methods({
	spacebarInvert(_env){
		// change global "spacebar"
		// which is used to track who can fetch text
		// during the performance.

			object = Globals.find({env:_env}).fetch()[0]
			spacebar = object.spacebar

			if (spacebar.control=="client"){
				_spacebar = "admin"
			}else{
				_spacebar = "client"
			}

		    Globals.update(object._id, { $set: {
		      spacebar:{control: _spacebar, adminAtIndex:object.spacebar.adminAtIndex}
		    } })
	},

	spacebarAdmin(_env, _atIndex){
		object = Globals.find({env:_env}).fetch()[0]
		Globals.update(object._id, { $set: {
		    spacebar:{control: object.spacebar.control, adminAtIndex:_atIndex}
		}})

		sendMessage({action:"adminSpacebarPress", adminAtIndex:_atIndex})
	}

});