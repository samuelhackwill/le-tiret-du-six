import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Mongo } from 'meteor/mongo';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Session } from 'meteor/session';

import './reader.html';
import './reader.css';

// number of words converted during the mining game
Session.get("toCollect", 0)

// this is the number of clicks someone has to do on a letter
// to harvest it during the mining game.
const maxHP = 100

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
  // we need to store what loot the players have
	// gained in order to modify the dice rolls they are
	// going to do at the end.
	instance.data.obj.modifiers = []
	// we need to know when someone has finished the
	// solo race so as not to display the end message
	// twice.
	instance.soloRaceFinished = false

	instance.data.obj.scores = []

	instance.achievements = []

	Session.set("currentRace", undefined)

})

Template.reader.onRendered(function(){
	Meteor.setTimeout(function(){
		// when ppl arrive on reader, go to start of show.
//
		params = []
		params.push({["#goto"]:["startofACTEI"]})
		clientActions(params)
	},5000)
})


Template.reader.events({

	"click .letter"(e){
		const partOfWord = e.currentTarget.parentNode.textContent
		const letter = e.currentTarget.textContent
		const hp = e.currentTarget.dataset.hp || null
		const coords = {}

		const hit = Math.floor(Math.random()*3)+1


		if (hp==null){
			e.currentTarget.dataset.hp = maxHP - hit
		}else{
			e.currentTarget.dataset.hp = hp - hit
			if (hp<=0) {
				killLetter(e.currentTarget.id, true)
				return
			}
		}

		letterBounce(e.currentTarget.id, hit)

		coords.y = e.clientY
		coords.x = e.clientX

		showRemainingHp(coords , hp || maxHP)
	},

	"click .clickableAnswer"(e){
		// the client actions that we must launch are written down
		// in the data-attributes of element.
		_action = e.target.dataset.onclickAction
		_args = e.target.dataset.onclickArg

		var parent = document.getElementById("answers")

		for (var i = parent.childElementCount - 1; i >= 0; i--) {
			parent.lastChild.remove()
		}

		Meteor.setTimeout(function(){
			// unstop the spacebar so that people can
			// carry on getting lines of text.
			this.instance.data.stopped=false
			// here we need to conform to the data structure of
			// clientActions which is expecting an array of objects
			params = []
			params.push({[_action]:[_args]})
			clientActions(params)
		},0)

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

clientActions = function(_params){

	for (var i = 0; i < _params.length; i++) {
	// first get the optional argument of the param.
		_arg = Object.values(_params[i])[0]
		_key = Object.keys(_params[i])[0]

		console.log("client actions : ",_key, _arg)

		// then decide what to do according to the action name.
		// actions are sorted by chronological appearance during the show.
		switch (_key){
			case "#getMean":
			calculateMean()
			break;

			case "#getScores":
			getAllScores(_arg)
			break;

			case "#light":
			shouldIFlash(_arg);
			break;

			case "#goto" :
			goto(_arg);
			break;

			case "#dice" :
			dice(_arg);
			break;

			case "#loot" :
			loot(_arg)
			break;

			case "#end" :
			end(_arg)
			break;

			case "#bookmark" :
			break;

			case "#mining" :
			startMining()
			break;

			case "#stop" :
				this.instance.data.stopped = true
			break;

			case "#logtime" :
				// we are only using one method, which first saves the
				// start time of the race, then the finish time.
				Session.set("currentRace", _arg)
				Meteor.call("playerLogTime", environment, instance.aiguebename, _arg)
			break;

			case "#race1results" :
				// get score from method with callback.
				Meteor.call("calculateRaceDuration", environment, "race1", instance.aiguebename,
					(error, result) =>{
						loadText(undefined, undefined,
							`Vous avez mis ${result.diffTimeS}
							secondes et ${result.diffTimeD} dixièmes à parcourir
							le texte.`)

						// replaceText(`Vous avez mis ${result.diffTimeS}
						// 	secondes et ${result.diffTimeD} dixièmes à parcourir
						// 	le texte.`)

					})
			break;

			case "#showAchievement" : 
			//countPeeps
				if (_arg == "wonlost1" || _arg == "wonlost2") {
					if (_arg == "wonlost1") {
						// THIS WILL ABSOLUTELY BREAK if we change the text at then end.
						oldResult = Number(document.getElementById("textColumn").children[3].innerText)
						result = instance.achievements.find(str=>str.name==="samuelRobotEnd")?.value
						hasTheyWon = result < oldResult || null
						console.log("has he won or lost? ", hasTheyWon)

						if (hasTheyWon == null) {
							loadText(undefined, undefined,"on sait pas parce qu'il y a eu un bug manifestement.")					
						}

						if (hasTheyWon) {
							loadText(undefined, undefined,"gagné!")					
						}else{
							loadText(undefined, undefined,"perdu")
						}
					}else{
						if (hasTheyWon == null) {
							loadText(undefined, undefined,"En théorie Samuel devrait nous raconter une anecdote.")					
						}

						if (hasTheyWon) {
							loadText(undefined, undefined,"félicitations! Néanmoins ne vous réjouissez pas trop vite, votre titre sera remis en jeu lors de la prochaine représentation.")					
						}else{
							loadText(undefined, undefined,"ceci dit il n'est pas impossible que vous gagniez contre le prochain public. Vous pouvez éventuellement vous coordonner pour revenir lors de la prochaine représentation afin de saboter l'entrée public si vous désirez augmenter vos chances.")
						}
					}
				}else{
					result = instance.achievements.find(str=>str.name===_arg)?.value || "<span class='blueTxt'>undefined</span> (absence de données)"
					loadText(undefined, undefined,result)					
				}
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
					Meteor.call("stepperStartCall", environment, _arg)
					document.getElementsByClassName("racerContainer")[0].style.opacity=1
					document.getElementsByClassName("readerContainer")[0].style.opacity=0

					setTimeout(function(){
						allRunners = document.getElementsByClassName("runner")
							for (var i = 0 ; i < allRunners.length-1 ; i++) {
								allRunners[i].style.left="0%"
							}
						},2000)
					}
			break;

			case "#startRace":
				instance.data.obj.spaceBarStatus = "racer"
			break;

			case "#answer":
			// this line is responsible for displaying the answers one at a time.
			// we should rename this clientAction "displayAnswer"
				this.instance.data.stopped = true
				loadAnswer(_arg)
			break;

			case "#act":
			// this is responsible for hydratation of answers. we should rename this
			// clientAction "writeAnswerTriggers" or something like that
				let regexp = /(^#\S+)\s(.+)/;
				_argArr = _arg.split(regexp)

				document.getElementById("answers").lastChild.lastChild.dataset.onclickAction = _argArr[1]
				document.getElementById("answers").lastChild.lastChild.dataset.onclickArg = _argArr[2]

				if (_argArr[1] == "#dice") {
					document.getElementById("answers").lastChild.lastChild.classList.add("diceRoll")
				}

			break;

			case "#askPseudo":
				this.instance.data.stopped = true;
				askPseudo();
			break;

			default:
				console.log(_key, "maybe missing a # before keyword?")
			break;
		}
	}
}

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

goto = function(_arg){
	// this function is used to jump to a bookmark during the
	// dicussion at the plage. It's somehow redundant with the
	// admin gotobookmark, should refactor at some point.

	// carefull, one should not use this function directly in
	// plainsam text, because if this clientaction is prompted
	// by a spacebar press, it will glitch one line of text.

	_Story = instance.data.obj.story.collection.find({env:environment}).fetch()[0].data

	for (var i = 0; i < _Story.length; i++) {
		_params = _Story[i].params || []
		for (var j = _params.length - 1; j >= 0; j--) {
			if (Object.keys(_params[j])[0] == "#bookmark" && Object.values(_params[j])[0] == _arg) {
				console.log("FOUND BOOKMARK, going to ", i)
				instance.data.obj._atIndex = i
				loadText(_Story, i)
			}
		}
	}
}

loot = function(_arg){
	// some line of text, when they are read, give a bonus for
	// dice rolls at the very end of the sequence. This function
	// is responsible for storing the loot in the client.

	// the score is stored in that format :
	// instance.data.obj.modifiers
	// > Array [ {…}, {…} ]
	// >	0: Object { name: "fin.business", modifier: 2 }
	// >	1: Object { name: "fin.police", modifier: 1 }

	// <#loot> <1> <fin.business> <vous vous êtes fait.e passer pour un.e hollandais.e>
	// 0 : empty string
	// 1 : modifier
	// 2 : ending for which the modifier will be applied
	// 3 : reminder of why this modifier is applied
	// 4 : another empty string ;)
	let regexp = /(\d)\s+([A-zÀ-ÿ\.]+)\s+(.+)/
	_argArray = _arg.split(regexp)

	console.log(_argArray)

	modifier = _argArray[1]
	ending = _argArray[2]
	reminder = _argArray[3]

	console.log(ending)

	const lootIsPresent = instance.data.obj.modifiers.find(str=>str.name===ending)


	if (lootIsPresent) {
		obj = instance.data.obj.modifiers.find(str=>str.name===ending)
		score = Number(obj.modifier) + 1
		obj.modifier = score
	}else{
		console.log("pushing ", ending, modifier)
		instance.data.obj.modifiers.push({name : [ending][0], modifier : Number([modifier][0])})
	}


}

end = function(_arg){
	let regexp = /(\d+)\s+([A-zÀ-ÿ\.]+)\s+([A-zÀ-ÿ\.]+)/
	let _argArr = _arg[0].split(regexp)

	let rollNeeded = Number(_argArr[1])
	let gotoSuccess = _argArr[2]
	let gotoFail = _argArr[3]

	__modifier = instance.data.obj.modifiers.find(str => str.name === gotoSuccess)

	if (__modifier) {
		_modifier = __modifier.modifier
	}else{
		_modifier = 0
	}

	dice(_arg, _modifier)
}

dice = function(_arg, _modifier){
	// when players click on a line of text with a "dice" action,
	// this means they are betting on a dice roll.
	// if they win their bet, they go to a particular section of
	// text, and if they loose, they go to another one.

	// first, we need to read the args to know what is the
	// aimed score, and to which section of text we are going
	// to go in case of sucess/failure.

	// this hellish regex should be able to capture text like this :
	// <10 debut debut.un>
	// <10> is the score needed to pass the thow
	// <"debut"> is the bookmark to go to in case of success
	// <"debut.un"> is the bookmark to go to in case of failure
	let regexp = /(\d+)\s+([A-zÀ-ÿ\.]+)\s+([A-zÀ-ÿ\.]+)/
	let _argArr = _arg[0].split(regexp)
	modifier = Number(_modifier) || 0

	let rollNeeded = Number(_argArr[1])
	let gotoSuccess = _argArr[2]
	let gotoFail = _argArr[3]

	// we need to add animated html dices
	let diceContainer = document.createElement("div")
	diceContainer.classList.add("diceContainer")

	let dice = document.createElement("div")
	dice.classList.add("dice")
	let diceFace = document.createElement("div")
	diceFace.id="diceFace1"
	diceFace.classList.add("dice-2")
	dice.appendChild(diceFace)

	let dice2 = document.createElement("div")
	dice2.classList.add("dice")
	let diceFace2 = document.createElement("div")
	diceFace2.id="diceFace2"
	diceFace2.classList.add("dice-2")
	dice2.appendChild(diceFace2)

	diceContainer.appendChild(dice)
	diceContainer.appendChild(dice2)

	const parent = document.getElementById("textColumn")

	parent.insertBefore(diceContainer, parent.firstChild)

	// we want to animate the dice to look like they are KIND OF
	// rolling. We are going to use a function called by a recursive
	// timeout with increasing timeInterval.
	let timeInterval = 10
	let counter = 0

	let fail = false
	let result = ""

	// we also want to stop spacebar presses during the dice roll.
	instance.data.stopped=true

	function rollTheDice(){

		randomVal1 = Math.floor(Math.random()*6)+1
		randomVal2 = Math.floor(Math.random()*6)+1

		document.getElementById("diceFace1").className = "dice-"+(randomVal1)
		document.getElementById("diceFace2").className = "dice-"+(randomVal2)

		diceRoll = randomVal1 + randomVal2 + modifier

		if (modifier == 0) {
			diceRollExplanation = "."
		}else{
			diceRollExplanation = ", ("+(diceRoll-modifier)+ " + bonus "+modifier+")"
		}

		roller = setTimeout(function(){
			if (counter>=20) {
				window.clearTimeout(roller)
				setTimeout(function(){

					if (diceRoll>=rollNeeded) {
						fail=false
						result = "(Réussite!)"
					}else{
						fail=true
						result = "(Échec.)"
					}


					message = `Résultat des dés : ${diceRoll}${diceRollExplanation}
					score minimum à faire : ${rollNeeded}
					${result}`

					loadText(undefined, undefined, message)
					setTimeout(function(){
						params = []
						if (fail) {
							params.push({["#goto"]:[gotoFail]})
						}else{
							params.push({["#goto"]:[gotoSuccess]})
						}
						clientActions(params)
						instance.data.stopped=false
					},1000)
				},400)
			}else{
				timeInterval += 5
				counter ++
				rollTheDice()
			}
		},timeInterval)
	}

	rollTheDice()
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

	scrollText()
}

replaceText = function(rawText){
	document.getElementById("textColumn").children[0].innerText = rawText
}

loadAnswer = function(rawText, action){
	let item = document.createElement("LI")
	let tag = document.createElement("A")
	tag.classList.add("answer")
	tag.classList.add("clickableAnswer")
	tag.innerHTML = rawText
	item.appendChild(tag)

	document.getElementById("answers").appendChild(item)

	scrollText()
	endOfArray = document.getElementsByClassName("answer").length -1
	document.getElementsByClassName("answer")[endOfArray].style.opacity=1

	adjustText({
		elements: document.querySelectorAll('.answersColumn'),
	});

}

scrollText = function(){
	if (chronologicalReading) {
		$('#textColumn').scrollTop($('#textColumn')[0].scrollHeight);
	}else{
		$('#textColumn').scrollTop($('#textColumn')[0])
	}
}

// check if element has more content than his own height, aka is it overflowing
const isOverflown = ({ clientHeight, scrollHeight }) => {
	return scrollHeight > clientHeight
}

// function to decrease font size if needed when the text overflows the element
const adjustText = ({ element, elements, minSize = 1, maxSize = 2.15, step = 0.01, unit = 'vw' }) => {
  // (elements || [element]).forEach(el => {
  //   let i = maxSize

		// let overflow = isOverflown(el);

		// if(!overflow) el.style.fontSize = '';

		// while (overflow && i > minSize) {
  //       el.style.fontSize = `${i}${unit}`
  //       overflow = isOverflown(el)

  //     if (overflow) i -= step
		// 	i = parseFloat(i).toFixed(2)
  //   }

  //   // revert to last state where overflow happened
  //   // el.style.fontSize = `${i - step}${unit}`
  // })
  console.log("breaks old computers !!! neads polyfill")
}

startMining = function(){
	// startmining is called at the beggining of the word mining minigame
	// locally (via a clientaction). This function parses HTML to subsitute
	// spans of text with spans containing both "inert" text and words which
	// players can click on. These words are spans of spans of letters,
	// which have different CSS rules and onclick events associated.

	// first get list of words we're going to convert to clickable words
	// from the DB. !!! NOTE = WORDS ARE CASE SENSITIVE !!! so if we want
	// to mine "Bonjour", we need a full caps B.

	const _wordsCollection = this.instance.data.obj.words.collection.find({env:environment}).fetch()[0].data
	let _words = []
	let _toCollect = 0

	for (var i = _wordsCollection.length - 1; i >= 0; i--) {
		// we musn't look for words that have been collected already.
		// players arriving late musn't see them as clickable.
		if (_wordsCollection[i].name == undefined || _wordsCollection[i].name.length == _wordsCollection[i].harvestedLetters.length ) {
			console.log("this word ", _wordsCollection[i], " was already collected, or it's an empty word caused by trailing lines in the editor")
		}else{
			_words.push(_wordsCollection[i].name)
		}
	}

	console.log("words", _words)

	// display wordsBank toggle button
	$('.toggleWordsBank').removeClass('is-hidden');

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

			// also increment the number of collectable words present 
			_toCollect = _toCollect + 1
			}
		}
	}

	// this is the local number of minable words displayed on one's screen.
	Session.set("toCollect", _toCollect)
}

killLetter = function(letterId, local, lastLetter, killer){

	local = local || false
	lastLetter = lastLetter || false
	killer = killer || undefined

	_params = letterId.match(/([A-zÀ-ÿ]+)\W([A-zÀ-ÿ])/)
	_word = _params[1]
	_letter = _params[2]

	document.getElementById(letterId)?.classList.remove("letter")
	document.getElementById(letterId)?.classList.add("collectedLetter")

	console.log("killer?", killer)


	if (lastLetter) {
		console.log("HARVESTING WORD")
		for (var i = document.getElementById(letterId)?.parentNode.children.length - 1; i >= 0; i--) {
			document.getElementById(letterId)?.parentNode.children[i].classList.remove("collectedLetter")
		}
		document.getElementById(letterId)?.parentNode.classList.remove("minable")
		document.getElementById(letterId)?.parentNode.classList.add("collectedWord")

		if (killer==instance.aiguebename) {
		// lastLetter & local are never true at the same time, because
		// lastLetter calls are always made from the server after a harvest
		// letter was called locally... so these variables are probably
		// misnamed and should be refactored.
			console.log("animating word")
			// clone of word being collected for animation
			// get current coordinates of collected word
			const wordCoordinates = document.getElementById(letterId).parentNode.getBoundingClientRect();
			// create clone
			var wordClone = $(document.getElementById(letterId).parentNode).clone();
			// add class for animation in css and set same coordinates (clone will be on top of collected word )
			wordClone.addClass('collectedWordClone').css({
			  'left': wordCoordinates.x,
			  'top': wordCoordinates.y,
			});
			// add event on animation end to remove the clone
			wordClone.one("animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd", function(){
			  // console.log('collected clone animation ended, this?', this);
			  this.remove();
			});
			// append clone to document
			wordClone.appendTo('body');			
		}
		
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

// shouldIFlash = function(_arg){
// 	// we need to show the faces of members of the audience by lighting
// 	// their faces with the computer screens.
// 	myScore = instance.data.obj.scores.race2.find(str=>str.aiguebename===instance.aiguebename).score
// 	imaSpacebarAthlete = myScore < race2Mean

// 	switch(_arg){
// 		case  "1" || 1 :
// 		// light both pools
// 		// just check mean and my score. If i'm under, flash red.
// 		// if i'm over, flash lime.
// 		if (imaSpacebarAthlete) {
// 			flashLight("red")
// 		}else{
// 			flashLight("lime")
// 		}

// 		break;
// 		case  "2" || 2 :
// 		// light one pool : sa
// 		// just check mean and my score. If i'm under, flash red.
// 		if (imaSpacebarAthlete) {
// 			flashLight("red")
// 		}else{
// 			flashLight("black")
// 		}
// 		break;
// 		case  "3" || 3 :
// 		// light one pool : ts
// 		// just check mean and my score. If i'm over, flash lime.
// 		if (imaSpacebarAthlete) {
// 			flashLight("black")
// 		}else{
// 			flashLight("lime")
// 		}

// 		break;
// 		case  "4" || 4 :
// 		// light the winner of sa
// 		// check my score of pool race 3, am i the best?

// 		if (!imaSpacebarAthlete) {
// 			flashLight("black")
// 			return
// 		}

// 		topScore = instance.data.obj.scores.race3[0].score
// 		myScore = instance.data.obj.scores.race3.find(str=>str.aiguebename===instance.aiguebename).score

// 		if (imaSpacebarAthlete && myScore == topScore) {
// 			flashLight("red")
// 		}

// 		break;
// 		case  "5" || 5 :
// 		// light the 2nd of sa
// 		// check my score of pool race 3, am i second best?

// 		if (instance.data.obj.scores.race3[1]!=undefined) {
// 			const second = instance.data.obj.scores.race3[1].score

// 			if (imaSpacebarAthlete && myScore == second) {
// 				flashLight("red")
// 			}else{
// 				flashLight("black")
// 			}
// 		}else{
// 			console.log("There is only one spacebar athlete! or zero even.")
// 		}

// 		break;
// 		case  "6" || 6 :
// 		// light the 3rd of sa
// 		// check my score of pool race 3, am i third best?

// 		if (instance.data.obj.scores.race3[1]!=undefined) {
// 			const third = instance.data.obj.scores.race3[2]?.score
// 			if (imaSpacebarAthlete && myScore == third) {
// 				flashLight("red")
// 			}else{
// 				flashLight("black")
// 			}
// 		}else{
// 			console.log("There is only one spacebar athlete! or zero even.")
// 		}

// 		break;
// 		case "7" || 7 :
// 		// light the last of ts
// 		// check my score of pool race 4, am i the last one?
// 		const lowScore = instance.data.obj.scores.race4[(instance.data.obj.scoresrace4.length)-1].score
// 		myScore = instance.data.obj.scores.race4.find(str=>str.aiguebename===instance.aiguebename).score

// 		if (!imaSpacebarAthlete && myScore == lowScore) {
// 			flashLight("lime")
// 		}else{
// 			flashLight("black")
// 		}

// 		break;
// 		case "8" || 8 :
// 		// light the 1st of ts
// 		// check my score of pool race 4, am i the best?
// 		const topScoreTS = instance.data.obj.scores.race4[0].score

// 		if (!imaSpacebarAthlete && myScore == topScoreTS) {
// 			flashLight("lime")
// 		}else{
// 			flashLight("black")
// 		}

// 		break;
// 		case  "9" || 9 :
// 		// light the reste of the ts!
// 		// am i part of the team sieste? If that's the case, check
// 		// my position in the array and either return (if i was first or last)
// 		// or launch
// 		if (instance.data.obj.scores.race4!=undefined) {
// 			factor = instance.data.obj.scores.race4.indexOf(myScore)

// 			if (!imaSpacebarAthlete && myScore != lowScore && myScore != topScoreTS) {
// 				setTimeout(function(){
// 					flashLight("red")
// 				},factor*3000)
// 			}
// 		}else{
// 			console.log("well, there's only one team sieste ppl!")
// 		}

// 		break;
// 	}
// }

flashLight = function(color){
	console.log("flashing the shit out of this")

	document.getElementsByClassName("faceTorch")[0].style.backgroundColor = color;
	document.getElementsByClassName("faceTorch")[0].style.opacity = "1";
	document.getElementsByClassName("faceTorch")[0].style.zIndex = "999999";

	setTimeout(function(){
		document.getElementsByClassName("faceTorch")[0].style.opacity = "0";
	},4500)

	setTimeout(function(){
		document.getElementsByClassName("faceTorch")[0].style.zIndex = "-9999";
	},6000)

}

calculateMean = function(){

	// we're going to need a mean for race 2, in order to assign
	// pool to players.
	race2Mean = 0;
	scores = 0

	allPlayers = instance.data.obj.players.collection.findOne({env:"Dev"}).players

	for (var i = allPlayers.length - 1; i >= 0; i--) {
		if (allPlayers[i]?.score?.race2?.finish != undefined && allPlayers[i]?.score?.race2?.start != undefined) {
			console.log("adding score of ", allPlayers[i])
			scores = scores + (allPlayers[i].score.race2.finish - allPlayers[i].score.race2.start)
		}
	}

	race2Mean = scores/(allPlayers.length)

	console.log("scores", scores, "allplayers length", allPlayers.length, "mean ", Number(race2Mean))

	function getFastest(x) { return (x.score.race2.finish-x.score.race2.start )< race2Mean }
	function getSlowest(x) { return (x.score.race2.finish-x.score.race2.start )>= race2Mean }
	onlyFastest = allPlayers.filter(function(x) { return getFastest(x) })
	onlySlowest = allPlayers.filter(function(x) { return getSlowest(x) })

	console.log("Mean is, ", race2Mean, "ms")
	console.log("players faster than mean are ", onlyFastest)
	console.log("players slower than mean are ", onlySlowest)


}

getAllScores = function(race){
	allPlayers = instance.data.obj.players.collection.findOne({env:"Dev"}).players

	_scores = []
		for (var i = allPlayers.length - 1; i >= 0; i--) {
		if (allPlayers[i]?.score?.[race]?.finish != undefined && allPlayers[i]?.score?.[race]?.start != undefined) {
			_name = allPlayers[i].aiguebename
			_score = (allPlayers[i].score.[race].finish - allPlayers[i].score.[race].start)
			_scores.push({aiguebename : _name, score :_score})
		}
	}

	instance.data.obj.scores.[race]=_scores
}

askPseudo = function(){

	$('#pseudo').removeClass('is-hidden');
	$('#pseudoForm').on('submit', function(e){
		e.preventDefault();
		e.stopPropagation();
		var newPseudo = $('#newPseudo').val();
		if(newPseudo != '') {
			instance.pseudo = $('#newPseudo').val();
			console.log('player pseudo is ', instance.pseudo);
			$('#pseudo').addClass('is-hidden');
			instance.data.stopped = false;
		}
	})

}

letterBounce = function(id, hit){

	// if (hit==3) {
	// 	showRemainingHp({x:250, y:250},"CRITICAL!")
	// }

	randomRot = (Math.floor(Math.random()*hit*3)+1) * (Math.round(Math.random()) * 2 - 1)
	scaleDown = 0.8


	document.getElementById(id).style.transform = 'rotate('+randomRot+'deg) scale('+scaleDown+')';

	setTimeout(function(){
		document.getElementById(id).style.transform = 'rotate(0deg) scale(1)';
	},150)

}

showRemainingHp = function(coords, hp){
	let hpCount = document.createElement("div")
	hpCount.classList.add("hpCount")
	hpCount.innerHTML = hp
	hpCount.style = "left : "+(coords.x)+"px;"+"top:"+(coords.y-20)+"px;"
	document.body.appendChild(hpCount)

	randomTransX = (Math.floor(Math.random()*200)+100)
	randomTransY = (Math.floor(Math.random()*200)+100)*-1

	setTimeout(function(){
		document.getElementsByClassName("hpCount")[document.getElementsByClassName("hpCount").length-1].style.transform = "translate("+randomTransX+"%,"+randomTransY+"%)"
	},50)

}
