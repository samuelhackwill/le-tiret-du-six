import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Mongo } from 'meteor/mongo';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { HighScore } from '../../api/highScore/highScore';

import './achievementsControl.html';
import './achievementsControl.css';

tempJaugeScore = []
tempEntreeScore = []


Template.achievementsControl.onCreated(function(){
	instance = this
	instance.achievementsControl = []

})

Template.achievementsControl.helpers({
	highScore(){
		return this.highScore.collection.find({}).fetch()
	}

})

Template.achievementsControl.events({

	"click button.achCourse"(e){		
		_value = new Date()
		_name = e.currentTarget.id


		console.log(environment, _name, _value)
		instance.achievementsControl.[_name]=_value

		if (e.currentTarget.id == "entreePublicEnd") {
			result = (instance.achievementsControl.entreePublicEnd - instance.achievementsControl.entreePublicStart)/1000
			e.currentTarget.innerText = result + "s entrée public"
			e.currentTarget.style.backgroundColor = "lime"
			console.log(_name, result)
			if (result == NaN) {
				e.currentTarget.innerText = result + "something went wrong!"
			}else{
				tempEntreeScore[0] = _name
				tempEntreeScore[1] = result
			}
		}
		
		if (e.currentTarget.id == "samuelRobotEnd") {
			result = (instance.achievementsControl.samuelRobotEnd - instance.achievementsControl.samuelRobotStart)/1000
			e.currentTarget.innerText = result + "s ping"
			e.currentTarget.style.backgroundColor = "lime"
			console.log(_name, result)
			if (result == NaN) {
				e.currentTarget.innerText = result + "something went wrong!"
			}else{
				Meteor.call("logAchievement",_env = environment, name = _name, value = result )
				Meteor.call("logAchievement",_env = environment, name = tempEntreeScore[0], value = tempEntreeScore[1] )
				Meteor.call("logAchievement",_env = environment, name = tempJaugeScore[0], value = tempJaugeScore[1] )
			}
		}



	},

	"click button.achievementButton"(e){		
		e.currentTarget.style.backgroundColor = "lime"
		_name = e.currentTarget.parentElement.id
		_value = e.currentTarget.innerText
		console.log(_name, _value)
		tempJaugeScore[0] = _name
		tempJaugeScore[1] = _value
	}
})

Template.achievementsControl.helpers({

})