import { Meteor } from 'meteor/meteor';
import { HighScore } from '../highScore.js'

Meteor.publish('highScore', function() {
    return HighScore.find({});
  });
  