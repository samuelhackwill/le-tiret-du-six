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

			// spacebar athletes
			if (_currentRace=="race3") {
				return onlyFastest
			}

			// team sieste
			if (_currentRace=="race4") {
				return onlySlowest
			}

			// FFA
			if (_currentRace=="race0") {
				return this.obj.players.collection.find({env:environment}).fetch()[0].players
			}
		}
	},

	vous(){
	    if(instance.aiguebename===this.aiguebename){
	      return "V"
	    }else{
	      return
    	}
	},
	fakeScores(){

		var scores = [];
		scores.push({rank: '1st', pseudo: 'BITO', time: '23:164', lane: 5});
		scores.push({rank: '2nd', pseudo: 'POPO', time: '23:169', lane: 7});
		scores.push({rank: '3rd', pseudo: 'CACA', time: '23:169', lane: 2});
		scores.push({rank: '4th', pseudo: 'PIPI', time: '23:169', lane: 11});
		scores.push({rank: '5th', pseudo: 'FOUF', time: '23:169', lane: 1});
		scores.push({rank: '6th', pseudo: 'SGEG', time: '23:169', lane: 3});
		scores.push({rank: '7th', pseudo: 'NAZI', time: '23:169', lane: 12});
		scores.push({rank: '8th', pseudo: 'ZOBI', time: '23:169', lane: 9});
		scores.push({rank: '9th', pseudo: 'SMSX', time: '23:169', lane: 10});
		scores.push({rank: '10th', pseudo: 'PPDA', time: '23:169', lane: 14});
		scores.push({rank: '11th', pseudo: 'DICK', time: '23:169', lane: 6});
		scores.push({rank: '12th', pseudo: 'POIL', time: '23:169', lane: 4});
		scores.push({rank: '13th', pseudo: 'DSK1', time: '23:169', lane: 8});
		scores.push({rank: '14th', pseudo: 'JAJA', time: '23:169', lane: 13});

		return scores;

	}
})

redrawPlayers=function(posTable){
    $.each(posTable, function(key, value){
        var doesPlayerExist = document.getElementById(""+key)

        if(doesPlayerExist!==null){
			// doesPlayerExist.style.transform="translateX("+value+"vw)"
			doesPlayerExist.style.left=value+"%";
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
