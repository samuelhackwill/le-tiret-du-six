import { Meteor } from 'meteor/meteor';
import { Players } from '../players.js';

Meteor.publish('players', function() {
  return Players.find({});
});

// server-side methods

Meteor.methods({
	// we want to calculate it on the server side to have access
	// to complex mongodb queries (that aren't available in minimongo)
	async calculateRaceDuration(_env, _race, _who){
		console.log("calculatingz", _env, _race, _who)

		let _diffTimeS
		let _diffTimeD
		let raceTimes

		what1 = Players.find(
	    { 'players.aiguebename': _who},
	    { fields :
	    	{ 'players.$': 1, 'env':1 }
	    }).fetch()

		for (var i = what1.length - 1; i >= 0; i--) {
			if (what1[i].env == _env) {
				raceTimes = what1[i].players[0].score[_race]
				console.log("racetimes ",raceTimes)
				_diffTimeS = Math.floor((raceTimes.finish - raceTimes.start)/1000);
				_diffTimeD = Math.floor(((raceTimes.finish - raceTimes.start)%1000)/ 10);
			}
		}

		if (_race == "race3") {
			// for race3 we need to do more stuff : calculate median, 
			// 1st percentile, 9th percentile, how many people were under and 
			// over these percentiles.
			// I could very certainly do this with mongo aggregation
			// but i suck at mongo so we'll have to stick with javascript
			// for the moment.

			what2 = Players.findOne({env:"Dev"})
			// get the players
			let timesArray = []
			// that's the array where we're going to stick all the values
			for (var i = what2.players.length - 1; i >= 0; i--) {
				let raceTimes = what2.players[i].score.race3
				let diffTime = raceTimes.finish - raceTimes.start
				timesArray.push(diffTime)
			}

			console.log("this is an array with all the times. ", timesArray)

			// sort the values by ascending order
			timesArray.sort((a, b) => a - b)
			// now let's calculate the median :
			// first, is array even or odd?

			let timesArrayL = timesArray.length
			let results = {}
			let mediane

			if(timesArrayL % 2 == 0){
				// get two middle values, add them together and divide by two
				results.mediane = (timesArray[timesArrayL/2]+timesArray[timesArrayL/2-1])/2
			}else{
				// get single middle value in array
				mediane = Math.ceil(timesArrayL/2)
			}

			results.decile1 = timesArray[Math.ceil((1/10)*timesArray.length-1)]
			results.decile9 = timesArray[Math.ceil((9/10)*timesArray.length-1)]
			results.diffTimeS = _diffTimeS
			results.diffTimeD = _diffTimeD
			results.diffTime = raceTimes.finish - raceTimes.start

			return results
		}else{
			return {"diffTimeS" : _diffTimeS, "diffTimeD" : _diffTimeD}
		}


	},

	rebootCall(_env){
		console.log("calling reboot")
		// first clear DB
		Players.remove({env:_env})

		// then make new fixtures
		initiatePlayers(_env)
	}
})