# Tenpura Boom
HKUST 2017-2018 Summer COMP4021<br/>
Assignment 2 - Dynamic SVG Game

## Demo
https://xyzjoey.github.io/tenpura-boom/
or
https://xyzjoey.github.io/tenpura-boom/index.html

## Local setup
1. intsall XAMPP from https://www.apachefriends.org/index.html
2. put source folder under xampp/htdocs/
3. open XAMPP control panel and press Start for Apache
4. open browser (Chrome) and go to http://localhost/ + {relative path from xampp/htdocs/ to game.html} (e.g. http://localhost/tenpura-boom/src/game.html)

## Description
A 2D action game

<table>
<tr>
<th>Starting screen</th>
</tr>
<tr>
<td align="center"><img src="screenshot\screenshot01.png" height="400"><br/>Press "Normal Mode" or "Zoom Mode" to enter the game.<br/>Normal mode: the whole scene is shown<br/>Zoom mode: the camera zooms in and focus on the player.</td>
</tr>
</table>

<table>
<tr>
<th colspan="6">Game objects</th>
</tr>
<tr>
<th colspan="2">Player</th>
<th colspan="2">Enemy</th>
<th colspan="2">Bird</th>
</tr>
<tr>
<td colspan="2" align="center" width="35%"><img src="screenshot\record01.gif" height=""><br/>move, jump, shoot</td>
<td colspan="2" align="center"><img src="screenshot\record02.gif"><br/>fly around, shoot randomly</td>
<td colspan="2" align="center"><img src="screenshot\record03.gif"><br/>to be collected by player</td>
</tr>
<tr>
<th colspan="3">Dissappearing platform</th>
<th colspan="3">Portal</th>
</tr>
<tr>
<td colspan="3" align="center" height="200"><img src="screenshot\record04.gif" height=""><br/>disappear as touched</td>
<td colspan="3" align="center" height="200"><img src="screenshot\record05.gif"><br/>transmit player to another portal</td>
</tr>
</table>

<table>
<tr>
<th>Scoring</th>
</tr>
<tr>
<td align="center"><img src="screenshot\screenshot02.png" height="400"><br/>scores stored in cookie after game over</td>
</tr>
</table>

## Note
Tested in Chrome and Firefox.<br/>
Firefox issues: Word spacing is ignore. Slow.

Audio source
- BGM is downloaded from YouTube Audio Library
- Other audio effects are recored from Kizuna AI and Kaguya Luna's Youtube videos.