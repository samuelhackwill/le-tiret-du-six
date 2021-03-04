import { Meteor } from 'meteor/meteor';

import '/imports/api/story/server/publications.js'
import { StoryDev } from '../../api/story/story.js';
import { StoryProd } from '../../api/story/story.js';

import '/imports/api/globals/server/publications.js'
import { GlobalsDev } from '../../api/globals/globals.js';
import { GlobalsPred } from '../../api/globals/globals.js';

// i don't understand why i have to import that specific one
import { spacebarInvert } from '../../api/globals/methods.js'


// This defines a starting set of data to be loaded if the app is loaded with an empty db.
import './fixtures.js';
