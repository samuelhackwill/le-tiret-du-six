import { Players } from './players.js';
import { playersSchema } from './players.js';

_currentRace = ""

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

		Players.update({env:_env, "players.aiguebename":_aiguebename}, {$set : {["players.$.score."+_whichRace+"."+startOrFinish] : time}})
	},

	showServerCall(_env){
		if (playersCounter[_env]<1) {
			console.log("showServerCall launching strobe!")
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
			console.log("showServerCall terminating strobe in 10 seconds.")
			sendMessage({action:"showServerCall", strobeSwitch:false, env:_env})
			// reinitialize playersCounter for the next round!
			playersCounter[_env] = 0
			return
		}
		
	
	},

	stepperStartCall(_env, _whichRace){
		_currentRace = _whichRace
		console.log("players counter ", playersCounter)
		if (playersCounter[_env]<1) {
		console.log("stepperStartCall launching stepper!")
		// i'm re-using playersCounter, which doesn't sound very safe.
		// on the other hand the two sequences during
		// which it's used don't overlap (showServerCall is during ACTE II
		// and stepperStartCall is during ACTE I and probably ACTE IV)

		timerSteps = Meteor.setInterval(function(){
			// initialize the function which updates the position
			// of every player 12 times a second.  
			if(stepQueue.length > 0) {
				console.log("updating position of these players :", stepQueue)
				Meteor.call('stepServerSide', _env = _env)
			}else{
				console.log("stepQueue is empty, returning!")
				return
			}
		},timerStepsInterval);


		}else{
			console.log("stepper is already running!")
			return
		}

		// we want to track the number of players who have 
		// already called the function so that the second
		// player won't trigger a new stepper call.
		playersCounter[_env] = playersCounter[_env] +1

	},

	adminStopTheRace(_env){
		console.log("*ADMIN* stop stepper now!")
		Meteor.clearInterval(timerSteps)
		posTable = {}

		sendMessage({action:"endRacePool", env:_env})

		// we need to tell stepper start call that he can be
		// called again whenever.
		playersCounter[_env] = 0
	},

	stepperStopCall(_env){
		if (playersCounter[_env]>0) {
			// the first player to call the function
			// terminates the timeStep loop.
			console.log("stop stepper now!")
			Meteor.clearInterval(timerSteps)
			posTable = {}
		}else{
			// the next players don't trigger anything.
			console.log("stepper is already stopped, do nothing!")
			return
		}
		playersCounter[_env] = 0
	},

  stepServerSide(_env){
  	// stepServerSide updates the posTable
  	// which contains the position of every runner
  	// during race 2 of ACTE I.
    console.log("updating position of players! ", _currentRace)
    updates = 0;
    for (var i = 0; i < stepQueue.length; i++) {
    	// stepQueue contains all the calls that were made 
    	// by players to update their position on the screen.
    	// 1 call = 1 step.
      typeof posTable[stepQueue[i]] === 'undefined' ? posTable[stepQueue[i]] = 1 : posTable[stepQueue[i]]++;
      // if posTable of <aiguebename> does not exist, create an entry
      // at position 1.

      if (posTable[stepQueue[i]]==98) {
      	// as soon as someone reaches 98 spacebar presses, that means
      	// he has finished a race.

				// if we are in solo race mode, we want to call the end of the race
				// for that particular person, right away, but let
				// other players continue running. We are also logging the score
				// because we need to make pools by performance.
				if (stepQueue[i]=="bot") {
					// we don't want to log bot score and also we want to
					// get rid of him, or else he'll be in our way for next
					// races.
					Meteor.setTimeout(function() {
						Meteor.call("playerDestroy", _env=_env, _aiguebename="bot")
					},3000);
				}else{
					Meteor.call("playerLogTime", _env=_env, _aiguebename = stepQueue[i], _whichRace = _currentRace)
				}
				if (_currentRace=="race2") {
					sendMessage({action:"endRaceSolo", env:_env, winner:stepQueue[i]})
				}else{
					sendMessage({action:"crossLinePool", env:_env})
				}
				return
      }
      updates++;
    }
    stepQueue = []
    console.log("send message! "+updates+" positions updated")
		sendMessage({action:"updateRunners", _posTable:posTable, env:_env})
  },

  requestStepServerSide: function(who){
  	// every spacebar press of a player during race 2 of ACTE I is 
  	// registered in the stepQueue array.
    stepQueue.push(who);

  }

});