# Le tiret du six

this repository contains the meteor.js web application used in Samuel Hackwill's show "le tiret du six", a performance for an audience of 30 players and their laptops.

## PUBLIC API

three type of users are going to access the webapp :

## Admins

administrators of the show should access the webapp through one of :

    <local ip of computer hosting the app>:3000/admin/Dev/
    <local ip of computer hosting the app>:3000/admin/Prod/
    <local ip of computer hosting the app>:3000/editor/Dev/
    <local ip of computer hosting the app>:3000/editor/Prod/

/Dev/ and /Prod/ defines which environment is going to be affected by the administrator's actions.

the **/admin** route is used during the show to monitor the audience's activities and interact with them.

On this page, admins can :
- monitor which line of text is being read by each invididual client in real time, by looking at the *tracker* component (on the left of the screen), which displays pipes (|) in front of each line of text. Two pipes (|) are coloured orange and violet. These represent the current position of the two first players to connect to the webapp. They are singled out because we need to make sure they both exist before starting the first race (at the beggining of the show).
- read the text of the show by looking at the *editor* component.
- click on the *bookmarksLibrary* component, which will take all the players to the index of that particular bookmark (check the editor section below for more details)
- 

the **/editor** route is used before the show to review and modify the text that is going to be displayed on player's screens and what local events will be triggered on each computer.

## Players

the members of the audience will access teh webapp through :

    <local ip of computer hosting the app>:3000/

## Testers

an admin or anyone wanting to test stuff should access the webapp trhough one of :

    <local ip of computer hosting the app>:3000/show/Dev/
    <local ip of computer hosting the app>:3000/show/Prod/

depending on the environment they are working on.

