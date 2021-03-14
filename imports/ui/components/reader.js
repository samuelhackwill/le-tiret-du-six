import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Mongo } from 'meteor/mongo';
import { FlowRouter } from 'meteor/kadira:flow-router';

import './reader.html';
import './reader.css';

import { streamer } from '../../api/streamer/streamer.js';

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
	instance = this
	// i guess it would be better to pull this number
	// from DB to avoid fatal disconnections
	instance.data.obj._atIndex = -1
})

Template.reader.onRendered(function(){
	document.onkeyup = function(event){
		if (event.keyCode==32) {
			spaceBarPress()
		}
	}
})

spaceBarPress = function(){
	// get local index from instance data.
	let _atIndex = instance.data.obj._atIndex
	let _Story = instance.data.obj.story.collection.find({env:environment}).fetch()[0].data

	console.log(_Story)

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

	if (_adminAtIndex < _Story.length){
		loadText(_Story, _adminAtIndex)
	}else{
		console.log("No more text!")
		return
	}
};

loadText = function(_Story, index){
    $('#textColumn').append($('<ul/>').html(_Story[index].line))
    // $('#srt').scrollTop($('#srt')[0].scrollHeight);

}