import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Mongo } from 'meteor/mongo';
import { FlowRouter } from 'meteor/kadira:flow-router';

// methods... for some reason i need to import that one
import { spacebarInvert } from '../../api/globals/methods.js'

import './spacebarControl.html';
import './spacebarControl.css';


Template.spacebarControl.onCreated(function(){
	// pull adminAtIndex from DB when joining
	instance = this
})

Template.spacebarControl.events({

	"click button.spacebar"(){
		// change status of spacebar
		Meteor.call("spacebarInvert", environment)
	}

})

Template.spacebarControl.onRendered(function(){
	document.onkeyup = function(event){
		if (event.keyCode==32) {
			adminSpaceBarPress()
		}
	}

})

adminSpaceBarPress = function(){
	// get local index
	let _adminAtIndex = instance.data.adminAtIndex
	// increment
	_adminAtIndex = _adminAtIndex +1
	instance.data.adminAtIndex = _adminAtIndex

	// call method
	console.log("calling method ", _adminAtIndex)
	Meteor.call("spacebarAdmin", environment, _adminAtIndex)
}
