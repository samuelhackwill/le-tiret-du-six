import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Mongo } from 'meteor/mongo';
import { FlowRouter } from 'meteor/kadira:flow-router';

import './achievementsControl.html';
import './achievementsControl.css';


Template.achievementsControl.onCreated(function(){
	instance = this
	instance.achievementsControl = []

})

Template.achievementsControl.events({

	"click button.achCourse1"(e){		
		_value = new Date()
		_name = e.currentTarget.id


		console.log(environment, _name, _value)
		instance.achievementsControl.push({[_name]:[_value]})
		// Meteor.call("logAchievement",_env = environment, name = _name, value = _value )

		if (e.currentTarget.id == "entreePublicEnd") {
			result = (instance.achievementsControl[1].entreePublicEnd[0] - instance.achievementsControl[0].entreePublicStart[0])/1000
			alert(result + "secondes pour l'entrée public")
		}
	},

	"click button.achCourse2"(e){		
		_value = new Date()
		_name = e.currentTarget.id


		console.log(environment, _name, _value)
		instance.achievementsControl.push({[_name]:[_value]})
		// Meteor.call("logAchievement",_env = environment, name = _name, value = _value )

		if (e.currentTarget.id == "samuelRobotEnd") {
			result = (instance.achievementsControl[3].samuelRobotEnd[0] - instance.achievementsControl[2].samuelRobotStart[0])/1000
			alert(result + "secondes pour le blabla ping")
		}
	},

	"keyup #publicCount"(e){
		_value = e.currentTarget.valueAsNumber
		_name = e.currentTarget.id

		console.log(environment, _name, _value)
		Meteor.call("logAchievement",_env = environment, name = _name, value = _value )
	}
})

Template.achievementsControl.helpers({

})