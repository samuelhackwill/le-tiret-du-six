import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Mongo } from 'meteor/mongo';
import { FlowRouter } from 'meteor/kadira:flow-router';

import './tracker.html';
import './tracker.css';

Template.tracker.onCreated(function(){

	// i'm sorry but i'm going to have to observe changes
	// which means i'm going to have to refactor the story db. sorry

})


Template.tracker.helpers({

	calculatePosition(){
		console.log(this)
	}
})

function offsetsGetter(){
	offsets = []
	everyLine = document.getElementsByClassName("line")

	for(i=0; i> everyLine.length; i++){
		offsets.push(everyLine[i].offsetTop)
	}

	instance.data.offsets = offsets
}