// The point and size class used in this program
function Point(x, y) {
    this.x = (x)? parseFloat(x) : 0.0;
    this.y = (y)? parseFloat(y) : 0.0;
}

function Size(w, h) {
    this.w = (w)? parseFloat(w) : 0.0;
    this.h = (h)? parseFloat(h) : 0.0;
}

// Helper function for checking intersection between two rectangles
function intersect(pos1, size1, pos2, size2) {
    return (pos1.x < pos2.x + size2.w && pos1.x + size1.w > pos2.x &&
            pos1.y < pos2.y + size2.h && pos1.y + size1.h > pos2.y);
}


// The player class used in this program
function Player() {
    this.node = svgdoc.getElementById("player");
    this.position = PLAYER_INIT_POS;
    this.motion = motionType.NONE;
    this.verticalSpeed = 0;

    // this.playername = "";
    this.direction = 1; //-1: left, 1: right
    this.imagenode = svgdoc.getElementById("playerimage");
}

Player.prototype.isOnPlatform = function() { //prototype ~ class func?
    var platforms = svgdoc.getElementById("platforms");
    for (var i = 0; i < platforms.childNodes.length; i++) {
        var node = platforms.childNodes.item(i);
        if (node.nodeName != "rect") continue;

        var x = parseFloat(node.getAttribute("x"));
        var y = parseFloat(node.getAttribute("y"));
        var w = parseFloat(node.getAttribute("width"));
        var h = parseFloat(node.getAttribute("height"));

        if (((this.position.x + PLAYER_SIZE.w > x && this.position.x < x + w) ||
             ((this.position.x + PLAYER_SIZE.w) == x && this.motion == motionType.RIGHT) ||
             (this.position.x == (x + w) && this.motion == motionType.LEFT)) &&
            this.position.y + PLAYER_SIZE.h == y) return true;
    }
    if (this.position.y + PLAYER_SIZE.h == SCREEN_SIZE.h) return true;

    return false;
}

Player.prototype.collidePlatform = function(position) {
    var platforms = svgdoc.getElementById("platforms");
    for (var i = 0; i < platforms.childNodes.length; i++) {
        var node = platforms.childNodes.item(i);
        if (node.nodeName != "rect") continue;

        var x = parseFloat(node.getAttribute("x"));
        var y = parseFloat(node.getAttribute("y"));
        var w = parseFloat(node.getAttribute("width"));
        var h = parseFloat(node.getAttribute("height"));
        var pos = new Point(x, y);
        var size = new Size(w, h);

        if (intersect(position, PLAYER_SIZE, pos, size)) {
            position.x = this.position.x;
            if (intersect(position, PLAYER_SIZE, pos, size)) {
                if (this.position.y >= y + h)
                    position.y = y + h;
                else
                    position.y = y - PLAYER_SIZE.h;
                this.verticalSpeed = 0;
            }
        }
    }
}

Player.prototype.collideScreen = function(position) {
    if (position.x < 0) position.x = 0;
    if (position.x + PLAYER_SIZE.w > SCREEN_SIZE.w) position.x = SCREEN_SIZE.w - PLAYER_SIZE.w;
    if (position.y < 0) {
        position.y = 0;
        this.verticalSpeed = 0;
    }
    if (position.y + PLAYER_SIZE.h > SCREEN_SIZE.h) {
        position.y = SCREEN_SIZE.h - PLAYER_SIZE.h;
        this.verticalSpeed = 0;
    }
}

function Monster(node, x, y) {
    this.node = node;
    this.position = new Point(x, y);
    this.targetPos = null;
    this.vector = null;
    this.direction = 1;
    this.special = false;
}

function disappearPlatform(node, point, size) {
    this.node = node;
    this.Point = point;
    this.Size = size;
    this.disappearInterval = null;
}

//
// Below are constants used in the game
//
var PLAYER_SIZE = new Size(40, 50);         // The size of the player //tochange
var SCREEN_SIZE = new Size(600, 560);       // The size of the game screen
var PLAYER_INIT_POS  = new Point(25, 420);   // The initial position of the player //tochange

var MOVE_DISPLACEMENT = 5;                  // The speed of the player in motion
var JUMP_SPEED = 15;                        // The speed of the player jumping
var VERTICAL_DISPLACEMENT = 1;              // The displacement of vertical speed

var GAME_INTERVAL = 25;                     // The time interval of running the game

var BULLET_SIZE = new Size(20, 15);         // The speed of a bullet //tochange
var BULLET_SPEED = 10.0;                    // The speed of a bullet
var INIT_BULLET_NUM = 8;
                                            //  = pixels it moves each game loop
var SHOOT_INTERVAL = 200.0;                 // The period when shooting is disabled
var canShoot = true;                        // A flag indicating whether the player can shoot a bullet

var MONSTER_SIZE = new Size(62, 34);        //tochange
var MONSTER_MAX_SPEED = 1;
var MONSTER_INTERVAL = 5000;

var MONSTER_BULLET_SIZE = new Size(38, 38);
var MONSTER_BULLET_SPEED = 2.0;
var monsterShooting = false;

var GOODTHING_SIZE = new Size(32, 42); //tochange
var INIT_GOODTHING_NUM = 8;

var INIT_TIME = 60000;
var TIMEBAR_WIDTH = 140;

var DISAPPEAR_PLATFORM_ATTRIBUTES = [ {x: 485, y: 378, w: 63.5, h: 14}, //tochange
                                      {x: 96, y: 322, w: 73, h: 14},
                                      {x: 405, y: 70, w: 67.5, h: 14} ];

var PORTAL_SIZE = new Size(20, 20); //tochange
var PORTAL_CENTER = [ new Point(300, 515), new Point(550, 265) ]; //tochange
var PORTAL_POINT = [ new Point(PORTAL_CENTER[0].x-PORTAL_SIZE.w/2, PORTAL_CENTER[0].y-PORTAL_SIZE.h/2), //tochange
                     new Point(PORTAL_CENTER[1].x-PORTAL_SIZE.w/2, PORTAL_CENTER[1].y-PORTAL_SIZE.h/2) ];
var PORTAL_EXIT_SIZE = new Size(50, 50);

var EXIT_POS = new Point(530, 46);
var EXIT_SIZE = new Size(50, 50);

//
// Variables in the game
//
var motionType = {NONE:0, LEFT:1, RIGHT:2}; // Motion enum

var svgdoc = null;                          // SVG root document node
var player = null;                          // The player object
var gameInterval = null;                    // The interval
var zoom = 1.0;                             // The zoom level of the screen
var score = 0;                              // The score of the game
var warping = false;
var exitwarp = -1; // -1: not leaving, 0: leaving 0th portal, 1: leaving 1st portal
var cheatmode = false;

var playername = "";
var monsters = null;
var monsterInterval = null;
var monsterShootInterval = null;
var bulletNum = INIT_BULLET_NUM;
var goodthingNum = INIT_GOODTHING_NUM;
var time = INIT_TIME;
var timeInterval = null;
var disappearPlatforms = null; // new Array(3)

var winConditionMsgFadeTimeout = null;

var soundBgm = null;
var soundWin = null;
var soundLose = null;
var soundShoot = null;
var soundMonster = null;

//
// The load function for the SVG document
//
function load(evt) {
    // var date = new Date(0);
    // console.log(date.toGMTString());
    
    // Set the root node to the global variable
    svgdoc = evt.target.ownerDocument;

    // Attach keyboard events
    svgdoc.documentElement.addEventListener("keydown", keydown, false);
    svgdoc.documentElement.addEventListener("keyup", keyup, false);

    // soundBgm = document.getElementById("sound_bgm");
    // soundWin = document.getElementById("sound_win");
    // soundLose = document.getElementById("sound_lose");
    // soundShoot = document.getElementById("sound_shoot");
    // soundMonster = document.getElementById("sound_monster");
    soundBgm = new Audio("bgm.mp3");
    soundWin = new Audio("win.mp3");
    soundLose = new Audio("lose.mp3");
    soundShoot = new Audio("shoot.mp3");
    soundMonster = new Audio("monster.mp3");
    soundBgm.loop = true;

    // Remove text nodes in the 'platforms' group
    cleanUpGroup("platforms", true);
}

// function nameupdate() {
//     // console.log("nameupdate()");
//     // console.log("before: " + playername);
//     // console.log($("#nameinput").text());
//     var input = svgdoc.getElementById("nameinput");
//     playername = (input.value == '')? "Anonymous" : input.value;
//     // console.log("after: " + playername);
// }

function gamestart(mode = null) {

    // cleanUpGroup("platforms", true);
    // player position, clean monsters, clean good things, clean high score table
    // var playername;
    // if (player != null) {
    //     playername = playername
    // }
    cleanUpGroup("bullets", false);
    cleanUpGroup("monsters", false);
    cleanUpGroup("monsterBullets", false);
    cleanUpGroup("highscoretext", false);
    cleanUpGroup("goodthings", false);
    if (disappearPlatforms != null)
        for (var i = 0; i < disappearPlatforms.length; ++i) {
            svgdoc.getElementById("platforms").removeChild(disappearPlatforms[i].node);
        }

    player = new Player();
    score = 0;
    monsterShooting = false;
    cheatmode = false;
    player.imagenode.style.opacity = 1;
    bulletNum = INIT_BULLET_NUM;
    goodthingNum = INIT_GOODTHING_NUM;
    time = INIT_TIME;
    svgdoc.getElementById("score").textContent = score;
    svgdoc.getElementById("bulletNum").textContent = bulletNum;
    svgdoc.getElementById("timebar").setAttribute("width", TIMEBAR_WIDTH * (time/INIT_TIME));
    svgdoc.getElementById("timetext").textContent = timeStr();

    playername = prompt("player name:", playername);
    if(playername == "" || playername == null)
        playername = "Anonymous";
    svgdoc.getElementById("playername").textContent = playername;

    createGameObjs();
    if (mode != null) zoom = (mode == 0)? 1.0 : 2.0;

    // console.log(svgdoc.getElementById("startscreen"));
    svgdoc.getElementById("gamearea").style.visibility = "visible";
    svgdoc.getElementById("startscreen").style.visibility = "hidden";
    svgdoc.getElementById("gameover").style.visibility = "hidden";
    svgdoc.getElementById("gameover").style.opacity = 0;//
    svgdoc.getElementById("highscoretable").style.visibility = "hidden";//

    // svgdoc.getElementById("platforms").style.visibility = "visible";
    // svgdoc.getElementById("player").style.visibility = "visible";
    // $("#startscreen").hide();
    gameInterval = setInterval("gamePlay()", GAME_INTERVAL);
    timeInterval = setInterval("updateTime()", GAME_INTERVAL);
    updateMonsters();
    monsterInterval = setInterval("updateMonsters()", MONSTER_INTERVAL);
    monsterShootInterval = setInterval("monsterShootBullet()", 3000);

    soundBgm.currentTime = 0;
    soundBgm.volume = 1;
    soundBgm.play();
}

//
// This function removes all/certain nodes under a group
//
function cleanUpGroup(id, textOnly) {
    // console.log("cleanUpGroup(" + id + ", " + textOnly + ")");//
    var node, next;
    var group = svgdoc.getElementById(id);
    node = group.firstChild;
    while (node != null) {
        next = node.nextSibling;
        if (!textOnly || node.nodeType == 3) {// A text node
            // console.log(node);
            group.removeChild(node);
        }
        node = next;
    }
}

function randomPosition(objectSize, condition) {

    var offset = 30;

    do {
        var x = Math.floor(Math.random() * ( SCREEN_SIZE.w-offset - objectSize.w + 1)) + offset/2;
        var y = Math.floor(Math.random() * ( SCREEN_SIZE.h-offset - objectSize.h + 1)) + offset/2;
    } while(!condition(x, y));

    return new Point(x, y);
}

function monsterMoveCondition(x, y) {
    return true;
}

function monsterPosCondition(x, y) {
    // console.log("monsterPosCondition(" + x + ", " + y + ")");//

    var dx = x - PLAYER_INIT_POS.x;
    var dy = y - PLAYER_INIT_POS.y;
    var d = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
    // console.log(d);
    
    return (d >= 200)? true : false;
}

function goodthingPosCondition(x, y) {

    var dx = x - PLAYER_INIT_POS.x;
    var dy = y - PLAYER_INIT_POS.y;
    var d = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));    
    if (d < 100) return false;

    var offset = new Size(20, 10);
    var intersectPos = new Point(x-offset.w/2, y-offset.h/2);
    var intersectSize = new Size(GOODTHING_SIZE.w + offset.w, GOODTHING_SIZE.h + offset.h);

    // if () return false;

    var platforms = svgdoc.getElementById("platforms");
    for (var i = 0; i < platforms.childNodes.length; i++) {
        var node = platforms.childNodes.item(i);
        if (node.nodeName != "rect") continue;

        var platform_x = parseFloat(node.getAttribute("x"));
        var platform_y = parseFloat(node.getAttribute("y"));
        var w = parseFloat(node.getAttribute("width"));
        var h = parseFloat(node.getAttribute("height"));
        var pos = new Point(platform_x, platform_y);
        var size = new Size(w, h);

        // var offset = new Size(20, 20);
        // var intersectSize = new Size(GOODTHING_SIZE.w + offset.w, GOODTHING_SIZE.h + offset.h);
        if (intersect(intersectPos, intersectSize, pos, size))
            return false;
    }

    var goodthings = svgdoc.getElementById("goodthings");
    for (var i = 0; i < goodthings.childNodes.length; ++i) {
        var goodthing = goodthings.childNodes.item(i);
        var gx = goodthing.getAttribute("x");
        var gy = goodthing.getAttribute("y");

        // var offset = 10;
        // var intersectSize = new Size(GOODTHING_SIZE.w + offset, GOODTHING_SIZE.h + offset);

        if (intersect(new Point(gx-offset.w/2, gy-offset.h/2), intersectSize, intersectPos, intersectSize))
            return false;
    }

    if (intersect(intersectPos, intersectSize, EXIT_POS, EXIT_SIZE))
        return false;
    for (var i = 0; i < PORTAL_CENTER.length; ++i) {
        var portalIntersectPos = new Point(PORTAL_CENTER[i].x - PORTAL_EXIT_SIZE.w/2, PORTAL_CENTER[i].y - PORTAL_EXIT_SIZE.h/2);
        // new Point(PORTAL_CENTER[0].x-PORTAL_SIZE.w/2, PORTAL_CENTER[0].y-PORTAL_SIZE.h/2)
        if (intersect(intersectPos, intersectSize, portalIntersectPos, PORTAL_EXIT_SIZE))
            return false;
    }


    return true;
}

function createGameObjs() {

    disappearPlatforms = new Array(DISAPPEAR_PLATFORM_ATTRIBUTES.length);
    for(var i = 0; i < disappearPlatforms.length; ++i) { //disappearPlatforms.length // tochange
        // console.log(i);
        var point = new Point(DISAPPEAR_PLATFORM_ATTRIBUTES[i].x, DISAPPEAR_PLATFORM_ATTRIBUTES[i].y - 1);
        var size = new Size(DISAPPEAR_PLATFORM_ATTRIBUTES[i].w, DISAPPEAR_PLATFORM_ATTRIBUTES[i].h + 1);

        var newPlatform = svgdoc.createElementNS("http://www.w3.org/2000/svg", "rect");
        newPlatform.setAttribute("x", point.x);
        newPlatform.setAttribute("y", point.y + 1);
        newPlatform.setAttribute("width", size.w);
        newPlatform.setAttribute("height", size.h - 1);
        newPlatform.setAttribute("type", "disappearing");
        newPlatform.style.setProperty("opacity", 1, null);
        newPlatform.style.setProperty("fill", "#82e8d2", null);
        // newPlatform.style.setProperty("stroke", "black", null);
        // newPlatform.style.setProperty("stroke-width", 10, null);

        svgdoc.getElementById("platforms").appendChild(newPlatform);
        // console.log(newPlatform);
        disappearPlatforms[i] = new disappearPlatform(newPlatform, point, size);
    }

    monsters = new Array(6);
    for(var i = 0; i < 6; ++i) {
        var pos = randomPosition(MONSTER_SIZE, monsterPosCondition);
        var node = createGameObj(pos.x, pos.y, "#monster", "monsters");
        monsters[i] = new Monster(node, pos.x, pos.y);
    }
    monsters[0].special = true;
    
    // var goodthingPos = new Array();
    for(var i = 0; i < 8; ++i) {
        var pos = randomPosition(GOODTHING_SIZE, goodthingPosCondition);
        createGameObj(pos.x, pos.y, "#goodthing", "goodthings");
        // goodthingPos.push(pos);
    }
}
//
// This function creates the monsters in the game
//
function createGameObj(x, y, id, groupid) {
    // console.log("createGameObj("+x+", "+y+", "+id+", "+groupid+")");
    var object = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
    object.setAttribute("x", x);
    object.setAttribute("y", y);
    object.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", id);
    svgdoc.getElementById(groupid).appendChild(object);
    return object;
}


//
// This function shoots a bullet from the player
//
function shootBullet() {

    soundShoot.currentTime = 0;
    soundShoot.play();

    canShoot = false;
    setTimeout("canShoot = true", SHOOT_INTERVAL);

    if(!cheatmode) --bulletNum;
    // console.log(bulletNum);
    svgdoc.getElementById("bulletNum").textContent = bulletNum;

    // Create the bullet using the use node
    var bullet = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
    bullet.setAttribute("x", player.position.x + PLAYER_SIZE.w / 2 - BULLET_SIZE.w / 2);
    bullet.setAttribute("y", player.position.y + PLAYER_SIZE.h / 2 - BULLET_SIZE.h / 2);
    bullet.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#bullet");
    if(player.direction == 1)
        bullet.id = "rightBullet";
    else
        bullet.id = "leftBullet";
    svgdoc.getElementById("bullets").appendChild(bullet);
}

function monsterShootBullet() {

    // console.log("monsterShootBullet()");

    var specialMonster = null;
    for (var i = 0; i < monsters.length; ++i)
        if (monsters[i].special) specialMonster = monsters[i];

    if (specialMonster == null) {
        clearInterval(monsterShootInterval);
        return;
    }

    // console.log(monsterShooting);
    if (monsterShooting) return;

    var bullet = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
    bullet.setAttribute("x", specialMonster.position.x + MONSTER_SIZE.w / 2 - MONSTER_BULLET_SIZE.w / 2);
    bullet.setAttribute("y", specialMonster.position.y + MONSTER_SIZE.h / 2 - MONSTER_BULLET_SIZE.h / 2);
    bullet.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#monsterBullet");
    if(specialMonster.direction == 1)
        bullet.id = "rightBullet";
    else
        bullet.id = "leftBullet";
    svgdoc.getElementById("monsterBullets").appendChild(bullet);
    monsterShooting = true;
}

//
// This is the keydown handling function for the SVG document
//
function keydown(evt) {
    var keyCode = (evt.keyCode)? evt.keyCode : evt.getKeyCode();

    switch (keyCode) {
        case "N".charCodeAt(0):
            player.motion = motionType.LEFT;
            player.direction = -1;
            break;

        case "M".charCodeAt(0):
            player.motion = motionType.RIGHT;
            player.direction = 1;
            break;
			
        case "Z".charCodeAt(0):
            if (cheatmode || player.isOnPlatform()) {
                player.verticalSpeed = JUMP_SPEED;
            }
            break;

        case 32:
            if (canShoot && (bulletNum > 0 || cheatmode)) shootBullet();
            break;

        case "C".charCodeAt(0):
            cheatmode = true;
            player.imagenode.style.opacity = 0.5;
            break;

        case "V".charCodeAt(0):
            cheatmode = false;
            player.imagenode.style.opacity = 1;
            break;
    }
}


//
// This is the keyup handling function for the SVG document
//
function keyup(evt) {
    // Get the key code
    var keyCode = (evt.keyCode)? evt.keyCode : evt.getKeyCode();

    switch (keyCode) {
        case "N".charCodeAt(0):
            if (player.motion == motionType.LEFT) player.motion = motionType.NONE;
            break;

        case "M".charCodeAt(0):
            if (player.motion == motionType.RIGHT) player.motion = motionType.NONE;
            break;
    }
}


//
// This function checks collision
//
function collisionDetection() {
    // Check whether the player collides with a monster
    // console.log(cheatmode);
    var monsterNodes = svgdoc.getElementById("monsters");
    if (!warping && !cheatmode) {
        for (var i = 0; i < monsterNodes.childNodes.length; i++) {
            // var monster = monsterNodes.childNodes.item(i);
            // var x = parseInt(monster.getAttribute("x"));
            // var y = parseInt(monster.getAttribute("y"));

            if (intersect(monsters[i].position, MONSTER_SIZE, player.position, PLAYER_SIZE)) {

                gameover(false);
                return;
            }
        }
    }

    if (!warping && !cheatmode) {
        var monsterBullets = svgdoc.getElementById("monsterBullets");
        for (var i = 0; i < monsterBullets.childNodes.length; ++i) {
            var bullet = monsterBullets.childNodes.item(i);
            var x = parseInt(bullet.getAttribute("x"));
            var y = parseInt(bullet.getAttribute("y"));

            if (intersect(new Point(x, y), MONSTER_BULLET_SIZE, player.position, PLAYER_SIZE)) {
                gameover(false);
                return;
            }
        }
    }

    // Check whether a bullet hits a monster
    var bullets = svgdoc.getElementById("bullets");
    for (var i = 0; i < bullets.childNodes.length; i++) {
        var bullet = bullets.childNodes.item(i);
        var x = parseInt(bullet.getAttribute("x"));
        var y = parseInt(bullet.getAttribute("y"));

        var removeBullet = false;

        for (var j = 0; j < monsters.length; j++) {

            if (monsters[j].node == null) continue;

            var monster = monsters[j].node;
            // var mx = parseInt(monster.getAttribute("x"));
            // var my = parseInt(monster.getAttribute("y"));

            if (intersect(new Point(x, y), BULLET_SIZE, monsters[j].position, MONSTER_SIZE)) {
                svgdoc.getElementById("monsters").removeChild(monster);

                soundMonster.currentTime = 0;
                soundMonster.play();

                monsters[j].node = null;
                monsters.splice(j, 1);
                j--;
                removeBullet = true;

                //write some code to update the score
                score += 20 * ((zoom == 1.0)? 1 : 3);
                // svgdoc.getElementById("score").firstChild.data = score;
            }
        }

        if(removeBullet) {
            bullets.removeChild(bullet);
            i--;
        }
    }

    // player collide with goodthing
    var goodthings = svgdoc.getElementById("goodthings");
    for (var i = 0; i < goodthings.childNodes.length; ++i) {
        var goodthing = goodthings.childNodes.item(i);
        var x = goodthing.getAttribute("x");
        var y = goodthing.getAttribute("y");

        if (intersect(new Point(x, y), GOODTHING_SIZE, player.position, PLAYER_SIZE)) {
            goodthings.removeChild(goodthing);
            --goodthingNum;
            --i;
            score += 15 * ((zoom == 1.0)? 1 : 2);
            // console.log("goodthingNum = " + goodthingNum);
        }
    }

    svgdoc.getElementById("score").firstChild.data = score;

    // collide transmission portal
    // console.log("warping = " + warping);
    // console.log("exitwarp = " + exitwarp);
    for (var i = 0; i < 2; ++i) {
        if (!warping && exitwarp == -1 && intersect(PORTAL_POINT[i], PORTAL_SIZE, player.position, PLAYER_SIZE)) {
            // console.log("intersect portal");
            warping = true;
            var translateD = PLAYER_SIZE.w/2.0/40.0;
            if (player.direction == 1) {
                warpAnimate(new Point(0, 0), new Point(translateD, translateD), new Point(1, 1), new Point(-0.025, -0.025));
                setTimeout(warpAnimate, 1000, new Point(PLAYER_SIZE.w/2.0, PLAYER_SIZE.h/2.0), new Point(-translateD, -translateD),
                                                new Point(0, 0), new Point(0.025, 0.025));
            } else {
                warpAnimate(new Point(PLAYER_SIZE.w, 0), new Point(-translateD, translateD), new Point(-1, 1), new Point(0.025, -0.025));
                setTimeout(warpAnimate, 1000, new Point(PLAYER_SIZE.w/2.0, PLAYER_SIZE.h/2.0), new Point(translateD, -translateD),
                                                new Point(0, 0), new Point(-0.025, 0.025));
            }
            svgdoc.getElementById("warpRotate").beginElement();

            setTimeout(function(i) {
                var portalCenter = PORTAL_CENTER[(i + 1) % 2];
                var x = portalCenter.x - PLAYER_SIZE.w/2;
                var y = portalCenter.y - PLAYER_SIZE.h/2;
                player.position = new Point(x, y);
                exitwarp = (i + 1) % 2;

                setTimeout("warping = false", 1000); //tochange
            }, 1000, i);

        } else {
            if (exitwarp != -1) {
                var px = PORTAL_CENTER[exitwarp].x - PORTAL_EXIT_SIZE.w/2;
                var py = PORTAL_CENTER[exitwarp].y - PORTAL_EXIT_SIZE.h/2;
                if (!intersect(new Point(px, py), PORTAL_EXIT_SIZE, player.position, PLAYER_SIZE))
                    exitwarp = -1;
            }
        }
    }

    // collide disappear platform
    for (var i = 0; i < disappearPlatforms.length; ++i) {// tochange
        if (intersect(disappearPlatforms[i].Point, disappearPlatforms[i].Size, player.position, PLAYER_SIZE)) {
            if (disappearPlatforms[i].disappearInterval == null) {
                disappearPlatforms[i].disappearInterval = setTimeout(
                    "triggerDisappear(disappearPlatforms.splice("+i+", 1)[0].node)", 200);
            }
        }
        // else {
        //     clearTimeout(disappearPlatforms[i].disappearInterval);
        //     disappearPlatforms[i].disappearInterval = null;
        // }
    }

    // collide exit
    var exitPoint = EXIT_POS;
    var exitSize = EXIT_SIZE;
    if (intersect(exitPoint, exitSize, player.position, PLAYER_SIZE)) {
        if (goodthingNum == 0) {
            gameover(true);
        } else {
            // show hint for how to win
            svgdoc.getElementById("winConditionMsg").style.opacity = 1;
            svgdoc.getElementById("winConditionMsg").style.visibility = "visible";
            clearTimeout(winConditionMsgFadeTimeout);
            winConditionMsgFadeTimeout = setTimeout(() => { fadeElement("winConditionMsg", 800, winConditionMsgFadeTimeout); }, GAME_INTERVAL);
        }
    }
}

// var animateScale = new Point(1, 1);
// var animateTranslate = new Point(0, 0);

function warpAnimate(translate, translateD, scale, scaleD, millisec = 0){//inout, dir, millisec = 0) {
// player.imagenode.setAttribute("transform", "translate(" +PLAYER_SIZE.w + ", 0) scale(-1, 1)");
    if(millisec < 1000) {
        millisec += 25;
        translate.x += translateD.x;
        translate.y += translateD.y;
        scale.x += scaleD.x;
        scale.y += scaleD.y;
        // console.log(millisec);
        // console.log(scale);
        // console.log(translate);
        var translateStr = "translate("+translate.x+", "+translate.y+")";
        var scaleStr = "scale("+scale.x+", "+scale.y+")";
        player.imagenode.setAttribute("transform", translateStr + scaleStr);// + rotateStr);
        setTimeout(warpAnimate, 25, translate, translateD, scale, scaleD, millisec);
    }

    // var animateScale = svgdoc.getElementById("warpScale");
    // var animateX = svgdoc.getElementById("warpTranslate");
    // // var str = "("+player.direction+" 1);0;("+player.direction+" 1)";
    // var str1 = dir + " 1";
    // var str2 = "0 0";
    // animateScale.setAttribute("from", (inout == 0)? str1 : str2);
    // animateScale.setAttribute("to", (inout == 0)? str2 : str1);
    // // console.log(animate);
    // animateScale.beginElement();
    // animateX.beginElement();

//     function warpIn(dir, scale) {
//         if((dir == 1 && scale > 0) || (dir == -1 && scale < 0)) {
//             scale = scale + ((dir == 1)? -0.025 : 0.025);
//             console.log(scale);
//             setTimeout(warpIn, 25, dir, scale);
//         }
//     }
//     function warpOut(dir, scale) { // 1/(1000/25) --> 0.025
//         if((dir == 1 && scale < 1) || (dir == -1 && scale > -1)) {
//             scale = scale + ((dir == 1)? 0.025 : -0.025);
//             console.log(scale);
//             setTimeout(warpOut, 25, dir, scale);
//         }
//     }
//     var scale = player.direction;
//     warpIn(scale, scale);
//     setTimeout(warpOut, 1000, scale, scale);
}

function triggerDisappear(platform) {
    // console.log("triggerDisappear()");

    function disappear() {
        if (platform.style.opacity > 0) {
            platform.style.opacity -= 0.1;
            setTimeout(disappear, 10);
        }
        else
            svgdoc.getElementById("platforms").removeChild(platform);    
    }

    disappear();
}

//
// This function updates the position of the bullets
//
function moveBullets() {
    // Go through all bullets
    var bullets = svgdoc.getElementById("bullets");
    for (var i = 0; i < bullets.childNodes.length; i++) {
        var node = bullets.childNodes.item(i);
        
        // Update the position of the bullet
        var x = parseInt(node.getAttribute("x"));
        node.setAttribute("x", x + ((node.id == "rightBullet")? BULLET_SPEED : -BULLET_SPEED));
        // console.log(node.id);

        // If the bullet is not inside the screen delete it from the group
        if (x > SCREEN_SIZE.w || x < -BULLET_SIZE.w) {
            bullets.removeChild(node);
            i--;
        }
    }

    // console.log(monsterShooting);
    bullets = svgdoc.getElementById("monsterBullets");
    // console.log(bullets);
    if (bullets.childNodes.length) {
        var node = bullets.childNodes.item(0);

        var x = parseInt(node.getAttribute("x"));
        // console.log(x);
        node.setAttribute("x", x + ((node.id == "rightBullet")? 1 : -1) * MONSTER_BULLET_SPEED);

        if (x > SCREEN_SIZE.w || x < -MONSTER_BULLET_SIZE.w) {
            bullets.removeChild(node);
            monsterShooting = false;
        }
    }
}

function updateMonsters() {

    // console.log(monsters);

    for (var i = 0; i < monsters.length; ++i) { //MONSTER_NUM

        if (monsters[i].node == null) continue;

        var newPos = randomPosition(MONSTER_SIZE, monsterMoveCondition);
        monsters[i].targetPos = newPos;

        var vector = new Point(newPos.x - monsters[i].position.x, newPos.y - monsters[i].position.y);
        vector.x /= MONSTER_INTERVAL / GAME_INTERVAL;
        vector.y /= MONSTER_INTERVAL / GAME_INTERVAL;

        var magnitude = Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2));
        // console.log(magnitude);
        if (magnitude > MONSTER_MAX_SPEED) {
            vector.x *= MONSTER_MAX_SPEED / magnitude;
            vector.y *= MONSTER_MAX_SPEED / magnitude;
        }
        // console.log(Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2)));
        monsters[i].vector = vector;
        monsters[i].direction = ((vector.x >= 0)? 1 : -1);
    }

}

function moveMonsters() {

    // if (monsters[0].targetPos == null) return;

    for (var i = 0; i < monsters.length; ++i) { //MONSTER_NUM

        if (monsters[i].node == null) continue;

        monsters[i].position.x += monsters[i].vector.x;
        monsters[i].position.y += monsters[i].vector.y;

        monsters[i].node.setAttribute("transform", "scale("+monsters[i].direction+", 1)");
        monsters[i].node.setAttribute("x", ((monsters[i].direction == 1)? monsters[i].position.x : -monsters[i].position.x - MONSTER_SIZE.w));
        monsters[i].node.setAttribute("y", monsters[i].position.y);

    }
}

//
// This function updates the position and motion of the player in the system
//
function gamePlay() {
    // Check collisions
    collisionDetection();

    // Check whether the player is on a platform
    var isOnPlatform = player.isOnPlatform();
    
    // Update player position
    var displacement = new Point();

    // Move left or right
    if (player.motion == motionType.LEFT)
        displacement.x = -MOVE_DISPLACEMENT;
    if (player.motion == motionType.RIGHT)
        displacement.x = MOVE_DISPLACEMENT;

    // Fall
    if (!isOnPlatform && player.verticalSpeed <= 0) {
        displacement.y = -player.verticalSpeed;
        player.verticalSpeed -= VERTICAL_DISPLACEMENT;
    }

    // Jump
    if (player.verticalSpeed > 0) {
        displacement.y = -player.verticalSpeed;
        player.verticalSpeed -= VERTICAL_DISPLACEMENT;
        if (player.verticalSpeed <= 0)
            player.verticalSpeed = 0;
    }

    // Get the new position of the player
    var position = new Point();
    position.x = player.position.x + displacement.x;
    position.y = player.position.y + displacement.y;

    // Check collision with platforms and screen
    player.collidePlatform(position);
    player.collideScreen(position);

    // Set the location back to the player object (before update the screen)
    player.position = position;

    // Move the bullets
    moveBullets();
    moveMonsters();

    updateScreen();
}

//
// This function updates the position of the player's SVG object and
// set the appropriate translation of the game screen relative to the
// the position of the player
//
function updateScreen() {
    // Transform the player
    player.node.setAttribute("transform", "translate(" + player.position.x + "," + player.position.y + ")");
    if(!warping) {
        if(player.direction == 1)
            player.imagenode.setAttribute("transform", "translate(0, 0) scale(1, 1)");
        else
            player.imagenode.setAttribute("transform", "translate(" +PLAYER_SIZE.w + ", 0) scale(-1, 1)");
    }

    // Calculate the scaling and translation factors	
    var scale = new Point(zoom, zoom);
    var translate = new Point();
    
    translate.x = SCREEN_SIZE.w / 2.0 - (player.position.x + PLAYER_SIZE.w / 2) * scale.x;
    if (translate.x > 0) 
        translate.x = 0;
    else if (translate.x < SCREEN_SIZE.w - SCREEN_SIZE.w * scale.x)
        translate.x = SCREEN_SIZE.w - SCREEN_SIZE.w * scale.x;

    translate.y = SCREEN_SIZE.h / 2.0 - (player.position.y + PLAYER_SIZE.h / 2) * scale.y;
    if (translate.y > 0) 
        translate.y = 0;
    else if (translate.y < SCREEN_SIZE.h - SCREEN_SIZE.h * scale.y)
        translate.y = SCREEN_SIZE.h - SCREEN_SIZE.h * scale.y;
            
    // Transform the game area
    svgdoc.getElementById("gamearea").setAttribute("transform", "translate(" + translate.x + "," + translate.y + ") scale(" + scale.x + "," + scale.y + ")");	
}


//
// This function sets the zoom level to 2
//
function setZoom() {
    zoom = 2.0;
}

function timeStr() {
    var min = parseInt(time/60000);
    var sec = parseInt((time%60000)/1000);
    return min + " : " + ((sec < 10)? "0": "") + sec;
}

function updateTime() {
    time -= GAME_INTERVAL;
    // console.log(time);

    svgdoc.getElementById("timebar").setAttribute("width", TIMEBAR_WIDTH * (time/INIT_TIME));
    //.width = TIMEBAR_WIDTH * (time / 60);
    if(time % 1000 == 0) {
        svgdoc.getElementById("timetext").textContent = timeStr();
    }

    if(time <= 0) gameover(false);

    // show 10 seconds left message
    if(Math.abs(time - 1000 * 10) < GAME_INTERVAL) {
        svgdoc.getElementById("timeLeftMsg").style.opacity = 1;
        svgdoc.getElementById("timeLeftMsg").style.visibility = "visible";
        setTimeout(() => { fadeElement("timeLeftMsg", 2000); }, GAME_INTERVAL);
    }  
}

function fadeElement(id, fadingTimeLength, timeoutID = null) {
    svgdoc.getElementById(id).style.opacity -= GAME_INTERVAL / fadingTimeLength;
    if (svgdoc.getElementById(id).style.opacity <= 0) {
        svgdoc.getElementById(id).style.visibility = "hidden";
    } else {
        timeoutID = setTimeout(() => { fadeElement(id, fadingTimeLength, timeoutID); }, GAME_INTERVAL);
    }
}

function gameover(win) {

    // soundBgm.pause();//
    soundBgm.volume = 0.2;
    if (win) soundWin.play();
    else soundLose.play();

    // Clear the game interval
    clearInterval(gameInterval);
    clearInterval(timeInterval);
    clearInterval(monsterInterval);
    clearInterval(monsterShootInterval);

    if(win) // tochange
        score += 5 * parseInt(time/1000) * ((zoom == 1.0)? 1 : 2);
    svgdoc.getElementById("score").textContent = score;

    if(win)
        svgdoc.getElementById("gameovertext").textContent = "CONGRATULATIONS!";
    else
        svgdoc.getElementById("gameovertext").textContent = "YOU FAIL ...";

    svgdoc.getElementById("gameoverAnimate").beginElement();
    svgdoc.getElementById("gameover").style.visibility = "visible";

}

function highscore() {

    // Get the high score table from cookies
    var table = getHighScoreTable();

    // Create the new score record
    // var playername = prompt("what is your name?", "Anonymous");
    var record = new ScoreRecord(playername, score);

    // Insert the new score record
    var pos = table.length;
    for(var i = 0; i < table.length; ++i) {
        if(record.score > table[i].score) {
            pos = i;
            break;
        }
    }
    table.splice(pos, 0, record); //pos: index to insert/remove, 0: remove 0 items, record: to be added

    // Store the new high score table
    setHighScoreTable(table);

    // Show the high score table
    showHighScoreTable(table);
}

function openScreen(id) {
    svgdoc.getElementById(id).style.visibility = "visible";
}

function closeScreen(id) {
    svgdoc.getElementById(id).style.visibility = "hidden";
}
