import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { StoryDev } from '../../api/story/story.js';
import { StoryProd } from '../../api/story/story.js';

import './storyEditor.html';
import './storyEditor.css';

// components used inside the template
import '../components/editor.js';


Template.storyEditor.onCreated(function storyEditorOnCreated() {
	// environment can either be "Prod" or "Dev"
	_environment = FlowRouter.getParam("environment")
	environment = _environment.charAt(0).toUpperCase()+_environment.slice(1)
	// either subscribe to dev or prod DB, defaults to dev in case
	// of erroneous query.
	if (environment!="Dev" && environment!="Prod") {
		environment="Dev"
	}
	this.subscribe(`story.${environment}`);

	instance = Template.instance()
});

Template.storyEditor.events({

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

Template.storyEditor.helpers({
	story(){
	// this returns the story from the db
		if (!instance.subscriptionsReady()) {
			return ["?"]
		}else{
			if (environment=="Dev") {
				return{
					story:StoryDev.find({})}
			}else{
				return{
					story:StoryProd.find({})}
			}
		}
	}

})