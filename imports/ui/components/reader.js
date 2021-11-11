import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Mongo } from 'meteor/mongo';
import { FlowRouter } from 'meteor/kadira:flow-router';

import './reader.html';
import './reader.css';

// this is the number of clicks someone has to do on a letter
// to harvest it during the mining game.
const maxHP = 3

// aiguebenames are attributed in sequence : the first client to load
// will always be "Michèle Planche", and the second "Julien Montfalcon".
// so if we always open the website on each computers in the same order, player on the 
// left (as seen from the audience) will always be Michèle, and on the right Julien.
// (left = jardin).
const firstClientSeated = "left"

// this defines the direction of text
let chronologicalReading = false
// false = antécrhonologique
// true = chronologique

Template.reader.onCreated(function(){
	// this makes the instance accessible globally.
	// (because i'm not going to use helpers to display
	// text this time.)
	instance = Template.instance()
	// i guess it would be better to pull this number
	// from DB to avoid fatal disconnections
	instance.data.obj._atIndex = -1
	// this is where we're going to store all the 
	// qcm answers of players
	instance.data.obj.answered = []
})

Template.reader.events({

	"click .letter"(e){
		const partOfWord = e.currentTarget.parentNode.textContent
		const letter = e.currentTarget.textContent
		const hp = e.currentTarget.dataset.hp || null

		if (hp==null){
			e.currentTarget.dataset.hp = maxHP -1
		}else{
			e.currentTarget.dataset.hp = hp -1
			if (hp==0) {
				killLetter(e.currentTarget.id, true)
				return
			}
		}
	},

	"click .qcmResponseClickable"(e){
		// when someone clicks on a qcm answer, we need to get
		// the answer from the qcmResponses array (see client Actions).
		var regex = /\d/;
		// this regex is to get index of answer, which is contained
		// in e.currentTarget.textContent ("1. réponse numéro une")
		var index = regex.exec(e.currentTarget.textContent)[0] -1

		// here we are saving the answer locally
		instance.data.obj.answered[instance.data.obj.answered.length-1]=index+1

		var allAnswers = document.getElementsByClassName("qcmResponse")

		for (var i = allAnswers.length - 1; i >= 0; i--) {
			// hide all answers but the one that's just been chosen
			if (i!==index) {
				allAnswers[i].style.opacity = 0
			}
		}

		for (var i = allAnswers.length - 1; i >= 0; i--) {
			// also make these answers unclickable
			allAnswers[i].classList.remove("qcmResponseClickable")
		}

		Meteor.setTimeout(function(){
			// we're loading the answer which loadText which takes raw text
			// after two undefined args.
			loadText(undefined, undefined, qcmResponses[index])
			// also unstop the spacebar.
			this.instance.data.stopped=false
			// also run the client action defined in the qcmActions array
			console.log("client action ", qcmActions[index])
			// here we need to conform to the data structure of 
			// clientActions which is expecting an array of objects
			_params = []
			_params.push(qcmActions[index])
			clientActions(_params)
		},500)

	}


})

clientNext = function(){
	// we need to check if admin has control first
	let _spacebarctrl = instance.data.obj.globals.collection.find({env:environment}).fetch()[0].spacebar.control
	// if he has control, just return and don't do anything else.
	if (_spacebarctrl == "admin") {
		console.log("admin owns the spacebar, not moving.")
		return
	}

	// if the player has triggered a stop action, he should remain where he is.
	if (this.instance.data.stopped){
		console.log("currently in parking, not moving")
		return
	}

	// get local index from instance data.
	let _atIndex = instance.data.obj._atIndex
	let _Story = instance.data.obj.story.collection.find({env:environment}).fetch()[0].data

	if (_atIndex < _Story.length){
		// client is responsible for updating index
		instance.data.obj._atIndex = _atIndex +1
		// load text
		loadText(_Story, instance.data.obj._atIndex)
		// method call to update players db
		Meteor.call("spacebarPlayer", environment, instance.aiguebename, instance.data.obj._atIndex)
	}else{
		console.log("No more text!")
		return
	}

}
 
adminNext = function(_adminAtIndex) {
	// update instance_atIndex from function argument
	// admin is responsible for updating everybody's index
	instance.data.obj._atIndex = _adminAtIndex
	let _Story = instance.data.obj.story.collection.find({env:environment}).fetch()[0].data

	if (this.instance.data.stopped==true) {
		this.instance.data.stopped=false
	}

	if (_adminAtIndex < _Story.length){
		loadText(_Story, _adminAtIndex)
	}else{
		console.log("No more text!")
		return
	}
};

loadText = function(_Story, index, rawText){
	// sometimes we want to use loadText to print additional
	// text rather than what's in the db (Story),
	// for instance status messages or score messages.
	if (rawText) {
		if(chronologicalReading){
		    $('#textColumn').append($('<ul/>').html(rawText))
		}else{
		    $('#textColumn').prepend($('<ul/>').html(rawText))
		}
		return
	}

	// append text to body
	if(chronologicalReading){
	    $('#textColumn').append($('<ul/>').html(_Story[index].line))
	}else{
	    $('#textColumn').prepend($('<ul/>').html(_Story[index].line))
	}
	// execute actions if there are any
	clientActions(_Story[index].params)

    /* @todo Add a statement to replace "***" by empty <ul/>
		@body as was the case in the former codebase.
    */

	scrollText()
}

loadQcm = function(rawText){
    $('#textColumn').append($('<ul class="qcmResponse qcmResponseClickable"/>').html(rawText))
	scrollText()
	endOfArray = document.getElementsByClassName("qcmResponse").length -1
	document.getElementsByClassName("qcmResponse")[endOfArray].style.opacity=1
}

clientActions = function(_params){

	for (var i = 0; i < _params.length; i++) {
	// first get the optional argument of the param.
		_arg = Object.values(_params[i])[0]
		_key = Object.keys(_params[i])[0]

		// then decide what to do according to the action name.
		// actions are sorted by chronological appearance during the show.
		switch (_key){
			case "#bookmark" :
			break;

			case "#mining" :
			startMining()
			break;

			case "#stop" :
				console.log("going into parking.")
				this.instance.data.stopped = true
			break;

			case "#logtime" :
				console.log("logging time for ", _arg)
				// we are only using one method, which first saves the
				// start time of the race, then the finish time.
				Meteor.call("playerLogTime", environment, instance.aiguebename, _arg)
			break;

			case "#race1results" :
				// _arg is either left or right. The player seated left
				// should be Michèle Planche, and on the right Julien Montfalcon.
				// see lines 13-18 of reader.js for further information.
				console.log("results of race1 personne de ", _arg)

				if (firstClientSeated=="left") {
					_who = _arg=="left" ? "Michèle Planche" : "Julien Montfalcon"
				}else{
					_who = _arg=="left" ? "Julien Montfalcon" : "Michèle Planche"
				}

				// get score from method with callback.
				Meteor.call("calculateRaceDuration", environment, "race1", _who, 
					(error, result) =>{
						loadText(undefined, undefined, 
							`La personne de ${_arg} a mis ${result.diffTimeS} 
							secondes et ${result.diffTimeD} dixièmes à parcourir 
							le texte.`)
					})
			break;

			case "#serverstrobe":
				// players.methods
				Meteor.call("showServerCall", environment)
			break;

			case "#stepper":
				if (_arg=="stop") {
					// players.methods
					Meteor.call("stepperStopCall", environment)
					// we want to stop the stepper in order to save memory
					instance.data.obj.spaceBarStatus = "reader"
					// and make the spacebar go to the default mode, in which
					// it's used to get new lines of text.	
				}else{
					// or else we want to start the stepper and make
					// the spacebar change behaviour
					Meteor.call("stepperStartCall", environment)
					instance.data.obj.spaceBarStatus = "racer"					
					document.getElementsByClassName("racerContainer")[0].style.opacity=1
					document.getElementsByClassName("readerContainer")[0].style.opacity=0
				}
			break;

			case "#qcm":
				// we need an empty array to store the text which is going to
				// appear when someone answers to a question
				qcmResponses = []
				// we also need an object to store the "client actions" which
				// going to be launched on qcm response.
				qcmActions = []
				// what's more, we need to store the player's answers somewhere
				instance.data.obj.answered.push("")

				// we also want to stop the spacebar until question is answered.
				console.log("going into parking.")
				this.instance.data.stopped = true
			break;

			case "#rep":
				// load text as response nr 1
				loadQcm(_arg)
			break;
			
			case "#res":
				// load response in response array
				qcmResponses.push(_arg)
			break;

			case "#act":
				// load action in actions array
				regex = /(^\S+)\s(\S+$)/
				// group 1 = <#logtime> (client actions key)
				// group 2 = <race3> (client actions _arg)
				_result = regex.exec(_arg)
				_obj = {}
				_obj[_result[1]]=_result[2]
				qcmActions.push(_obj)
			break;

			case "#race3results" :
				// get score from method with callback.

				switch(_arg){

					case "get":
						Meteor.call("calculateRaceDuration", environment, "race3", instance.aiguebename, 
							(error, result) =>{
								instance.data.obj.race3 = {
									"mediane":result.mediane,
									"decile1":result.decile1,
									"decile9":result.decile9,
									"scoreSecs":result.diffTimeS,
									"scoreDecs":result.diffTimeD,
									"scoreRaw":result.diffTime
								}
						})
					break;

					case "1":
						let timeSecs = Math.floor((instance.data.obj.race3.mediane)/1000)
						let timeDecs = Math.floor(((instance.data.obj.race3.mediane)%1000)/ 10)

						loadText(undefined, undefined, 							 
`L'indice d'hésitation médian dans la salle est de ${timeSecs} secondes et 
${timeDecs} dixièmes (l'indice médian est la valeur qui sépare notre groupe 
exactement en deux : la moitié des personnes présentes ici ont moins hésité que 
${timeSecs} secondes et ${timeDecs} dixièmes, alors que l'autre moitié à plus 
hésité que ${timeSecs} secondes et ${timeDecs} dixièmes.)`)
					break;

					case "2":
						let Dec1Secs = Math.floor((instance.data.obj.race3.decile1)/1000)
						let Dec1Decs = Math.floor(((instance.data.obj.race3.decile1)%1000)/ 10)
						let not1 = ""
						let not2 = ""

						if (instance.data.obj.race3.scoreRaw <= instance.data.obj.race3.decile1) {
							not1 = "ne"
							not2 = "pas"
						}

						loadText(undefined, undefined, 
`Le premier décile, c'est à dire les 10% de personnes ayant le moins hésité, 
comprend toutes les personnes qui ont hésité exactement ${Dec1Secs} 
secondes et ${Dec1Decs} dixièmes ou moins. Vous ${not1} faites ${not2} partie 
du premier décile.`
						)
					break;

					case "3":
						let Dec9Secs = Math.floor((instance.data.obj.race3.decile9)/1000)
						let Dec9Decs = Math.floor(((instance.data.obj.race3.decile9)%1000)/ 10)
						let not3 = ""
						let not4 = ""

						if (instance.data.obj.race3.scoreRaw >= instance.data.obj.race3.decile9) {
							not3 = "ne"
							not4 = "pas"
						}

						loadText(undefined, undefined, 
`Le dernier décile, c'est à dire les 10% de personnes ayant le plus hésité, 
comprend toutes les personnes qui ont hésité exactement ${Dec9Secs} secondes 
et ${Dec9Decs} dixièmes ou plus. Vous ${not3} faites ${not4} partie du 
dernier décile.`
						)

					break;

					case "4":
					let scoreSec = instance.data.obj.race3.scoreSecs
					let scoreDec = instance.data.obj.race3.scoreDecs

						loadText(undefined, undefined, 
`Une durée de ${scoreSec} secondes et ${scoreDec} dixièmes s'est écoulée 
entre l'instant où la question s'est affichée sur votre écran et le 
moment où vous y avez répondu.`
						)
					break;
				}
			break;

			case "#stayWithTeam":
				previousAnswer = instance.data.obj.answered[0]
				if (previousAnswer==1) {
					instance.data.obj.team="teamSieste"
					loadText(undefined, undefined, 
"De la Team sieste."
					)

				}else{
					instance.data.obj.team="spacebarAthletes"
					loadText(undefined, undefined, 
"Des Spacebar athletes."
					)
				}
			break;

			case "#changeTeam":
				previousAnswer = instance.data.obj.answered[0]
				if (previousAnswer==2) {
					instance.data.obj.team="teamSieste"
					loadText(undefined, undefined, 
"De la Team sieste."
					)
				}else{
					instance.data.obj.team="spacebarAthletes"
					loadText(undefined, undefined, 
"Des Spacebar athletes."
					)
				}
			break;

			case "#showAlternateMessage":
				previousAnswer = instance.data.obj.answered[0]
				if (previousAnswer==2) {
					instance.data.obj.team="spacebarAthletes"
					loadText(undefined, undefined, 
"Bien que vous soyez content.e de constater la capacité de vos membres inférieurs à s'agiter de manière séquencée, vous vous êtes aussi rappelé.e pourquoi vous n'aimiez pas du tout ça : ça n'est même pas tant que vous ne pouvez pas courir vite, vous n'aimez simplement pas le *rituel* de la course à pied, ce qu'il peut avoir de criard et d'individualiste. Vous êtes fièr.e de faire partie de la team sieste."
					)
				}else{
					instance.data.obj.team="teamSieste"
					loadText(undefined, undefined, 
"Vous êtes chez vous dans votre corps. Chez vous, mais pas dans le cadre d'un bail locatif : plutôt en vertu d'un titre de propriété. La puissance fibreuse de vos cuisses, vos muscles tendus et dociles, votre respiration parfaitement rythmée, machinique : cela vous appartient. Vous n'avez même pas besoin de regarder autour de vous pour le savoir, vous en avez le coeur net : vous êtes parmi les plus rapides, vous êtes un spacebar athelete."
					)						
				}
			break;

			case "#showTeam":
				if (instance.data.obj.team=="teamSieste") {
					document.body.style.backgroundColor = "#1cff00"
				}else{
					document.body.style.backgroundColor = "red"
				}
			break;

			default:
				console.log(_key, "maybe missing a # before keyword?")
			break;
		}
	}
}

scrollText = function(){
	if (chronologicalReading) {
		$('#textColumn').scrollTop($('#textColumn')[0].scrollHeight);
	}else{
		$('#textColumn').scrollTop($('#textColumn')[0])	
	}
}


startMining = function(){
	// startmining is called at the beggining of the word mining minigame
	// locally (via a clientaction). This function parses HTML to subsitute
	// spans of text with spans containing both "intert" text and words which
	// players can click on. These words are spans of spans of letters,
	// which have different CSS rules and onclick events associated.

	// first get list of words we're going to convert to clickable words
	// from the DB. !!! NOTE = WORDS ARE CASE SENSITIVE !!! so if we want
	// to mine "Bonjour", we need a full caps B.

	const _wordsCollection = this.instance.data.obj.words.collection.find({env:environment}).fetch()[0].data
	let _words = []

	for (var i = _wordsCollection.length - 1; i >= 0; i--) {
		// we musn't look for words that have been collected already.
		// players ariving late musn't see them as clickable.
		if (_wordsCollection[i].name == undefined || _wordsCollection[i].name.length == _wordsCollection[i].harvestedLetters.length ) {
			console.log("this word ", _wordsCollection[i], " was already collected, or it's an empty word caused by trailing lines in the editor")
		}else{
			_words.push(_wordsCollection[i].name)
		}
	}

	console.log("words", _words)

	// we need all the lines from the HTML so we can look for specific
	// words to transform their markup
	_lines = document.getElementsByClassName("readerColumn")[0].children

	for (var i = _lines.length - 1; i >= 0; i--) {
		// we need an array of words rather than a string
		// to use functions like indexOf
		let theLine = _lines[i].innerHTML.split(/([^A-zÀ-ÿ])/g)

		for (var z = _words.length - 1; z >= 0; z--) {
			// for every word still present in the list of words we want
			// to make cickable,
			// check if it's present in the current line of text.
			let theWord = _words[z]
			let isMatch = theLine.indexOf(_words[z])

			if (isMatch!=-1) {
			// if it's the case, replace relevant HTML
				console.log("got a match line ", i, " with word ", theWord)
				theSpanOfSpans = ""
				for (var g = 0; g < theWord.length; g++) {
					// id is <word>.<letter>.<index>
					// for example, for the second "l" in "Elle"
					// Elle.l.2

					// we also need to check if every particular letter was
					// already harvested by someone.

					harvest = _wordsCollection.find(str => str.name === theWord).harvestedLetters
					thatLetterIsHarvested = harvest.indexOf(theWord[g])

					console.log("harvest ", harvest)
					console.log("thatLetterIsHarvested ", theWord[g] , thatLetterIsHarvested)

					if (thatLetterIsHarvested !=-1) {
						console.log("this letter was already harvested")
						markupBefore = "<span class='collectedLetter' id='"+theWord+"."+theWord[g]+"."+g+"'>"
						markupAfter = "</span>"
						theSpanOfSpans = theSpanOfSpans.concat(markupBefore)
						theSpanOfSpans = theSpanOfSpans.concat(theWord[g])
						theSpanOfSpans = theSpanOfSpans.concat(markupAfter)
					}else{					
						markupBefore = "<span class='letter' id='"+theWord+"."+theWord[g]+"."+g+"'>"
						markupAfter = "</span>"
						theSpanOfSpans = theSpanOfSpans.concat(markupBefore)
						theSpanOfSpans = theSpanOfSpans.concat(theWord[g])
						theSpanOfSpans = theSpanOfSpans.concat(markupAfter)
					}
				}

				_lines[i].innerHTML = _lines[i].innerHTML.replace(theWord, "<span class='minable'>"+theSpanOfSpans+"</span>")
				console.log("modify the HTML of ",_lines[i])
				// and lastly, delete the word of the
				// array of words we still want to make clickable,
				// so that we only have one copy of every clickable
				// word.
				_words.splice(z, 1)
			}
		}
	}
}

killLetter = function(letterId, local, lastLetter){

	local = local || false
	lastLetter = lastLetter || false

	_params = letterId.match(/([A-zÀ-ÿ]+)\W([A-zÀ-ÿ])/)
	_word = _params[1]
	_letter = _params[2]

	document.getElementById(letterId).classList.remove("letter")
	document.getElementById(letterId).classList.add("collectedLetter")

	if (lastLetter) {
		console.log("HARVESTING WORD")
		for (var i = document.getElementById(letterId).parentNode.children.length - 1; i >= 0; i--) {
			document.getElementById(letterId).parentNode.children[i].classList.remove("collectedLetter")
		}
		document.getElementById(letterId).parentNode.classList.remove("minable")
		document.getElementById(letterId).parentNode.classList.add("collectedWord")
	}

	if (local==true) {
		// if letter is being killed locally, tell the server
		// to warn the others!
		Meteor.call("letterHarvestCall", environment, letterId, _word, _letter, instance.aiguebename)
	}

}

stopMining = function(){
	// when we want to terminate the mining game, all we want
	// to do is remove classes to spans.
	allMinables = document.getElementsByClassName("minable")
	allLetters = document.getElementsByClassName("letter")

	for (var i = allMinables.length - 1; i >= 0; i--) {
		allMinables[i].classList.remove("minable")
	}

	for (var i = allLetters.length - 1; i >= 0; i--) {
		allLetters[i].classList.remove("letter")
	}
}