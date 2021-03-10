import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Mongo } from 'meteor/mongo';
import { FlowRouter } from 'meteor/kadira:flow-router';

import './reader.html';
import './reader.css';

Template.reader.onCreated(function(){
	// this makes the instance accessible globally.
	// (because i'm not going to use helpers to display
	// text this time.)
	instance = this
	// LOCAL index for the reader
	instance.data._atIndex = 0
})

Template.reader.onRendered(function(){
	document.onkeyup = function(event){
		if (event.keyCode==32) {
			spaceBarPress(event)
		}
	}
})

grabStory = function(){
	// this function is called by show.js as soon
	// as it's subscriptions are ready.
	// get the story and store it in global var
	_Story = instance.data.story.collection.find({}).fetch()
}


spaceBarPress = function(){
	instance.data._atIndex = instance.data._atIndex +1
	fetchNextLine(instance.data._atIndex)
}

adminNext = function(){
	// instance.data._atIndex = 
}