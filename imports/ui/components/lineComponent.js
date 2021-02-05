/* global confirm */

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Mongo } from 'meteor/mongo';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactiveVar } from 'meteor/reactive-var';

import './lineComponent.html';
import './lineComponent.css';

// memory for the collapse button
let collapsed = false

Template.lineComponent.onCreated(function(){
	this.editing = new ReactiveVar(false);
})

Template.lineComponent.events({
	'click .paramsCollapser'(){
		docs = document.getElementsByClassName("paramsContainer")

		if (collapsed) {
			for (var i = docs.length - 1; i >= 0; i--) {
				docs[i].style.display="block"
				document.getElementsByClassName("paramsCollapser")[0].innerHTML = "collapse params"
			}
		}else{
			for (var i = docs.length - 1; i >= 0; i--) {
				docs[i].style.display="none"
				document.getElementsByClassName("paramsCollapser")[0].innerHTML = "show params"
			}
		}

		// change status of collapsed
		collapsed =! collapsed
	},

	'click .container'(){
		console.log("ENTERING CONTAINER")
		Template.instance().editing.set( true );
	},

	'mouseleave .container'(){
		// here you should update the db with any 
		// changes. ugh! or flash db and insert anew

		// prob call parser
		console.log("LEAVING CONTAINER")
		Template.instance().editing.set( false );
	}
})

Template.lineComponent.helpers({
	editMode(){
	    return Template.instance().editing.get();
	}
})