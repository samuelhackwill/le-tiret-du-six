import { Meteor } from 'meteor/meteor';
import { StoryDev } from '../../api/story/story.js';
import { StoryProd } from '../../api/story/story.js';
import { insert } from '../../api/story/methods.js';
import '/imports/api/story/server/publications.js'

// This defines a starting set of data to be loaded if the app is loaded with an empty db.
import './fixtures.js';
