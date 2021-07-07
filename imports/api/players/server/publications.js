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
		what = Players.find(
	    { 'players.aiguebename': _who},
	    { fields :
	    	{ 'players.$': 1, 'env':1 }
	    }).fetch()

		for (var i = what.length - 1; i >= 0; i--) {
			if (what[i].env == _env) {
				raceTimes = what[i].players[0].score[_race]
				_diffTimeS = Math.floor((raceTimes.finish - raceTimes.start)/1000);
				_diffTimeD = Math.floor(((raceTimes.finish - raceTimes.start)%1000)/ 10);
			}
		}

	return {"diffTimeS" : _diffTimeS, "diffTimeD" : _diffTimeD}

	},

	rebootCall(_env){
		console.log("calling reboot")
		// first clear DB
		Players.remove({env:_env})

		// then make new fixtures
		initiatePlayers(_env)
	}
})