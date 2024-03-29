import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Mongo } from 'meteor/mongo';
import { FlowRouter } from 'meteor/kadira:flow-router';

import './wordsBank.html';
import './wordsBank.css';


Template.wordsBank.onCreated(function(){
	Session.set("harvest", [])
});


Template.wordsBank.helpers({
	getCollectedWords:function(){
		// we need to get all the words that were harvested by the
		// group, but also underline the words that were harvested by
		// the active player.

		// if(Session.get("wereAllWordsHarvested")){
			// harvest = []
			// allWords = instance.data.obj.words.collection.find({env:environment}).fetch()[0].data
			// for (var i = Session.get("harvest").length - 1; i >= 0; i--) {
			// 	harvest.push(allWords[i].name)
			// }
			return Session.get("harvest")
			
		// }else{
		// let allPlayers = this.obj.players.collection.findOne({env: environment})?.players
		// let player = allPlayers?.find(str=>str.aiguebename===instance.aiguebename)
		// let harvest = player?.score?.harvest

		// console.log(harvest)

		// return harvest
		// }
	},

	miningStatus:function(){
		// this function is responsible for getting the stats of the current player
		// words mined, but also words mined by other players, etc.


			let allPlayers = this.obj.players.collection.findOne({env: environment})?.players

			let harvest = Session.get("harvest").length || 0

			if (allPlayers) {
				let player = allPlayers?.find(str=>str.aiguebename===instance.aiguebename)
				let _iCollected = player?.score?.harvest?.length || 0
				// for (var i = allPlayers.length - 1; i >= 0; i--) {
				// 	add = allPlayers[i]?.score?.harvest?.length || 0
				// 	counter = counter + add
				// }

				// let words = instance.data.obj.words.collection.findOne({env:environment})?.data?.length || 0
				let words = Session.get("toCollect")
				let toHarvest = document.getElementsByClassName("minable")?.length || 0

			return {iCollected : _iCollected, total : words, totalCollected : harvest, left : toHarvest}
			}
	}

});



Template.wordsBank.events({

	'click .words ul li'(t){
		console.log(t)
		for (var i = t.currentTarget.parentNode.children.length - 1; i >= 0; i--) {
			t.currentTarget.parentNode.children[i].children[0].classList.remove("is-active")
		}

		t.target.classList.add("is-active")

		let words = instance.data.obj.words.collection.findOne({env:environment})?.data
		let word = words?.find(str=>str.name===t.target.innerText)

		console.log(word)

		document.getElementsByClassName("wordTitle")[0].innerText = word.name
		document.getElementsByClassName("wordDefinition")[0].innerText = word.text
		document.getElementsByClassName("citation")[0].innerText = word.citation
		document.getElementsByClassName("whoCitation")[0].innerText = word.author

	},

	'click .toggleWordsBank'(){
		$('.wordsBankContainer').toggleClass('is-open');
		$('.toggleWordsBank').toggleClass('is-open');
	},

	'click .closeWordsBank'(){
		$('.wordsBankContainer').removeClass('is-open');
		$('.toggleWordsBank').removeClass('is-open');
	}

})
