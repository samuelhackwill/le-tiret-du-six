import { Meteor } from 'meteor/meteor';

import '/imports/api/story/server/publications.js'
import { Story } from '../../api/story/story.js';
import { destroyStory } from '../../api/story/methods.js'

import '/imports/api/globals/server/publications.js'
import { Globals } from '../../api/globals/globals.js';
import { spacebarInvert } from '../../api/globals/methods.js'

import '/imports/api/players/server/publications.js'
import { Players } from '../../api/players/players.js';
import { playerInsert } from '../../api/players/methods.js'
import { playerDestroy } from '../../api/players/methods.js'

import '/imports/api/streamer/server/publications.js'

// This defines a starting set of data to be loaded if the app is loaded with an empty db.
import './fixtures.js';