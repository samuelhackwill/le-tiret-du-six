import { Players } from './players.js';
import { playersSchema } from './players.js';

Meteor.methods({
	async playerInsert(_env, obj){
		// clean modifies the object, adding an aiguebename
		// and atIndex = 0 objects.
		// we're also passing the "env" parameter to the autovalue function
		// wich is useful for aiguebename selection.
		cleanedObj = playersSchema.clean(obj, {extendAutoValueContext:{"env":_env}})
		console.log("new player : ", cleanedObj.players[0].aiguebename)

		if(playersSchema.isValid()){
			Players.update({env:_env},{ $push: { players: cleanedObj.players[0] } })
			return {msg : "successful player insertion!", data : cleanedObj}
		}else{
			throw new Meteor.Error("validation error during db insert", playersSchema.validationErrors())
		}
	},	

	playerDestroy(_env, _aiguebename){
		console.log("player destroy ", _env, _aiguebename)
		Players.update({env:_env},{ $pull: { players: {aiguebename:_aiguebename} } })
		return {msg : "removing player : ", who : _aiguebename}
	},

	spacebarPlayer(_env, _aiguebename, _atIndex){
		console.log(_env, _aiguebename, _atIndex)
		// update player's index so we can track it elsewhere.
		// i'm using a positional argument "$" here to update the one field.
		Players.update({env:_env, "players.aiguebename":_aiguebename}, {$set : {"players.$.atIndex" : _atIndex} })
	},

	playerLogTime(_env, _aiguebename, _whichRace){
		time = new Date()
		console.log(_whichRace)
		// we're looking for a score.start field in the player document.
		// if one exists, it's that the race is already started and that
		// the method was called to log the finish time.
		isRaceStarted = _.findWhere(Players.find({env:_env},{"players.aiguebename": _aiguebename}).fetch()[0].players, {aiguebename:_aiguebename}).score?.[_whichRace]?.start

		console.log("is alreadyStarted undefined?", isRaceStarted==undefined)
		startOrFinish = isRaceStarted ? "finish" : "start"

		Players.update({env:_env, "players.aiguebename":_aiguebename}, {$set : {["players.$.score."+_whichRace+"."+startOrFinish] : time} })
	},

	showServerCall(_env){
		if (playersCounter[_env]<1) {
			// if playersCounter hasn't been updated yet,
			// it means that it's the first time showServerCall is triggered,
			// and that it should make the admin screen strobe.
			sendMessage({action:"showServerCall", strobeSwitch:true, env:_env})
		}
		
		// we want to track the number of players who have 
		// already called the function so that the last player
		// will toggle the strobe off.
		playersCounter[_env] = playersCounter[_env] +1

		if (playersCounter[_env] == Players.find({env :_env}).fetch()[0].players.length) {
			// finaly, if this was the last player to call the function,
			// terminate the strobe effect on the admin screen.
			sendMessage({action:"showServerCall", strobeSwitch:false, env:_env})
			return
		}
		
	
	}
});