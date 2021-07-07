import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Mongo } from 'meteor/mongo';
import { FlowRouter } from 'meteor/kadira:flow-router';

import './racer.html';
import './racer.css';

import { streamer } from '../../api/streamer/streamer.js';

streamer.on('message', function(message) {
	// only run if from template reader. Didn't find another way of doing it
	// as streamer seems to be a global object and runs everywhere.
	if( instance.view.template.viewName == "Template.racer" && message.env == environment){
		switch (message.action){
			case "raceStep":
			console.log("raceStep ", message._posTable)
			break;
		}
	}
});
