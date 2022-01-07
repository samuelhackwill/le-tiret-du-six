# Le tiret du six

(current version ```1.0.0```)

this repository contains the meteor.js web application used in Samuel Hackwill's show "le tiret du six", a performance for an audience of 30 players and their laptops.

3 types of users are going to access the webapp :

## Admins

administrators of the show should access the webapp through one of :

    <local ip of computer hosting the app>:3000/admin
    <local ip of computer hosting the app>:3000/editor
    <local ip of computer hosting the app>:3000/showServ

and add either /Dev/ or /Prod/ at the end of the URL.
/Dev/ and /Prod/ defines which environment is going to be affected by the administrator's actions (if players are in the Prod environment and admin calls a showServer action on the Dev environment, nothing will happen for the audience).

### /admin
the **/admin** route is used during the show to monitor the audience's activities and interact with them.

On this page, admins can :
<!-- - monitor which line of text is being read by each invididual client in real time, by looking at the *tracker* component (on the left of the screen), which displays pipes (|) in front of each line of text. Two pipes (|) are coloured orange and violet. These represent the current position of the two first players to connect to the webapp. They are singled out because we need to make sure they both exist before starting the first race (at the beggining of the show).
 -->
- read the text of the show by looking at the *editor* component.

- press the spacebar, which will read the local index of the admin (instance.data.adminAtIndex), increment it by one, and broadcast it to every player. This will only work if the *spacebarControl* component is set to "admin".


in the **Bookmarks** component : 

- click on any button, which will take all the players to the index of that particular bookmark (check the editor section below for more details)

in the **Admin Calls** component :

- click on the "admin"/"client" button, which will either give the spacebar to the audience or take it back.

- click on the "Bot autorun" button, which will cause the bot to start running during the 1 vs bot race (first race).

- click on the "showServer" button, which will cause the showServ window to start flashing red (during the show server sequence)

- click on the "hideServer" button, which will interupt the flashing of the showServ window.

in the **Achievements** component : 

- click on a number in the PublicCount section, which will select a number and broadcast it to the players (it's used at the very end of the show when players read statistics about the show)

- click on the buttons in the Race section, which will also broadcast that score to players (buttons should be clicked in order from top to bottom or nothing will happen).

- in the jokes section, select oui/modéremment/à priori non according to the audience's reaction to the specific jokes.

in the **💀 Sudo 💀** component :

- click on the "Erase all players!" button of the *rebootControl* component, which will remove all players of the current environment and reinitialize that database.

- click on the "Stop the race, go to reader" button of the *rebootControl* component, which will remove all players of the current environment and reinitialize that database.

- click on the "Noir" button, which will make all the player's screens fade to black.

### /editor
the **/editor** route is used to review and modify the text which will be displayed on the players' screens and what local events will be triggered on each computer.

On this page, admins can :
- review the text of the show by looking at the *editor* component.

- double-click on the text to make modifications. Clicking outside of the textarea will erase the current Story mongodb collection (in the current environment only), parse the text and insert it in the collection. 

- The text should look something like this (for a more detailed example see :

```
    salut 
    // toï toï

    c'est samuel qui parle
        #bookmark yea
        #stop

    ***
```

- every block of instructions should always start with a line of text (which will be displayed on the screens of the players), followed by optional statements like :
  - ```#bookmark``` ```<name of bookmark>``` *(bookmarks are used by the admins to make all the players jump to that line of text. Bookmarks are also used )*
  - ```#stop``` *(a player can't go pass this line with his spacebar.)*
  - ```#logtime``` ```<name of race>``` *(this logs the local time on the server. When logtime is called the first time on a particular race, for instance race1 - the date is logged as the starting time. The second time it is called with the same argument, it logs the date as the ending time. So logtime should always be called twice for every race.)*
  - ```#race1results``` *(This prints the results of the first race - which must always be called "race1".)* 
  - ```#stepper``` ```<name of race>``` *(This takes everybody to the racetrack and launches or terminates a loop on the server side which uses the streamer to update the position of the  runners during races in the race track. The name of race must always be race2 for the solo race vs bot and race0 for the FFA.)*
  - ```#startRace``` *This actually launches the race (keystrokes won't have any effect before this button is clicked)*
  - ```#showAchievement``` ```<name of achievement>``` *(This is used to log scores, so text which is calculated on the fly as opposed to pulled from the Story collection.)*
  - ```#mining``` ```start``` *(This launches the mining session : from that point players can click on harvestable words to collect them, and also open the word cabinet on the left side)*
  - ```#answer``` ```<text to be displayed>``` *(This displays a clickable dialog option on the right side. **Must** always be followed by an #act tag, see below)* 
  - ```#act``` EITHER ```#goto``` ```<name of bookmark>``` OR ```#dice``` ```<minimum required to pass>``` ```<name of bookmark to goto in case of success>``` ```<name of bookmark to goto in case of failure>``` *(This tag must always follow an answer tag. It hydrates the span which was created by the #answer tag with an onclick event which either fires a goto or a dice function.)*
<!--   - ```#loot``` ```<bonus points awarded>``` ```<for which ending>``` ```<reason the points were awarded>``` *(This isn't implemented, it's used to add modifiers to specific dice rolls.)*
 --> 

  - ```//``` ```<comment>``` *(a comment.)*
  - and in any case, a block of instructions must always be terminated by two carriage returns.

- click on the "collapse params"/"show params" button, which will show or hide the latter optional statements.

- click on the dustbin emoji, which will delete the whole collection.

### /showServ
this window's sole purpose is to flash some light on the server to show where it's located in the room. It will flash either when the admin clicks on "show server" in his interface, or when any player presses "A" on her.his computer.

## Testers

an admin or anyone wanting to test stuff should access the webapp trhough one of :

    <local ip of computer hosting the app>:3000/show/Dev/
    <local ip of computer hosting the app>:3000/show/Prod/

depending on the environment they are working on.


## Players

the members of the audience will access the webapp through :

    <local ip of computer hosting the app>:3000/

which renders in the "Prod" environment by default. (same as /show/Prod)

players :
- read the text
- press the spacebar to fetch new lines of text (only when it's permitted by the admins)
- click on answers during the discussion with le gérant de la place
- race with the bot during the first race
- race with the other players during the FFA race