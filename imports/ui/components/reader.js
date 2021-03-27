import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Mongo } from 'meteor/mongo';
import { FlowRouter } from 'meteor/kadira:flow-router';

import './reader.html';
import './reader.css';

import { streamer } from '../../api/streamer/streamer.js';

// this is the text displayed at the end of race 1 (secret solo race)
const finishMessageStrings = ["La personne de ", " a mis ", " secondes à parcourir le texte."]

streamer.on('message', function(message) {
	// only run if from template reader. Didn't find another way of doing it
	// as streamer seems to be a global object and runs everywhere.
	if (message.action=="adminSpacebarPress" && instance.view.template.viewName == "Template.reader"){
		adminNext(message.adminAtIndex)
	}
});

Template.reader.onCreated(function(){
	// this makes the instance accessible globally.
	// (because i'm not going to use helpers to display
	// text this time.)
	instance = Template.instance()
	// i guess it would be better to pull this number
	// from DB to avoid fatal disconnections
	instance.data.obj._atIndex = -1
})

Template.reader.onRendered(function(){
	document.onkeyup = function(event){
		if (event.keyCode==32) {
			clientNext()
		}
	}
})

clientNext = function(){
	// we need to check if admin has control first
	let _spacebarctrl = instance.data.obj.globals.collection.find({env:environment}).fetch()[0].spacebar.control
	// if he has control, just return and don't do anything else.
	if (_spacebarctrl == "admin") {
		console.log("admin owns the spacebar, not moving.")
		return
	}

	// if the player has triggered a stop action, he should remain where he is.
	if (this.instance.data.stopped){
		console.log("currently in parking, not moving")
		return
	}

	// get local index from instance data.
	let _atIndex = instance.data.obj._atIndex
	let _Story = instance.data.obj.story.collection.find({env:environment}).fetch()[0].data

	if (_atIndex < _Story.length){
		// client is responsible for updating index
		instance.data.obj._atIndex = _atIndex +1
		// load text
		loadText(_Story, instance.data.obj._atIndex)
		// method call to update players db
		Meteor.call("spacebarPlayer", environment, instance.aiguebename, instance.data.obj._atIndex)
	}else{
		console.log("No more text!")
		return
	}

}
 
adminNext = function(_adminAtIndex) {
	// update instance_atIndex from function argument
	// admin is responsible for updating everybody's index
	instance.data.obj._atIndex = _adminAtIndex
	let _Story = instance.data.obj.story.collection.find({env:environment}).fetch()[0].data

	if (this.instance.data.stopped==true) {
		this.instance.data.stopped=false
	}

	if (_adminAtIndex < _Story.length){
		loadText(_Story, _adminAtIndex)
	}else{
		console.log("No more text!")
		return
	}
};

loadText = function(_Story, index, rawText){
	// sometimes we want to use loadText to print additional
	// text rather than what's in the db (Story),
	// for instance status messages or score messages.
	if (rawText) {
		console.log("ZOOOB")
	    $('#textColumn').append($('<ul/>').html(rawText))
		return
	}

	// execute actions if there are any
	clientActions(_Story[index].params)

	// append text to body
    $('#textColumn').append($('<ul/>').html(_Story[index].line))

    /* @todo Add a statement to replace "***" by empty <ul/>
		@body as was the case in the former codebase.
    */

    /* @todo Add a function to scroll to bottom of div when new text is appended
    	@body as was the case in the former codebase.
    */
}

clientActions = function(_params){

	for (var i = _params.length - 1; i >= 0; i--) {
	// first get the optional argument of the param.
		_arg = Object.values(_params[i])[0]
		_key = Object.keys(_params[i])[0]

		// then decide what to do according to the action name.
		switch (_key){
			case "#stop" :
			console.log("going into parking.")
			this.instance.data.stopped = true
			break;

			case "#logtime" :
			console.log("logging time for ", _arg)
			// we are only using one method, which first saves the
			// start time of the race, then the finish time.
			Meteor.call("playerLogTime", environment, instance.aiguebename, _arg)
			break;

			case "#race1results" :
			console.log("results of race1 personne de ", _arg)
			// call method
			loadText(undefined, undefined, `Salut la ${_arg}`)
			break;

			default :
			console.log(_key)
			break;
		}
	}


}