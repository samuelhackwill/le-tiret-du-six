import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { Story } from '../../api/story/story.js';
import { Words } from '../../api/words/words.js';

import './editor.html';
import './editor.css';

// components used inside the template
import '../components/storyEditor.js';
import '../components/wordsEditor.js';


Template.editor.onCreated(function editorOnCreated() {
	// environment can either be "Prod" or "Dev"
	_environment = FlowRouter.getParam("environment")
	environment = _environment.charAt(0).toUpperCase()+_environment.slice(1)
	// either subscribe to dev or prod DB, defaults to dev in case
	// of erroneous query.
	if (environment!="Dev" && environment!="Prod") {
		environment="Dev"
	}

	this.subscribe('story');
	this.subscribe('words');

	instance = Template.instance()
});

Template.editor.events({

	'click #🗑'(){
		Meteor.call("destroyStory", environment)
	},

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
	}
})

Template.editor.helpers({
	story(){
	// this returns the story from the db
		if (!instance.subscriptionsReady()) {
		}else{
			return{
				story:Story.find({env:environment})
			}
		}
	},

	words(){
		if (!instance.subscriptionsReady()) {
		}else{
			return{
				words:Words.find({env:environment})
			}
		}	
	}

})