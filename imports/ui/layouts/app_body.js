import { StoryDev } from '../../api/story/story.js';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { _ } from 'meteor/underscore';

import './app_body.html';
import './app_body.css';

Template.App_body.onCreated(function appBodyOnCreated() {
  this.subscribe('story.dev');
  this.subscribe('story.prod');
});


Template.registerHelper("objectToPairs",function(object){
	// this register helper is used to render object keys
	// as HTML. It is used in lineComponents.js, 
	// as StoryDev.params is an array of objects, and i haven't 
	// found another way of iterating inside it with blaze).
	// Using a registerhelper rather than a helper inside of
	// lineComponent.js seemed more consistent with using components.
	return _.map(object, function(value, key) {
		return {
			key: key,
			value: value
		};
	});
});


testInsert = async function(obj, env){
	try{
		// get current environment : prod or dev
		env = FlowRouter._current.params.environment
		// meteor async call
		const result = await Meteor.callPromise('storyLineInsert', obj)
		console.log("finished ! ", result)
	}catch (error){
		console.log(error)
	}
}