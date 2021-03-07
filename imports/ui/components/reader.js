import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Mongo } from 'meteor/mongo';
import { FlowRouter } from 'meteor/kadira:flow-router';

import './reader.html';
import './reader.css';

import { playerInsert } from '../../api/players/methods.js'

Template.reader.onCreated(function(){
	// this makes the instance accessible globally.
	// (because i'm not going to use helpers to display
	// text this time.)
	instance = this
})

Template.reader.onRendered(function(){
	document.onkeydown = function(event){
		if (event.keyCode==32) {
			spaceBarPress(event)
		}
	}
})

grabStory = function(){
	// this function is called by show.js as soon
	// as it's subscriptions are ready.
	_Story = instance.data.story.collection.find({}).fetch()
}

spaceBarPress = function(){
	console.log("i pressed a key.", event.keyCode)
}