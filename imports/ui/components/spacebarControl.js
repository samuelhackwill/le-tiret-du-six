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
	instance.botAutorun = false
})

Template.spacebarControl.events({

	"click button.spacebar"(){
		// change status of spacebar
		Meteor.call("spacebarInvert", environment)
	},

	"click button.autorun"(t){
		instance.botAutorun =! instance.botAutorun
		if (instance.botAutorun) {
			botAutorun()
			t.currentTarget.innerText = "Bot running!"
			t.currentTarget.classList.add("blinkRed")
			// we must also tell server that it should switch to
			// endrace solo during
		}else{
			window.clearInterval(autorun)
			t.currentTarget.innerText = "Bot autorun"
			t.currentTarget.classList.remove("blinkRed")
		}
	}

})

Template.spacebarControl.onRendered(function(){
	document.onkeyup = function(event){
		if (event.keyCode==32) {
			adminSpaceBarPress()
		}
	}

})

Template.spacebarControl.helpers({
	buttonColorChanger(){
		if (this.spacebar.control=="admin") {
			return "color:white;background-color:black"
		}else{
			return
		}
	}

})

adminSpaceBarPress = function(){
	// we need to check if admin has control first
	_spacebarctrl = instance.data.global.collection.find({env:environment}).fetch()[0].spacebar.control
	// if it's not the case, simply return.
	if (_spacebarctrl == "client") {
		console.log("admin does not own spacebar! returning")
		return
	}

	// get local index
	let _adminAtIndex = instance.data.adminAtIndex
	// increment
	_adminAtIndex = _adminAtIndex +1
	instance.data.adminAtIndex = _adminAtIndex

	// call method
	// spacebarAdmin is located in /imports/api/story/server/publications
	Meteor.call("spacebarAdmin", environment, _adminAtIndex)
}

botAutorun = function(){
	autorun = setInterval(function(){
		Meteor.call("requestStepServerSide", 'bot')
	},80)
}