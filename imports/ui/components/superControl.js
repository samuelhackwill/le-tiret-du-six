import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Mongo } from 'meteor/mongo';
import { FlowRouter } from 'meteor/kadira:flow-router';

import './superControl.html';
import './superControl.css';

Template.superControl.events({

	'click .reboot'(){
		Meteor.call("rebootAdmin", environment)
	},

	'click .stopMining'(){
		// it would be nice to implement a mongo query to delete
		// harvestedLetters array.
		Meteor.call("stopMiningAdmin", environment)
	},

	'click .stopTheRace'(){
		Meteor.call("adminStopTheRace", environment)
	},

	'click .end'(){
		Meteor.call("endTheShow", environment)
	}

})