# Le tiret du six

this repository contains the meteor.js web application used in Samuel Hackwill's show "le tiret du six", a performance for an audience of 30 players and their laptops.

3 types of users are going to access the webapp :

## Admins

administrators of the show should access the webapp through one of :

    <local ip of computer hosting the app>:3000/admin/Dev/
    <local ip of computer hosting the app>:3000/admin/Prod/
    <local ip of computer hosting the app>:3000/editor/Dev/
    <local ip of computer hosting the app>:3000/editor/Prod/

/Dev/ and /Prod/ defines which environment is going to be affected by the administrator's actions.

### /admin
the **/admin** route is used during the show to monitor the audience's activities and interact with them.

On this page, admins can :
- monitor which line of text is being read by each invididual client in real time, by looking at the *tracker* component (on the left of the screen), which displays pipes (|) in front of each line of text. Two pipes (|) are coloured orange and violet. These represent the current position of the two first players to connect to the webapp. They are singled out because we need to make sure they both exist before starting the first race (at the beggining of the show).

- read the text of the show by looking at the *editor* component.

- click on the *bookmarksLibrary* component, which will take all the players to the index of that particular bookmark (check the editor section below for more details)

- click on the "admin"/"client" button of the *spacebarControl* component, which will either activate or deactivate the players' spacebar, which is used to fetch new lines of text during the show.
- press the spacebar, which will read the local index of the admin (instance.data.adminAtIndex), increment it by one, and broadcast it to every player. This will only work if the *spacebarControl* component is set to "admin".

- click on the "reboot!" button of the *rebootControl* component, which will remove all players of the current environment and reinitialize that database.

### /editor
the **/editor** route is used before the show, to review and modify the text which will be displayed on the players' screens and what local events will be triggered on each computer.

On this page, admins can :
- review the text of the show by looking at the *editor* component.

- double-click on the text to make modifications. Moving the cursor away from the text will erase the current Story mongodb collection (in the current environment only), parse the text and insert it in the collection. 

- The text should look something like this :

```
    salut 
    // toï toï

    c'est samuel qui parle
        #bookmark yea
        #stop

    je pense que c'est cool
        #logtime race1 
    qu'on soit là aujourd'hui

    à manger des fèves

    ***
        #logtime race1 
        #bookmark silence

    ***
        #race1results left

    ***
```

- every block of instructions should always start with a line of text (which will be displayed on the screens of the players), followed by optional statements like :
  - ```#bookmark``` ```<name of bookmark>``` *(bookmarks are used by the admins to make all the players jump to that line of text.)*
  - ```#stop``` *(a player can't go pass this line with his spacebar.)*
  - ```#logtime``` ```race1``` *(this is used **twice** during the first race, to log the starting & finishing times of the two players involved.)*
  - ```#race1results``` ```<left>``` or ```<right>``` *(this is used to print the results of the race. Left is supposed to show the score of the person seated on the "left", which should always be the player with instance.aiguebename="Michèle Planche". This name is always attributed to the first player to load the webapp.)* 
  - ```//``` ```<comment>``` *(a comment.)*
  - and in any case, a block of instructions must always be terminated by two carriage returns.

- click on the "collapse params"/"show params" button, which will show or hide the latter optional statements.

- click on the dustbin emoji, which will delete the whole collection.


## Testers

an admin or anyone wanting to test stuff should access the webapp trhough one of :

    <local ip of computer hosting the app>:3000/show/Dev/
    <local ip of computer hosting the app>:3000/show/Prod/

depending on the environment they are working on.


## Players

the members of the audience will access the webapp through :

    <local ip of computer hosting the app>:3000/

which renders in the "Prod" environment. (same as /show/Prod)

the two first players can :
- read the text
- press the spacebar to fetch new lines of text (only when it's permitted by the admins)
- read the results of the first (secret) race.

