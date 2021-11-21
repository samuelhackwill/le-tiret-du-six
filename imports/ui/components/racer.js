import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Mongo } from 'meteor/mongo';
import { FlowRouter } from 'meteor/kadira:flow-router';

import './racer.html';
import './racer.css';

cyclerCount = 1;

Template.racer.helpers({
	players(){
		_currentRace = Session.get("currentRace")
		// the players helper is reponsible for displaying the right players
		// the one player in case of solo race
		// or pool players in case of pool races
		// or finalists in case of the finals
		// or everybody in case of FFA.
		if (!this.obj.players.collection.find({env:environment}).fetch().length) {
			// do nothing, array is empty
		}else{

			if (_currentRace=="race2") {
				// SOLO
				const search_tags = ["bot"]
				search_tags.push(instance.aiguebename)

				const allPlayers = instance.data.obj.players.collection.find({env:environment}).fetch()[0].players
				const isRunning = allPlayers.filter((allPlayers) => search_tags.some((name) => Object.values(allPlayers).includes(name)))

				return isRunning
			}

			if (_currentRace=="race3") {
				// pool race spacebar athletes
				// we're going to need a mean for race 2, in order to assign
				// pool to players.
				race2Mean = 0;
				scores = 0

				let allPlayers = instance.data.obj.players.collection.findOne({env:"Dev"}).players
				
				for (var i = allPlayers.length - 1; i >= 0; i--) {
					if (allPlayers[i]?.score?.race2?.finish != undefined && allPlayers[i]?.score?.race2?.start != undefined) {
						console.log("adding score of ", allPlayers[i])
						scores = scores + (allPlayers[i].score.race2.finish - allPlayers[i].score.race2.start)
					}
				}

				race2Mean = scores/(allPlayers.length)

				console.log("scores", scores, "allplayers length", allPlayers.length, "mean ", Number(race2Mean))

				function predicate(x) { return (x.score.race2.finish-x.score.race2.start )<= race2Mean }
				onlyFastest = allPlayers.filter(function(x) { return predicate(x) })

				console.log("we are only showing players who have run faster than the mean, ", race2Mean, "ms")
				console.log("these players are ", onlyFastest)

				return onlyFastest
			}


			if (_currentRace=="race4") {
				// pool race team sieste
				// we're going to need a mean for race 2, in order to assign
				// pool to players.
				race2Mean = 0;
				scores = 0

				let allPlayers = instance.data.obj.players.collection.findOne({env:"Dev"}).players
				
				for (var i = allPlayers.length - 1; i >= 0; i--) {
					if (allPlayers[i]?.score?.race2?.finish != undefined && allPlayers[i]?.score?.race2?.start != undefined) {
						console.log("adding score of ", allPlayers[i])
						scores = scores + (allPlayers[i].score.race2.finish - allPlayers[i].score.race2.start)
					}
				}

				race2Mean = scores/(allPlayers.length)

				console.log("scores", scores, "allplayers length", allPlayers.length, "mean ", Number(race2Mean))

				function predicate(x) { return (x.score.race2.finish-x.score.race2.start )> race2Mean }
				onlySlowest = allPlayers.filter(function(x) { return predicate(x) })

				console.log("we are only showing players who have run faster than the mean, ", race2Mean, "ms")
				console.log("these players are ", onlySlowest)

				return onlySlowest
			}
			// FFA
			// return this.obj.players.collection.find({env:environment}).fetch()[0].players
		}
	},

	vous(){
	    if(instance.aiguebename===this.aiguebename){
	      return "V"
	    }else{
	      return
    	}
	},
})

redrawPlayers=function(posTable){
    $.each(posTable, function(key, value){
        var doesPlayerExist = document.getElementById(""+key)

        if(doesPlayerExist!==null){
			doesPlayerExist.style.transform="translateX("+value+"vw)"
        }
    })
};


imageCycler = function(who){

	if (domelements = document.getElementById(who)) {
	  domelements = document.getElementById(who).children[0]
	  domelements.children[cyclerCount].style.opacity=0
	  domelements.children[cyclerCount+1].style.opacity=1

	  if(cyclerCount<10){
	    if(cyclerCount==1){
	      domelements.children[11].style.opacity=0
	    }
	    cyclerCount ++
	  }else{
	    cyclerCount = 1;
	  }
	}
}
