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

Template.lineComponent.onRendered(function(){

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
		Template.instance().editing.set( true );
	},

	'mouseout .textAreaContainer'(){
		// here you should update the db with any 
		// changes. ugh! or flash db and insert anew
		Template.instance().editing.set( false );

		if (document.getElementsByClassName("textAreaContainer")[0].value) {
			textAreaValue = document.getElementsByClassName("textAreaContainer")[0].value
			// call parser (../layouts/storyEditor.js)
			parseAndSendToDb(textAreaValue)
		}else{
			console.log("textArea empty.")
		}

	},

	'keydown .textAreaContainer'(event){
		// this is to enable indentation with TAB key in the textarea.
		element = document.getElementsByClassName("textAreaContainer")[0]
		if (event.key == 'Tab') {
		    event.preventDefault();
		    var start = element.selectionStart;
		    var end = element.selectionEnd;

		    // set textarea value to: text before caret + tab + text after caret
		    element.value = element.value.substring(0, start) + "\t" + element.value.substring(end);

		    // put caret at right position again
		    element.selectionStart = element.selectionEnd = start + 1;
	  }

	}
})

Template.lineComponent.helpers({
	editMode(){
	    return Template.instance().editing.get();
	}
})