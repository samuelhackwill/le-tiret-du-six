import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Mongo } from 'meteor/mongo';
import { FlowRouter } from 'meteor/kadira:flow-router';

import './reader.html';
import './reader.css';

// this is the text displayed at the end of race 1 (secret solo race)
const finishMessageStrings = ["La personne de ", " a mis ", " secondes et ", " dixièmes à parcourir le texte."]
// aiguebenames are attributed in sequence : the first client to load
// will always be "Michèle Planche", and the second "Julien Montfalcon".
// so if we always open the website on each computers in the same order, player on the 
// left (as seen from the audience) will always be Michèle, and on the right Julien.
// (left = jardin).
const firstClientSeated = "left"

Template.reader.onCreated(function(){
	// this makes the instance accessible globally.
	// (because i'm not going to use helpers to display
	// text this time.)
	instance = Template.instance()
	// i guess it would be better to pull this number
	// from DB to avoid fatal disconnections
	instance.data.obj._atIndex = -1
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

	scrollText()
}

clientActions = function(_params){

	for (var i = 0; i < _params.length; i++) {
	// first get the optional argument of the param.
		_arg = Object.values(_params[i])[0]
		_key = Object.keys(_params[i])[0]

		// then decide what to do according to the action name.
		// actions are sorted by chronological appearance during the show.
		switch (_key){
			case "#bookmark":
			break;

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
				// _arg is either left or right. The player seated left
				// should be Michèle Planche, and on the right Julien Montfalcon.
				// see lines 13-18 of reader.js for further information.
				console.log("results of race1 personne de ", _arg)

				if (firstClientSeated=="left") {
					_who = _arg=="left" ? "Michèle Planche" : "Julien Montfalcon"
				}else{
					_who = _arg=="left" ? "Julien Montfalcon" : "Michèle Planche"
				}

				// get score from method with callback.
				Meteor.call("calculateRaceDuration", environment, "race1", _who, 
					(error, result) =>{
						loadText(undefined, undefined, 
							// la personne de xxx (gauche/droite)
							finishMessageStrings[0]+ _arg+ 
							// à mis xxx 
							finishMessageStrings[1]+ result.diffTimeS+ 
							// secondes et xxx 
							finishMessageStrings[2]+ result.diffTimeD+
							// dizièmes à parcourir le texte.
							finishMessageStrings[3])
				})
			break;

			case "#serverstrobe":
				// players.methods
				Meteor.call("showServerCall", environment)
			break;

			case "#stepper":
				if (_arg=="stop") {
					// players.methods
					Meteor.call("stepperStopCall", environment)
					// we want to stop the stepper in order to save memory
					instance.data.obj.spaceBarStatus = "reader"
					// and make the spacebar go to the default mode, in which
					// it's used to get new lines of text.	
				}else{
					// or else we want to start the stepper and make
					// the spacebar change behaviour
					Meteor.call("stepperStartCall", environment)
					instance.data.obj.spaceBarStatus = "racer"					
					document.getElementsByClassName("racerContainer")[0].style.opacity=1
					document.getElementsByClassName("readerContainer")[0].style.opacity=0
				}
			break;

			case "#qcm":
			// we need an empty array to store the text which is going to
			// appear when someone answers to a question
			qcmResponses = []
			// we also want to stop the spacebar until question is answered.
			console.log("going into parking.")
			this.instance.data.stopped = true
			break;

			case "#rep":
			// load text as response nr 1
			break;
			
			case "#res":
			// load response in response array
			qcmResponses.push(_arg)
			break;

			default :
				console.log(_key, "maybe missing a # before keyword?")
			break;
		}
	}
}

scrollText = function(){
	$('#textColumn').scrollTop($('#textColumn')[0].scrollHeight);
}