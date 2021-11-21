import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Mongo } from 'meteor/mongo';
import { FlowRouter } from 'meteor/kadira:flow-router';

import './wordsBank.html';
import './wordsBank.css';


Template.wordsBank.onCreated(function(){

});


Template.wordsBank.helpers({
	getCollectedWords:function(){
		// we need to get all the words that were harvested by that player so
		// we can display them in the word cabinet.
		let allPlayers = this.obj.players.collection.findOne({env: environment})?.players
		let player = allPlayers?.find(str=>str.aiguebename===instance.aiguebename)
		let harvest = player?.score?.harvest

		return harvest
	},

	miningStatus:function(){

		let allPlayers = this.obj.players.collection.findOne({env: environment})?.players
		let player = allPlayers?.find(str=>str.aiguebename===instance.aiguebename)
		let harvest = player?.score?.harvest?.length || 0

		let counter = 0

		for (var i = allPlayers.length - 1; i >= 0; i--) {
			add = allPlayers[i]?.score?.harvest?.length || 0
			counter = counter + add
		}

		let words = instance.data.obj.words.collection.findOne({env:environment})?.data?.length || 0


		return {iCollected : harvest, total : words, totalCollected : counter, left : (words-counter)}
	}

});



Template.wordsBank.events({

	'click .words ul li'(t){
		console.log(t)
		for (var i = t.currentTarget.parentNode.children.length - 1; i >= 0; i--) {
			t.currentTarget.parentNode.children[i].children[0].className = ""
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
