import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Mongo } from 'meteor/mongo';
import { FlowRouter } from 'meteor/kadira:flow-router';

// methods... for some reason i need to import that one
import { spacebarInvert } from '../../api/globals/methods.js'

import './spacebarControl.html';
import './spacebarControl.css';

Template.spacebarControl.events({

	"click button.spacebar"(){
		Meteor.call("spacebarInvert", environment)
	}	

})
