import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Mongo } from 'meteor/mongo';
import { FlowRouter } from 'meteor/kadira:flow-router';

import './tracker.html';
import './tracker.css';

Template.tracker.onCreated(function(){

	var query = this.data.story.collection.find();
	query.observeChanges({
		added:function(){
			  Tracker.afterFlush(function () {
			  	// only launch the function after tracker flush.
			  	// I'm not 100% sure that it ensures that the 
			  	// DOM is ready but it seems good enough.
				offsetsGetter()
			});
		}
	})
})


Template.tracker.helpers({

	nthRow(){
		// we need to align each cursor with the appropriate row
		// but as every line hasn't got a fixed height,
		// instance.data.offsets contain the exact offsetTop
		// of every line.
		return instance.data.offsets[this.atIndex]
	}
})

function offsetsGetter(){
	offsets = []
	everyLine = document.getElementsByClassName("line")


	for(i=0; i<everyLine.length; i++){
		offsets.push(everyLine[i].offsetTop)
	}

	instance.data.offsets = offsets

	// we need to modify the total height of tracker div
	// so that we get the same total scroll height for both divs.
	// (or else the cursors won't be aligned any more)
	masterHeight = document.getElementById("editorTH").offsetHeight
	console.log(masterHeight)
	document.getElementById("trackerTH").style.height = masterHeight+"px"
}