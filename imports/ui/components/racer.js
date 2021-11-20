import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Mongo } from 'meteor/mongo';
import { FlowRouter } from 'meteor/kadira:flow-router';

import './racer.html';
import './racer.css';

cyclerCount = 1;

Template.racer.helpers({
	players(){
		if (!this.obj.players.collection.find({env:environment}).fetch().length) {
			// do nothing, array is empty
		}else{
			return this.obj.players.collection.find({env:environment}).fetch()[0].players
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
			// doesPlayerExist.style.transform="translateX("+value+"vw)"
			doesPlayerExist.style.left=value+"%";
        }
    })
};


imageCycler = function(who){

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
