/*
https://github.com/parenparen/

Copyright 2014 Derek Mueller
Released under the MIT license
http://opensource.org/licenses/MIT
*/


NPCB.debug = false;

// holds the one and only NPCB instance
NPCB._chessBoard = null; 

/*
Preconditions:
    - NPCB not yet instantiated 
*/
function NPCB (argsDict) {
    if (NPCB._chessBoard) {
        proto.err ('NPCB: instance already exists');
        return;
    }

    var defaultPropsDict = {
        name: 'default',
        parentElement: null,
        x: 200,
        y: 200,
        r: 200,
        playerNum: 5
    };

    proto.unpack.apply (this, [argsDict, defaultPropsDict]);

    this._sides = this.playerNum * 2;
    this._world = null; // object returned by prototypes.js

    // private properties
    this._slices = []; // array of arrays of place objects
    this._players = []; // array of player objects

    // the number of the player whose turn it is
    this._currPlayerNum = null; 

    NPCB._chessBoard = this;
    this._init ();
}


/*
Public Static Methods
*/

/*
Private Static Methods
*/

/*
Public Instance Methods
*/


/*
Preconditions:
    - NPCB is done initializing
*/
NPCB.prototype.startGame = function () {
    this._currPlayerNum = 0;
};

/*
Preconditions:
    - game has started
*/
NPCB.prototype._endTurn = function () {
    this._currPlayerNum++;
    if (this._currPlayerNum > this.playerNum - 1) {
        this._currPlayerNum = 0;
    }
};

/*
Parameters:
    playerNum - Number 
    piece - string (e.g. 'pawn0', 'king', 'queen', 'bishop0') 
    boardPos - array [<slice number>, <index 0>, <index 1>]
*/
NPCB.prototype._makeMove = function (playerNum, piece, boardPos) {
    if (this._currPlayerNum !== playerNum) {
        console.log (
            'Error: _makeMove: this._currPlayerNum !== playerNum');
    }
    console.log ('hello');

    var player = NPCB._chessBoard._players[playerNum];
    console.log ('hello');
    var place = NPCB._chessBoard._getPlace (boardPos);
    console.log ('hello');
    var piece = player.getPiece (piece);

    console.log ('player = ');
    console.log (player);
    console.log ('place= ');
    console.log (place);
    console.log ('piece= ');
    console.log (piece);
        
    if (piece.makeMove (place)) {
    } else {
        console.log ('Error: _makeMove: invalid move');
    } 
};


/*
Set number of players and generate new board.
*/
NPCB.prototype.setPlayerNum = function (players) {
    if (players === this.playerNum) return;
    NPCB.debug && console.log ('setPlayerNum');
    NPCB.debug && console.log ('players = ');
    NPCB.debug && console.log (players);
    this._world.stop ();
    delete this._world;
    this.playerNum = players;
    this._sides = players * 2;
    this._slices = [];
    this._init ();
};



/*
Private Instance Methods
*/


/*
Preconditions:
    - this._world is defined
*/
NPCB.prototype._getBoardObj = function () {
    if (!this._world) {
        proto.err ('_getBoardObj: _world is undefined');
        return;
    }
    return this._world.currRegion.things['chessBoard'];
};

NPCB.prototype._getPrevSliceNum = function (sliceNum) {
    NPCB.debug && console.log ('NPCB:_getPrevSliceNum:');
    NPCB.debug && console.log ('sliceNum = ');
    NPCB.debug && console.log (sliceNum);
    var prevSliceNum = (sliceNum - 1);
    if (prevSliceNum === -1) {
        prevSliceNum = this._sides - 1;
    }
    NPCB.debug && console.log ('prevSliceNum = ');
    NPCB.debug && console.log (prevSliceNum);
    return prevSliceNum;
};

NPCB.prototype._getDiagonalSliceNum = function (sliceNum) {
    var diagonalSliceNum = sliceNum + this._sides / 2;
    if (diagonalSliceNum > this._sides - 1) {
        diagonalSliceNum = diagonalSliceNum % (this._sides);
    }
    
    return diagonalSliceNum;
};

NPCB.prototype._getNextSliceNum = function (sliceNum) {
    var nextSliceNum = (sliceNum + 1);
    if (nextSliceNum === this._sides) {
        nextSliceNum = 0;
    }
    return nextSliceNum;
};

NPCB.prototype._unhighlightBoard = function () {
    if (!this._world) {
        proto.err ('_getHighlightBoardObj: _world is undefined');
        return;
    }
    var topCanvas = 
        this._world.currRegion.things['chessHighlightBoard'].
            getTopCanvas ();
    topCanvas.paths = [];
    topCanvas.clear ();
};

NPCB.prototype._getPlace = function (boardPos) {
    var slices = this._slices;
    NPCB.debug && console.log ('slices = ');
    NPCB.debug && console.log (slices);
    NPCB.debug && console.log ('boardPos = ');
    NPCB.debug && console.log (boardPos);
    return slices[boardPos[0]][boardPos[1]][boardPos[2]];
};

NPCB.prototype._removePieceFromBoard = function (piece) {
    var board = this._getGame ();
    board.deleteThing (piece.thing); 
};

/*
Parameters:
   moves - array ([sliceNum, rank, file]) 
*/
NPCB.prototype._highlightMoves = function (moves) {
    var highlightBoard = 
        this._getHighlightBoardObj ();
    var slices = this._slices;

    var move;
    var moveType;
    var place;
    for (var i in moves) {
        move = moves[i][1]; 
        moveType = moves[i][0];
        place = slices[move[0]][move[1]][move[2]].getDuplicatePath ();
        if (moveType === 'capture') {
            place.color = 'rgba(255,61,61,0.6)';
        } else {
            place.color = 'rgba(158,255,160,0.5)';
        }
        highlightBoard.addPath (place);
    }
};

/*
Preconditions:
    - this._world is defined
*/
NPCB.prototype._getHighlightBoardObj = function () {
    if (!this._world) {
        proto.err ('_getHighlightBoardObj: _world is undefined');
        return;
    }
    return this._world.currRegion.
        things['chessHighlightBoard'];
};

/*
Preconditions:
    - this._world is defined
*/
NPCB.prototype._getGame = function () {
    if (!this._world) {
        proto.err ('_getGame: _world is undefined');
        return;
    }
    return this._world.currRegion;
};


/*
Parameters:
    point - the point from which the closes place will be found
    currSliceNum - the number of the slice in which the point resides
Returns:
    the _Place obj with a centroid closest to point
*/
NPCB.prototype._getClosestPlace = function (
    point, currSliceNum) {

    var slice = this._slices[currSliceNum];
    //console.log ('slice = ');
    //console.log (slice);
    var closestDist = Infinity;
    var closestPlace = null;
    var places, dist;
    for (var i in slice) {
        places = slice[i];
        for (var i in places) {
            //console.log (places[i]);
            dist = NPCB._Point.dist (
                point, places[i].centroid);
            if (dist < closestDist) {
                closestDist = dist;
                closestPlace = places[i];
            }
        }
    }
    return closestPlace;
};

/*
Parameters:
    point - _Point - the point for which the current slice should be 
        found
Returns:
    sliceNum - returns the number of the slice that, starting at 0 rad,
        the specified angle resides in
*/
NPCB.prototype._getCurrSliceNum = function (point) {

    point.translate (- this.x, - this.y);
    point.toPolar ();
    var currSliceNum;

    var theta = point.theta;
    if (theta < 0) {
        theta = - theta;
    } else if (theta > 0) {
        theta = Math.PI + Math.PI - theta;
    }
    var angleA = this._getAngleA ();
    if (theta < angleA / 2) {
        currSliceNum = 0;
    } else {
        currSliceNum = (Math.floor ((theta + angleA / 2) / angleA)) % 
            this._sides;
    }

    point.toCart ();
    point.translate (this.x, this.y);
    
    return currSliceNum;
};

/*
Returns:
    angleA - the angle of a slice closest to the center of the board
*/
NPCB.prototype._getAngleA = function () {
    return Math.abs ((1 / this._sides) * (Math.PI * 2));
};

/*
Returns:
    a - the length of the longer edge of a slice 
*/
NPCB.prototype._getA = function () {
    return Math.abs (Math.cos (this._getAngleA () / 2) * this.r);
};

/*
Returns:
    b - the length of the shorter edge of a slice 
*/
NPCB.prototype._getB = function () {
    return Math.abs (Math.sin (this._getAngleA () / 2) * this.r);
};

/*
Returns:
    angleB - the angle of a slice furthest from the center of the board
*/
NPCB.prototype._getAngleB = function () {
    return Math.abs ((Math.PI * (this._sides - 2)) / this._sides);
};

/*
Parameters:
   slicePoints - 5x5 array of _Point objects
   sliceNum - Number - used to determine color pattern of places
Returns:
   places - 4x4 array of _Place objects 
*/
NPCB.prototype._getSlicePlaces = function (
    slicePoints, sliceNum) {

    // set up places data structure
    var places = [null, null, null, null];
    var placeColors = ['black', 'gray'];
    for (var i = 0; i < places.length; ++i) {
        places[i] = [
            new NPCB._Place ({
                color: placeColors[(i + 1 + sliceNum) % 2 === 0 ? 0 : 1],
                boardPos: [sliceNum, i, 0]
            }),
            new NPCB._Place ({
                color: placeColors[(i + 2 + sliceNum) % 2 === 0 ? 0 : 1],
                boardPos: [sliceNum, i, 1]
            }),
            new NPCB._Place ({
                color: placeColors[(i + 3 + sliceNum) % 2 === 0 ? 0 : 1],
                boardPos: [sliceNum, i, 2]
            }),
            new NPCB._Place ({
                color: placeColors[(i + 4 + sliceNum) % 2 === 0 ? 0 : 1],
                boardPos: [sliceNum, i, 3]
            })
        ];
    }

    // set points
    //console.log (places);
    for (var i = 0; i < 4; ++i) {
        for (var j = 0; j < 4; ++j) {
            places[i][j].points[0] = slicePoints[i][j];
            places[i][j].points[1] = slicePoints[i][j + 1];
            places[i][j].points[2] = slicePoints[i + 1][j];
            places[i][j].points[3] = slicePoints[i + 1][j + 1];
        }
    }

    return places;

};

/*
Performs rotation transformation on point objects about the x, y
properties of this NPCB object.
Parameters:
    points - 2d array of _Point objects
    rotAngle - Number - rotation angle
Returns:
    points - a copy of the given points array, transformed 
*/
NPCB.prototype._rotatePoints = 
    function (points, rotAngle) {

    var originX = this.x;
    var originY = this.y;

    for (var i in points) {
        for (var j in points[i]) {
            points[i][j].translate (- this.x, - this.y);
            points[i][j].rotate (rotAngle);
            points[i][j].translate (this.x, this.y);
        }
    }

    return points;
};

/*
Parameters:
   rotAngle - radians - angle from the x axis by which the points will
    be rotated before being returned
Returns:
   points - 2d array of _Point objects 
*/
NPCB.prototype._getSlicePoints = function (rotAngle) {

    // set up points data structure
    var points = [null, null, null, null, null];
    for (var i in points) {
        points[i] = [
            new NPCB._Point (),
            new NPCB._Point (),
            new NPCB._Point (),
            new NPCB._Point (),
            new NPCB._Point ()
        ];
    }
    
    var B = this._getB ();
    var A = this._getA ();
    var angleA = this._getAngleA ();
    var angleB = this._getAngleB ();

    var B0 = points[0][0];
    B0.setXY (this.x + this.r, this.y);
    var A0 = points[4][4];
    A0.setXY (this.x, this.y);
    
    // get external points
    for (var i = 1; i < 5; ++i) {
        points[0][i].setXY ( 
            B0.getX () + proto.polarToCartX (
                i * (B / 4), Math.PI + angleB / 2),
            B0.getY () - proto.polarToCartY (
                i * (B / 4), Math.PI + angleB / 2)
        );
        points[i][0].setXY ( 
            B0.getX () + proto.polarToCartX (
                i * (B / 4), Math.PI - angleB / 2),
            B0.getY () - proto.polarToCartY (
                i * (B / 4), Math.PI - angleB / 2)
        );
        points[4][4 - i].setXY ( 
            A0.getX () + proto.polarToCartX (
                i * (A / 4), angleA / 2),
            A0.getY () - proto.polarToCartY (
                i * (A / 4), angleA / 2)
        );
        points[4 - i][4].setXY ( 
            A0.getX () + proto.polarToCartX (
                i * (A / 4), - (angleA / 2)),
            A0.getY () - proto.polarToCartY (
                i * (A / 4), - (angleA / 2))
        );
    }

    // get internal points
    var x1, x2, x3, x4, y1, y2, y3, y4, intersect;
    for (var i = 1; i < 4; ++i) {
        for (var j = 1; j < 4; ++j) {
            x1 = points[0][j].getX ();
            y1 = points[0][j].getY ();
            x2 = points[4][j].getX ();
            y2 = points[4][j].getY ();

            x3 = points[i][0].getX ();
            y3 = points[i][0].getY ();
            x4 = points[i][4].getX ();
            y4 = points[i][4].getY ();
            
            intersect = proto.getIntersect (
                x1, y1, x2, y2, x3, y3, x4, y4);
            points[i][j].setXY (intersect[0], intersect[1]);
        }
    }

    if (rotAngle) {
        points = this._rotatePoints (points, rotAngle);
    }
/*
    // test: draw points
    NPCB.debug && console.log (points);
    var board = this._getBoardObj ();
    var path = board.addPath ({lineWidth: 50});
    path.addCommand (Path.moveTo, {x: this.x, y: this.y});
    for (var i in points) {
        for (var j in points[i]) {
            if (points[i][j].getX () === undefined) continue;
            path.addCommand (Path.lineTo, {
                x: points[i][j].getX (),
                y: points[i][j].getY ()
            });
            board.addCircle ({
                x: points[i][j].getX (),
                y: points[i][j].getY (),
                radius: 1
            });
        }
    }
*/
    return points;
};

NPCB.prototype._drawSliceSkeleton = function () {
    var board = this._getBoardObj ();

    var path = board.addPath ({lineWidth: 50});
    var angleA = this._getAngleA ();
    var angleB = this._getAngleB ();
    path.addCommand (Path.moveTo, {x: this.x, y: this.y});
    path.addCommand (Path.lineTo, {
        r: this._getA (), 
        theta: - (angleA / 2)
    });
    path.addCommand (Path.lineTo, {
        r: this._getB (), 
        theta: angleB / 2
    });
    path.addCommand (Path.lineTo, {
        r: this._getB (), 
        theta: Math.PI - (angleB / 2)
    });
    path.addCommand (Path.lineTo, {
        r: this._getA (), 
        theta: Math.PI + (angleA / 2)
    });
};

/*
Private method. Sets up an interactive canvas using the prototypes.js 
library.
*/
NPCB.prototype._setUpCanvas = function () {
    var that = this;

    this._world = new World ({
        name: this.name + 'NPCBWorld',
        x: 0,
        y: 0,
        width: this.r * 2, 
        height: this.r * 2,
        parentElement: this.parentElement,
        suppressEvtFns: false
    });

    this._world.makeActive ();
    var newRegion = new Region ({name: "UI_0"});

    var board = new CommonThing ({ // static background image
        'name': 'chessBoard',
        'clearOnDraw': true
    });

    // used for place highlighting
    var highlightBoard = new CommonThing ({ 
        'name': 'chessHighlightBoard',
        'clearOnDraw': true,
        'zIndex': 1000
    });

    /*surface.addRect ({
        x: 100,
        y: 100,
        width: 50,
        height: 50,
        color: 'red'
    });*/

    newRegion.addThing (board);
    newRegion.addThing (highlightBoard);

    this._world.addRegion (newRegion);

    this._world.changeRegion ("UI_0");
    this._world.start ();

};

NPCB.prototype._setUpBoard = function () {
    NPCB.debug && console.log ('_setUpBoard');
    //this._drawSliceSkeleton ();
    //this._getSlicePoints (Math.PI);

    //this._getSlicePlaces (this._getSlicePoints (Math.PI / 2), 0);

    // set up board 
    var rotAngle = 0;
    var sliceNum = 0;
    var places;
    //var place;
    while (rotAngle > -2 * Math.PI) {
        places = this._getSlicePlaces (
            this._getSlicePoints (rotAngle), sliceNum++);
        rotAngle -= this._getAngleA ();
        //console.log ('rotAngle = ' + rotAngle);

        // generate paths and add to game region
        //var game = this._getGame ();
        for (var i in places) {
            for (var j in places[i]) {
                places[i][j].generatePath (
                    this._getBoardObj ());
                /*places[i][j].generatePath (game);
                game.addThing (places[i][j].thing);*/
            }
        }
        //place = places[0][0].getDuplicatePath ();
        //place.color = 'red';
        //highlightBoard.addPath (place);
        this._slices.push (places);
    }

    // set up players
    var player;
    var color = new NPCB._Color ({
        rgb: [81, 140, 240]
    });
   NPCB.debug && console.log ('this.playerNum = ');
   NPCB.debug && console.log (this.playerNum);
    for (var i = 0; i < this.playerNum; ++i) {
        NPCB.debug && console.log (color);
        player = new NPCB._Player ({
            homeSliceNum: 2 * i,
            playerNum: i,
            color: color
        });
        this._players.push (player);
        NPCB.debug && console.log ('player = ');
        NPCB.debug && console.log (player);
        color = color.generateNewColor ()
    }

    // set up pieces
    /*var testRook = new NPCB._Rook ({
        x: this.x,
        y: this.y
    });
    var testBishop = new NPCB._Bishop ({
        x: this.x + 100,
        y: this.y
    });
    var testQueen = new NPCB._Queen ({
        x: this.x + 150,
        y: this.y
    });
    var testKing = new NPCB._King ({
        x: this.x - 100,
        y: this.y
    });
    var testPawn = new NPCB._Pawn ({
        x: this.x - 100,
        y: this.y - 100
    });
    var testKnight = new NPCB._Knight ({
        x: this.x - 150,
        y: this.y
    });
    this._world.currRegion.addThing (testRook.thing);
    this._world.currRegion.addThing (testBishop.thing);
    this._world.currRegion.addThing (testQueen.thing);
    this._world.currRegion.addThing (testKing.thing);
    this._world.currRegion.addThing (testPawn.thing);
    this._world.currRegion.addThing (testKnight.thing);*/
};

/*
*/
NPCB.prototype._init = function () {
    NPCB.debug && console.log ('_init');
    $(this.parentElement).addClass ('npcb-canvas-container');
    this._setUpCanvas ();
    this._setUpBoard ();
};


/***********************************************************************
* private _Place object
***********************************************************************/

NPCB._Place = function(argsDict) {
    argsDict = typeof argsDict === 'undefined' ? {} : argsDict;

    //console.log ('_Place: argsDict =');
    //console.log (argsDict);

    var defaultPropsDict = {
        points: [null, null, null, null],
        color: ['red', 'blue', 'gray', 'black']
                   [Math.floor (Math.random () * 4)],
        highlightColor: 'red',

        // sliceNum, rank, file
        boardPos: [undefined, undefined, undefined] 
    };

    proto.unpack.apply (this, [argsDict, defaultPropsDict]);

    this.piece = null; // _Piece currently on this _Place
    this.centroid = null; // _Point, center of quadrilateral
    this.path = null; // prototypes.js Path object
};

/*
Public static methods
*/

/*
Private static methods
*/

/*
Public instance methods
*/

NPCB._Place.prototype.addPiece = function (piece) {
    this.piece = piece;
};

NPCB._Place.prototype.removePiece = function () {
    this.piece = null;
};

/*
Preconditions:
    - path has been generated 
*/
NPCB._Place.prototype.setColor = function (color) {
    if (!this.path) {
        proto.err ('_Place: setColor: path has not been generated');
        return;
    }
    this.color = color;
    this.path.setColor (color);
}

/*
Preconditions:
    - path has been generated 
*/
NPCB._Place.prototype.unhighlight = function () {
    if (!this.path) {
        proto.err ('_Place: unhighlight: path has not been generated');
        return;
    }
    this.path.setColor (this.color);
}

/*
Preconditions:
    - path has been generated 
*/
NPCB._Place.prototype.highlight = function () {
    if (!this.path) {
        proto.err ('_Place: highlight: path has not been generated');
        return;
    }
    this.path.setColor (this.highlightColor);
}

/*
Preconditions:
    - path has already been generated 
*/
NPCB._Place.prototype.getDuplicatePath = function () {
    if (!this.path) {
        proto.err ('_Place: getDuplicatePath: path has not been ' + 
            'generated');
        return;
    }
    return new Path ($.extend (true, {}, this.path));
};

/*
Generates a prototypes path object and adds it to this thing property.
Preconditions:
    - all four points have been set
*/
NPCB._Place.prototype.generatePath = function (board) {
    /*this.thing = new CommonThing ();
    path = this.thing.addPath ({
        lineWidth: 50,
        color: this.color
    });*/

    var x1, y1, x2, y2, x3, y3, x4, y4;

    x1 = this.points[0].getX ();
    y1 = this.points[0].getY ();
    x2 = this.points[1].getX ();
    y2 = this.points[1].getY ();
    x3 = this.points[3].getX ();
    y3 = this.points[3].getY ();
    x4 = this.points[2].getX ();
    y4 = this.points[2].getY ();

    path = board.addPath ({
        lineWidth: 50,
        color: this.color
    });
    path.addCommand (Path.moveTo, {
        x: x1,
        y: y1
    });
    path.addCommand (Path.lineTo, {
        x: x2,
        y: y2
    });
    path.addCommand (Path.lineTo, {
        x: x3,
        y: y3
    });
    path.addCommand (Path.lineTo, {
        x: x4,
        y: y4
    });
    this.path = path;

    this._setCentroid (x1, y1, x2, y2, x3, y3, x4, y4);

    board.addCircle ({
        x:this.centroid.x, y:this.centroid.y,
        radius: 1, color: 'red'
    });
    board.addText ({
        string: this.boardPos.toString (),
        x: this.centroid.x - 17,
        y: this.centroid.y - 8,
        color: 'white',
        fontSize: 9
    });
};

/*
Private instance methods
*/

NPCB._Place.prototype._setCentroid = function (
    x1, y1, x2, y2, x3, y3, x4, y4) {

    var retDict = proto.getIntersect (x1, y1, x3, y3, x2, y2, x4, y4);
    this.centroid = new NPCB._Point ({
        x: retDict[0],
        y: retDict[1]
    });

};

/***********************************************************************
* private _Point object
***********************************************************************/

NPCB._Point = function(argsDict) {
    argsDict = typeof argsDict === 'undefined' ? {} : argsDict;

    var defaultPropsDict = {
        type: 'cartesian', // ('cartesian' | 'polar')
        x: undefined,
        y: undefined,
        r: undefined,
        theta: undefined
    };

    proto.unpack.apply (this, [argsDict, defaultPropsDict]);
}

/*
Public static methods
*/

NPCB._Point.dist = function (pointA, pointB) {
    var oldTypeA = pointA.type;
    var oldTypeB = pointB.type;
    pointA.toCart ();
    pointB.toCart ();

    var dist = Math.sqrt (
        Math.pow ((pointA.x - pointB.x), 2) + 
        Math.pow ((pointA.y - pointB.y), 2));
    
    pointA.setType (oldTypeA);
    pointB.setType (oldTypeB);
    return dist;
};

/*
Private static methods
*/

/*
Public instance methods
*/


/*
Parameters:
   angle - Number - radians 
Preconditions:
    - type is cartesian
*/
NPCB._Point.prototype.rotate = function (angle) {
    if (this.type === 'polar') {
        proto.err ('_Point: rotate: point is not cartesian');
        return;
    }
    var xPrime = this.x * Math.cos (angle) - this.y * Math.sin (angle);
    var yPrime = this.x * Math.sin (angle) + this.y * Math.cos (angle);
    this.x = xPrime;
    this.y = yPrime;
};

/*
Preconditions:
    - type is cartesian
*/
NPCB._Point.prototype.translate = function (
    deltaX, deltaY) {
    if (this.type === 'polar') {
        proto.err ('_Point: translate: point is not cartesian');
        return;
    }
    this.x = this.x + deltaX;
    this.y = this.y + deltaX;
};

NPCB._Point.prototype.toPolar = function () {
    if (this.type === 'polar') return;
    this.type = 'polar';
    var retDict = proto.cartToPolar (this.x, this.y);
    this.theta = retDict[1];
    this.r = retDict[0];
};

NPCB._Point.prototype.toCart = function () {
    if (this.type === 'cartesian') return;
    this.type = 'cartesian';
    this.x = this.r * Math.cos (this.theta);
    this.y = this.r * Math.sin (this.theta);
};

NPCB._Point.prototype.setType = function (type) {
    if (type === 'cartesian') this.toCart ();
    else if (type === 'polar') this.toPolar ();
};

NPCB._Point.prototype.setXY = function (x, y) {
    this.type = 'cartesian';
    this.x = x;
    this.y = y;
};

NPCB._Point.prototype.getXY = function () {
    if (this.type !== 'cartesian') return false;
    return [this.getX (), this.getY ()];
};

NPCB._Point.prototype.getX = function () {
    if (this.type !== 'cartesian') return false;
    return this.x;
};

NPCB._Point.prototype.getY = function () {
    if (this.type !== 'cartesian') return false;
    return this.y;
};

NPCB._Point.prototype.setRTheta = function (r, theta) {
    this.type = 'polar';
    this.r = r;
    this.theta = theta;
};

NPCB._Point.prototype.getRTheta = function () {
    if (this.type !== 'polar') return false;
    return [this.getR (), this.getTheta ()];
};

NPCB._Point.prototype.getR = function () {
    if (this.type !== 'polar') return false;
    return this.r;
};

NPCB._Point.prototype.getTheta = function () {
    if (this.type !== 'polar') return false;
    return this.theta;
};

/*
Private instance methods
*/
  


/***********************************************************************
* private _Piece base prototype
***********************************************************************/

NPCB._Piece = function(argsDict) {
    argsDict = typeof argsDict === 'undefined' ? {} : argsDict;

    var defaultPropsDict = {
        x: 0, 
        y: 0,
        zIndex: 2000,
        color: 'blue',
        player: null // the owner of the piece
    };

    proto.unpack.apply (this, [argsDict, defaultPropsDict]);
    this.place = null; // the place on which the piece is siting

    /* used to store legal moves which are calculated when a user picks
    up a piece */
    this._legalMoves; 

    var that = this;    

    // prototypes.js object used to represent chess piece 
    this.thing = new CommonThing ({
        x: this.x,
        y: this.y,
        width: 15,
        height: 15,
        zIndex: this.zIndex
    });
    this._circle = this.thing.addCircle ({
        radius: 10,
        x: this.thing.x + this.thing.width / 2,
        y: this.thing.y + this.thing.height / 2,
        color: this.color
    });

    // make draggable
    var legalMovesHighlighted = false;
    this.thing.addDragFunction (function (mouseX, mouseY) {
        if (that.player.playerNum !== NPCB._chessBoard._currPlayerNum) {
            return;
        }

        if (!legalMovesHighlighted) {
            //console.log ('highlighting legal moves');
            that.highlightLegalMoves (); 
            legalMovesHighlighted = true;
        }

        // calculate offset to center circle around cursor
        var mouseOffsetX, mouseOffsetY;
        mouseOffsetX = mouseX - that._circle.x;
        mouseOffsetY = mouseY - that._circle.y;
        that.thing.moveTo (
            that.thing.x + mouseOffsetX, 
            that.thing.y + mouseOffsetY, true);
    }, true);

    // make droppable
    this.thing.addDropFunction (function (mouseX, mouseY) {
        if (that.player.playerNum !== NPCB._chessBoard._currPlayerNum) {
            return;
        }
        //console.log ('dropping the piece');

        legalMovesHighlighted = false;

        var currPos = new NPCB._Point ({
            x: mouseX, y: mouseY
        });

        // find current slice

        var currSliceNum = 
            NPCB._chessBoard._getCurrSliceNum (currPos);

        var closestPlace = 
            NPCB._chessBoard._getClosestPlace (
                currPos, currSliceNum);

        var retArr = that.isLegalMove (closestPlace.boardPos);
        NPCB.debug && console.log ('retArr = ');
        NPCB.debug && console.log (retArr);
        if (retArr[0]) {
            that.movePieceTo (closestPlace, retArr[1]);
            NPCB._chessBoard._endTurn ();
        } else { // not a legal move, return piece to last place
            that.movePieceTo (that.place, undefined, true);
        }

        NPCB._chessBoard._unhighlightBoard (); 

    });
};

/*
Public static methods
*/

/*
Private static methods
*/

/*
Public instance methods
*/

/*
Preconditions:
    - _legalMoves is set 
Returns:
   [bool, string] - [<true if legal, false otherwise>, <move type>]
*/
NPCB._Piece.prototype.isLegalMove = function (boardPos) {
    var moves = this._legalMoves;
    var move, moveType;
    for (var i in moves) {
        move = moves[i][1]; 
        moveType = moves[i][0];
        if (boardPos[0] === move[0] &&
            boardPos[1] === move[1] &&
            boardPos[2] === move[2]) {

            return [true, moveType];
        }
    }
    return [false, null];
};

/*
Moves piece to a specified place if the move is legal. Performs the
same function that the drag and drop interface does.
*/
NPCB._Piece.prototype.makeMove = function (place) {
    var that = this; 
    var boardPos = place.boardPos;
    this._legalMoves = this.getLegalMoves (boardPos[0]);
    console.log ('this._legalMoves  = ');
    console.log (this._legalMoves);
    var retArr = this.isLegalMove (boardPos);
    if (retArr[0]) {
        this.movePieceTo (place, retArr[1]);
        NPCB._chessBoard._endTurn ();
        return true;
    } else { // not a legal move, return piece to last place
        return false;
    }
};


/*
Preconditions:
    - this.place is set
*/
NPCB._Piece.prototype.highlightLegalMoves = function () {
    var that = this;

    /*console.log ('this.place = ');
    NPCB.debug && console.log (this.place);*/
    if (!this.place) {
        proto.err ('highlightLegalMoves: this.place is not set');
        return;
    }

    var npcb = NPCB._chessBoard;
    var board = npcb._getBoardObj ();
    var highlightBoard = 
        npcb._getHighlightBoardObj ();
    var slices = npcb._slices;
    var currSliceNum = npcb._getCurrSliceNum (this.place.centroid);
    var currSlice = slices[currSliceNum];

    that._legalMoves = this.getLegalMoves (currSliceNum);
    //console.log ('legalMoves = ');
    //console.log (legalMoves);

    npcb._highlightMoves (that._legalMoves);

    /*console.log ('npcb = ');
    NPCB.debug && console.log (npcb);*/

    /*console.log ('slices = ');
    NPCB.debug && console.log (slices);
    NPCB.debug && console.log ('currSliceNum = ' + currSliceNum);*/
    /*console.log ('currSlice = ');
    NPCB.debug && console.log (currSlice);
    place = currSlice[0][0].getDuplicatePath ();
    place.color = 'red';
    highlightBoard.addPath (place);*/
};

// override in child prototype
NPCB._Piece.prototype.getLegalMoves = function (
    currSliceNum) {

    return [];
};

NPCB._Piece.prototype.movePieceTo = function (
    place, moveType, movingBack) {

    var movingBack = 
        typeof movingBack === 'undefined' ? false : movingBack; 
    var moveType = typeof moveType === 'undefined' ? '' : moveType; 
    var that = this; 

    if (moveType === 'capture') {
        NPCB._chessBoard._removePieceFromBoard (place.piece);
    }

    // move piece from one place object to another
    if (that.place) that.place.removePiece ();
    that.place = place;
    place.addPiece (that);

    // snap piece on canvas to current place
    that.thing.moveTo (
        place.centroid.x - that._circle.radius / 2 - 2, 
        place.centroid.y - that._circle.radius / 2 - 2, true);

    that.afterMovePieceTo (place, movingBack);

};

/*
override in child prototype
*/
NPCB._Piece.prototype.afterMovePieceTo = function (place) {
};

NPCB._Piece.prototype.checkPlaceMove = function (boardPos) {
    var piece = NPCB._chessBoard._getPlace (boardPos).piece;
    if (piece && piece.player === this.player) {
        return false;
    } else if (piece && piece.player !== this.player) {
        return ['capture', boardPos];
    } else {
        return ['move', boardPos];
    }
};

/*
Parameters:
    limit - the number of spaces that the piece can legally move 
Returns:
    array of arrays - [[moveType, boardPos], ...] 
*/
NPCB._Piece.prototype.getLegalMovesDir = function (
    direction, currPos, limit) {

    limit = typeof limit === 'undefined' ? Infinity : limit;
    /*console.log ('getLegalMovesDir');
    NPCB.debug && console.log ('currPos = ');
    NPCB.debug && console.log (currPos);
    NPCB.debug && console.log ('direction = ');
    NPCB.debug && console.log (direction);*/
    var that = this;  

    var legalMoves = [];

    var getNextMove;

    switch (direction) {
        case "up":
            getNextMove = function (boardPos) {
                var rank = boardPos[1] + 1;
                if (rank < 0 || rank > 3) { 
                    NPCB.debug && console.log ('recur getNextMove:');
                    NPCB.debug && console.log ('boardPos  = ');
                    NPCB.debug && console.log (boardPos );
                    legalMoves = 
                        legalMoves.concat (that.getLegalMovesDir (
                            'right', [
                                NPCB._chessBoard._getNextSliceNum (
                                    boardPos[0]),
                                boardPos[2], 
                                boardPos[1] + 1
                            ], limit)
                        );
                    NPCB.debug && console.log ('legalMoves recur = ');
                    NPCB.debug && console.log (legalMoves);
                    return false;
                }
                var boardPos = $.extend ([], boardPos);
                boardPos[1] = rank;
                return that.checkPlaceMove (boardPos);
            }
            break;
        case "down":
            getNextMove = function (boardPos) {
                var rank = boardPos[1] - 1;
                if (rank < 0 || rank > 3) {
                    return false;
                }
                var boardPos = $.extend ([], boardPos);
                boardPos[1] = rank;
                return that.checkPlaceMove (boardPos);
            }
            break;
        case "left":
            getNextMove = function (boardPos) {
                var file = boardPos[2] + 1;
                if (file < 0 || file > 3) { 
                    NPCB.debug && console.log ('recur getNextMove:');
                    NPCB.debug && console.log ('boardPos  = ');
                    NPCB.debug && console.log (boardPos );
                    legalMoves = 
                        legalMoves.concat (that.getLegalMovesDir (
                            'down', [
                                NPCB._chessBoard._getPrevSliceNum (
                                    boardPos[0]),
                                boardPos[2] + 1, 
                                boardPos[1]
                            ], limit)
                        );
                    NPCB.debug && console.log ('legalMoves recur = ');
                    NPCB.debug && console.log (legalMoves);
                    return false;
                }
                var boardPos = $.extend ([], boardPos);
                boardPos[2] = file;
                return that.checkPlaceMove (boardPos);
            }
            break;
        case "right":
            getNextMove = function (boardPos) {
                var file = boardPos[2] - 1;
                if (file < 0 || file > 3) return false;
                var boardPos = $.extend ([], boardPos);
                boardPos[2] = file;
                return that.checkPlaceMove (boardPos);
            }
            break;
        case "up-right":
            getNextMove = function (boardPos) {
                var rank = boardPos[1] + 1;
                var file = boardPos[2] - 1;
                if (file < 0 || rank < 0 || (rank > 3 && file < 0)) { 
                    return false;
                } else if (rank > 3 && file >= 0) { 
                    NPCB.debug && console.log ('recur ur getNextMove:');
                    NPCB.debug && console.log ('boardPos  = ');
                    NPCB.debug && console.log (boardPos);
                    legalMoves = 
                        legalMoves.concat (that.getLegalMovesDir (
                            'down-right', [
                                NPCB._chessBoard._getNextSliceNum (
                                    boardPos[0]),
                                boardPos[2], 
                                boardPos[1] + 1
                            ], limit)
                        );
                    return false;
                }
                var boardPos = $.extend ([], boardPos);
                boardPos[1] = rank;
                boardPos[2] = file;
                return that.checkPlaceMove (boardPos);
            }
            break;
        case "up-left":
            getNextMove = function (boardPos) {
                var rank = boardPos[1] + 1;
                var file = boardPos[2] + 1;
                NPCB.debug && console.log ('getNextMove ul:');
                NPCB.debug && console.log ('boardPos  = ');
                NPCB.debug && console.log (boardPos);
                if (file > 3 && rank > 3) { 
                    NPCB.debug && console.log ('recur > > getNextMove:');
                    NPCB.debug && console.log ('boardPos  = ');
                    NPCB.debug && console.log (boardPos);
                    legalMoves = 
                        legalMoves.concat (that.getLegalMovesDir (
                            'down-right', [
                                NPCB._chessBoard._getDiagonalSliceNum (
                                    boardPos[0]),
                                boardPos[1] + 1, 
                                boardPos[2] + 1
                            ], limit)
                        );
                    NPCB.debug && console.log ('legalMoves recur = ');
                    NPCB.debug && console.log (legalMoves);
                    return false;
                } else if (rank > 3) {
                    NPCB.debug && console.log ('recur ul > < getNextMove:');
                    NPCB.debug && console.log ('boardPos  = ');
                    NPCB.debug && console.log (boardPos);
                    legalMoves = 
                        legalMoves.concat (that.getLegalMovesDir (
                            'up-right', [
                                NPCB._chessBoard._getNextSliceNum (
                                    boardPos[0]),
                                boardPos[2], 
                                boardPos[1] + 1
                            ], limit)
                        );
                    NPCB.debug && console.log ('legalMoves recur = ');
                    NPCB.debug && console.log (legalMoves);
                    return false;
                } else if (file > 3) {
                    NPCB.debug && console.log ('recur ul < > getNextMove:');
                    NPCB.debug && console.log ('boardPos  = ');
                    NPCB.debug && console.log (boardPos);
                    legalMoves = 
                        legalMoves.concat (that.getLegalMovesDir (
                            'down-left', [
                                NPCB._chessBoard._getPrevSliceNum (
                                    boardPos[0]),
                                boardPos[2] + 1, 
                                boardPos[1] 
                            ], limit)
                        );
                    NPCB.debug && console.log ('legalMoves recur = ');
                    NPCB.debug && console.log (legalMoves);
                    return false;
                } 
                var boardPos = $.extend ([], boardPos);
                boardPos[1] = rank;
                boardPos[2] = file;
                return that.checkPlaceMove (boardPos);
            }
            break;
        case "down-right":
            getNextMove = function (boardPos) {
                var rank = boardPos[1] - 1;
                var file = boardPos[2] - 1;
                if (file < 0 || rank < 0) { 
                    return false;
                }
                var boardPos = $.extend ([], boardPos);
                boardPos[1] = rank;
                boardPos[2] = file;
                return that.checkPlaceMove (boardPos);
            }
            break;
        case "down-left":
            getNextMove = function (boardPos) {
                var rank = boardPos[1] - 1;
                var file = boardPos[2] + 1;
                if (file < 0 || rank < 0 || (rank < 0 && file > 3)) { 
                    return false;
                } else if (file > 3 && rank >= 0) { 
                    NPCB.debug && console.log ('recur dl getNextMove:');
                    NPCB.debug && console.log ('boardPos  = ');
                    NPCB.debug && console.log (boardPos);
                    legalMoves = 
                        legalMoves.concat (that.getLegalMovesDir (
                            'down-right', [
                                NPCB._chessBoard._getPrevSliceNum (
                                    boardPos[0]),
                                boardPos[2] + 1, 
                                boardPos[1] 
                            ], limit)
                        );
                    return false;
                } else if (rank > 3 && file >= 0) { 
                    return false;
                }
                var boardPos = $.extend ([], boardPos);
                boardPos[1] = rank;
                boardPos[2] = file;
                return that.checkPlaceMove (boardPos);
            }
            break;
        default:
            proto.err (
                '_Rook: getLegalMovesDir: default on switch ' + 
                direction);
    }

    var nextBoardPos = ['', currPos];
    while (true) {
        nextBoardPos = getNextMove (nextBoardPos[1]);
        if (!nextBoardPos) break;
        legalMoves.push (nextBoardPos);
        if (nextBoardPos[0] === 'capture') break;
        if (--limit === 0) break; 
    }

    return legalMoves;
}

/*
Private instance methods
*/



/***********************************************************************
* private _Rook prototype
***********************************************************************/

NPCB._Rook = function (argsDict) {
    argsDict = typeof argsDict === 'undefined' ? {} : argsDict;
    NPCB._Piece.call (this, argsDict);

    var defaultPropsDict = {
    };

    proto.unpack.apply (this, [argsDict, defaultPropsDict]);

    this._icon = this.thing.addText ({
        string: 'r',
        x: this.x + 2,
        y: this.y,
        color: 'white',
        fontSize: 13
    });
};

NPCB._Rook.prototype = 
    Object.create (NPCB._Piece.prototype);

/*
Public static methods
*/

/*
Private static methods
*/

/*
Public instance methods
*/

NPCB._Rook.prototype.getLegalMoves = function (currSliceNum) {

    var slices = NPCB._chessBoard._slices;
    var currSlice = slices[currSliceNum];
    var legalMoves = []; // [sliceNum, rank, file]
    legalMoves = legalMoves.concat (
        this.getLegalMovesDir ('up', this.place.boardPos));
    legalMoves = legalMoves.concat (
        this.getLegalMovesDir ('down', this.place.boardPos));
    legalMoves = legalMoves.concat (
        this.getLegalMovesDir ('right', this.place.boardPos));
    legalMoves = legalMoves.concat (
        this.getLegalMovesDir ('left', this.place.boardPos));

    return legalMoves;
};

/*
Private instance methods
*/



/***********************************************************************
* private _Bishop prototype
***********************************************************************/

NPCB._Bishop = function (argsDict) {
    argsDict = typeof argsDict === 'undefined' ? {} : argsDict;
    NPCB._Piece.call (this, argsDict);

    var defaultPropsDict = {
    };

    proto.unpack.apply (this, [argsDict, defaultPropsDict]);

    this._icon = this.thing.addText ({
        string: 'b',
        x: this.x,
        y: this.y,
        color: 'white',
        fontSize: 13
    });
};

NPCB._Bishop.prototype = 
    Object.create (NPCB._Piece.prototype);

/*
Public static methods
*/

/*
Private static methods
*/

/*
Public instance methods
*/

NPCB._Bishop.prototype.getLegalMoves = function (currSliceNum) {
    var slices = NPCB._chessBoard._slices;
    var currSlice = slices[currSliceNum];
    var legalMoves = []; // [sliceNum, rank, file]
    legalMoves = legalMoves.concat (
        this.getLegalMovesDir ('down-left', this.place.boardPos));
    legalMoves = legalMoves.concat (
        this.getLegalMovesDir ('down-right', this.place.boardPos));
    legalMoves = legalMoves.concat (
        this.getLegalMovesDir ('up-right', this.place.boardPos));
    legalMoves = legalMoves.concat (
        this.getLegalMovesDir ('up-left', this.place.boardPos));

    return legalMoves;
};

/*
Private instance methods
*/


/*
Private instance methods
*/



/***********************************************************************
* private _Queen prototype
***********************************************************************/

NPCB._Queen = function (argsDict) {
    argsDict = typeof argsDict === 'undefined' ? {} : argsDict;
    NPCB._Piece.call (this, argsDict);

    var defaultPropsDict = {
    };

    proto.unpack.apply (this, [argsDict, defaultPropsDict]);

    this._icon = this.thing.addText ({
        string: 'q',
        x: this.x,
        y: this.y,
        color: 'white',
        fontSize: 13
    });
};

NPCB._Queen.prototype = 
    Object.create (NPCB._Piece.prototype);

/*
Public static methods
*/

/*
Private static methods
*/

/*
Public instance methods
*/

NPCB._Queen.prototype.getLegalMoves = function (currSliceNum) {
    var slices = NPCB._chessBoard._slices;
    var currSlice = slices[currSliceNum];
    var legalMoves = []; // [sliceNum, rank, file]
    legalMoves = legalMoves.concat (
        this.getLegalMovesDir (
            'down-left', this.place.boardPos));
    legalMoves = legalMoves.concat (
        this.getLegalMovesDir (
            'down-right', this.place.boardPos));
    legalMoves = legalMoves.concat (
        this.getLegalMovesDir (
            'up-right', this.place.boardPos));
    legalMoves = legalMoves.concat (
        this.getLegalMovesDir (
            'up-left', this.place.boardPos));
    legalMoves = legalMoves.concat (
        this.getLegalMovesDir ('up', this.place.boardPos));
    legalMoves = legalMoves.concat (
        this.getLegalMovesDir ('down', this.place.boardPos));
    legalMoves = legalMoves.concat (
        this.getLegalMovesDir ('right', this.place.boardPos));
    legalMoves = legalMoves.concat (
        this.getLegalMovesDir ('left', this.place.boardPos));

    return legalMoves;
};

/*
Private instance methods
*/

/*
Private instance methods
*/



/***********************************************************************
* private _Knight prototype
***********************************************************************/

NPCB._Knight = function (argsDict) {
    argsDict = typeof argsDict === 'undefined' ? {} : argsDict;
    NPCB._Piece.call (this, argsDict);

    var defaultPropsDict = {
    };

    proto.unpack.apply (this, [argsDict, defaultPropsDict]);

    this._icon = this.thing.addText ({
        string: 'k',
        x: this.x,
        y: this.y,
        color: 'white',
        fontSize: 13
    });
};

NPCB._Knight.prototype = 
    Object.create (NPCB._Piece.prototype);

/*
Public static methods
*/

/*
Private static methods
*/

/*
Public instance methods
*/

NPCB._Knight.prototype.getLegalMoves = function (currSliceNum) {
    var slices = NPCB._chessBoard._slices;
    var currSlice = slices[currSliceNum];
    var legalMoves = []; // [sliceNum, rank, file]
    legalMoves = legalMoves.concat (
        this.getLegalMovesDir (
            ['up', 'up', 'right'], this.place.boardPos));
    legalMoves = legalMoves.concat (
        this.getLegalMovesDir (
            ['up', 'up', 'left'], this.place.boardPos));
    legalMoves = legalMoves.concat (
        this.getLegalMovesDir (
            ['up', 'right', 'right'], this.place.boardPos));
    legalMoves = legalMoves.concat (
        this.getLegalMovesDir (
            ['up', 'left', 'left'], this.place.boardPos));
    legalMoves = legalMoves.concat (
        this.getLegalMovesDir (
            ['down', 'down', 'right'], this.place.boardPos));
    legalMoves = legalMoves.concat (
        this.getLegalMovesDir (
            ['down', 'down', 'left'], this.place.boardPos));
    legalMoves = legalMoves.concat (
        this.getLegalMovesDir (
            ['down', 'right', 'right'], this.place.boardPos));
    legalMoves = legalMoves.concat (
        this.getLegalMovesDir (
            ['down', 'left', 'left'], this.place.boardPos));

    var currPos = this.place.boardPos;
    if (NPCB._chessBoard._sides > 4) {
        NPCB.debug && console.log ('extra knight moves');
        if (currPos[1] === 2 && currPos[2] === 3 ||
            currPos[1] === 3 && currPos[2] === 3) {
            legalMoves = legalMoves.concat (
                this.getLegalMovesDir (
                    ['left', 'up', 'up'], this.place.boardPos));
        }
        if (currPos[1] === 3 && currPos[2] === 2 ||
            currPos[1] === 3 && currPos[2] === 3) {
            legalMoves = legalMoves.concat (
                this.getLegalMovesDir (
                    ['left', 'left', 'up'], this.place.boardPos));
        }
    }

    return legalMoves;
};

NPCB._Knight.prototype.getLegalMovesDir = function (dir, currPos) {
    var that = this;  

    var legalMoves = [];
    currPos = $.extend (true, [], currPos);
    var lastPos = $.extend (true, [], currPos);
    var nextDir, rank, file; 
    while (dir.length > 0) {
        /*console.log ('_Knight: getLegalMovesDir: dir = ');
        NPCB.debug && console.log (dir);
        NPCB.debug && console.log ('currPos = ');
        NPCB.debug && console.log (currPos);*/
        nextDir = dir[0]; 
        dir = dir.slice (1);
        switch (nextDir) {
            case 'up':
                rank = currPos[1] + 1;
                if (rank < 0 || rank > 3) {
                    dir = this._rotateDirArr (dir, true); 
                    currPos[0] = NPCB._chessBoard._getNextSliceNum (
                        lastPos[0]);
                    currPos[1] = lastPos[2];
                    currPos[2] = lastPos[1];
                } else {
                    currPos[1] = rank;
                }
                break;
            case 'down':
                rank = currPos[1] - 1;
                if (rank < 0 || rank > 3) {
                    return legalMoves;
                } else {
                    currPos[1] = rank;
                }
                break;
            case 'left':
                file = currPos[2] + 1;
                if (file < 0 || file > 3) {
                    dir = this._rotateDirArr (dir, false); 
                    currPos[0] = NPCB._chessBoard._getPrevSliceNum (
                        lastPos[0]);
                    currPos[1] = lastPos[2];
                    currPos[2] = lastPos[1];
                } else {
                    currPos[2] = file;
                }
                break;
            case 'right':
                file = currPos[2] - 1;
                if (file < 0 || file > 3) {
                    return legalMoves;
                } else {
                    currPos[2] = file;
                }
                break;
            default:
                proto.err (
                    '_Knight: getLegalMovesDir: default on switch');
        }
        lastPos = $.extend (true, [], currPos);
    }
    /*console.log ('currPos = ');
    NPCB.debug && console.log (currPos);*/
    var move = this.checkPlaceMove (currPos);
    if (move) legalMoves.push (move);
    return legalMoves;

};


/*
Private instance methods
*/

NPCB._Knight.prototype._rotateDirArr = function (dir, clockwise) {
    return dir.map (function (elem) { 
        switch (elem) {
            case 'up':
                return clockwise ? 'right' : 'left';
            case 'down':
                return clockwise ? 'left' : 'right';
            case 'left':
                return clockwise ? 'up' : 'down';
            case 'right':
                return clockwise ? 'down' : 'up';
        }
    });
};

/*
Private instance methods
*/


/***********************************************************************
* private _King prototype
***********************************************************************/

NPCB._King = function (argsDict) {
    argsDict = typeof argsDict === 'undefined' ? {} : argsDict;
    NPCB._Piece.call (this, argsDict);

    var defaultPropsDict = {
    };

    proto.unpack.apply (this, [argsDict, defaultPropsDict]);

    this._icon = this.thing.addText ({
        string: 'K',
        x: this.x,
        y: this.y,
        color: 'white',
        fontSize: 13
    });
};

NPCB._King.prototype = 
    Object.create (NPCB._Piece.prototype);

/*
Public static methods
*/

/*
Private static methods
*/

/*
Public instance methods
*/

NPCB._King.prototype.getLegalMoves = function (
    currSliceNum) {

    var slices = NPCB._chessBoard._slices;
    var currSlice = slices[currSliceNum];
    var legalMoves = []; // [sliceNum, rank, file]
    legalMoves = legalMoves.concat (
        this.getLegalMovesDir (
            'down-left', this.place.boardPos, true));
    legalMoves = legalMoves.concat (
        this.getLegalMovesDir (
            'down-right', this.place.boardPos, true));
    legalMoves = legalMoves.concat (
        this.getLegalMovesDir (
            'up-right', this.place.boardPos, true));
    legalMoves = legalMoves.concat (
        this.getLegalMovesDir (
            'up-left', this.place.boardPos, true));
    legalMoves = legalMoves.concat (
        this.getLegalMovesDir ('up', this.place.boardPos, true));
    legalMoves = legalMoves.concat (
        this.getLegalMovesDir ('down', this.place.boardPos, true));
    legalMoves = legalMoves.concat (
        this.getLegalMovesDir ('right', this.place.boardPos, true));
    legalMoves = legalMoves.concat (
        this.getLegalMovesDir ('left', this.place.boardPos, true));

    return legalMoves;
};

/*
Private instance methods
*/

/*
Private instance methods
*/


/***********************************************************************
* private _Pawn prototype
***********************************************************************/

NPCB._Pawn = function (argsDict) {
    argsDict = typeof argsDict === 'undefined' ? {} : argsDict;
    NPCB._Piece.call (this, argsDict);

    var defaultPropsDict = {
    };

    proto.unpack.apply (this, [argsDict, defaultPropsDict]);

    this._dir = null;
    this._origDir = null;
    this._hasMoved = false;

    this._icon = this.thing.addText ({
        string: 'p',
        x: this.x,
        y: this.y,
        color: 'white',
        fontSize: 13
    });
};

NPCB._Pawn.prototype = 
    Object.create (NPCB._Piece.prototype);

/*
Public static methods
*/

/*
Private static methods
*/

/*
Public instance methods
*/


/*
Initializes pawn movement direction when pawn is first placed on board.
Also changes direction when pawn moves to next slice.
*/
NPCB._Pawn.prototype.afterMovePieceTo = function (place, movingBack) {
    if (place.boardPos[0] % 2 === 0) {
        if (this._origDir && this._origDir === 'left') {
            this._dir = 'down';
        } else {
            this._dir = 'up';
        }
    } else {
        if (this._origDir && this._origDir === 'up') {
            this._dir = 'right';
        } else {
            this._dir = 'left';
        }
    }
    if (this._origDir === null) {
        this._origDir = this._dir;
    } else {
        if (!movingBack) {
            this._hasMoved = true;
        }
    }
};

NPCB._Pawn.prototype.getLegalMoves = function (currSliceNum) {
    var slices = NPCB._chessBoard._slices;
    var currSlice = slices[currSliceNum];
    var legalMoves = []; // [sliceNum, rank, file]

    var prospectiveMoves =
        this.getLegalMovesDir (this._dir, this.place.boardPos, 
            this._hasMoved ? 1 : 2);

    for (var i in prospectiveMoves) {
        if (prospectiveMoves[i][0] === 'move') { 
            legalMoves.push (prospectiveMoves[i]);
        }
    }

    var captureDirs = []; 
    if (this._dir === 'up' || this._dir === 'down') {
        captureDirs = [this._dir + '-right', this._dir + '-left'];
    } else {
        captureDirs = ['down-' + this._dir, 'up-' + this._dir];
    }

    var prospectiveCaptures = 
        this.getLegalMovesDir (captureDirs[0], this.place.boardPos, 1);
    prospectiveCaptures = prospectiveCaptures.concat (
        this.getLegalMovesDir (captureDirs[1], this.place.boardPos, 1));

    for (var i in prospectiveCaptures) {
        if (prospectiveCaptures[i][0] === 'capture') { 
            legalMoves.push (prospectiveCaptures[i]);
        }
    }

    return legalMoves;
};

/*
Private instance methods
*/

/*
Private instance methods
*/


/***********************************************************************
* _Color prototype 
***********************************************************************/

/*
Used for storing color data and procedurally generating new colors
*/

NPCB._Color = function (argsDict) {
    argsDict = typeof argsDict === 'undefined' ? {} : argsDict;

    var defaultPropsDict = {
        rgb: [0, 0, 0],
        offset: 500
    };
    this._isAscending = [true, true, true];

    proto.unpack.apply (this, [argsDict, defaultPropsDict]);
};


/*
Public static methods
*/

/*
Private static methods
*/

/*
Public instance methods
*/

NPCB._Color.prototype.getColorStr = function () {    
    return 'rgb(' + this.rgb[0] + ',' + this.rgb[1] + 
        ',' + this.rgb[2] + ')';
};


NPCB._Color.prototype.modifyColor = function (index) {
    var val = this.rgb[0] + this.rgb[1] + this.rgb[2];
    var newVal = 
        val + 2 * Math.random () * this.offset - this.offset;
    var valRatio = newVal / val;
    var colorComponent = Math.floor (this.rgb[index] * valRatio);
    if (colorComponent > 255) {
        colorComponent = colorComponent - colorComponent % 255;
    } else if (colorComponent < -255) {
        colorComponent = - (colorComponent % 255);
    } else if (colorComponent < 0) {
        colorComponent = -colorComponent;
    }
    return colorComponent;
};

/*
Generate colors using random offset algorithm
*/
NPCB._Color.prototype.generateNewColor = function () {
    var newColor = new NPCB._Color ({
        rgb: [
            this.modifyColor (0), 
            this.modifyColor (1), 
            this.modifyColor (2)
        ],
        offset: this.offset
    });
    return newColor;
};


/*
Private instance methods
*/


NPCB._Player = function (argsDict) {
    argsDict = typeof argsDict === 'undefined' ? {} : argsDict;

    var defaultPropsDict = {
        homeSliceNum: undefined,
        playerNum: undefined,
        color: null // _Color object
    };

    proto.unpack.apply (this, [argsDict, defaultPropsDict]);

    var pieceArgsDict = {
        player: this,
        color: this.color.getColorStr ()
    };

    this.pieces = [];
    this.pieces['pawn0'] = new NPCB._Pawn (pieceArgsDict);
    this.pieces['pawn1'] = new NPCB._Pawn (pieceArgsDict);
    this.pieces['pawn2'] = new NPCB._Pawn (pieceArgsDict);
    this.pieces['pawn3'] = new NPCB._Pawn (pieceArgsDict);
    this.pieces['pawn4'] = new NPCB._Pawn (pieceArgsDict);
    this.pieces['pawn5'] = new NPCB._Pawn (pieceArgsDict);
    this.pieces['pawn6'] = new NPCB._Pawn (pieceArgsDict);
    this.pieces['pawn7'] = new NPCB._Pawn (pieceArgsDict);
    this.pieces['rook0'] = new NPCB._Rook (pieceArgsDict);
    this.pieces['knight0'] = new NPCB._Knight (pieceArgsDict);
    this.pieces['bishop0'] = new NPCB._Bishop (pieceArgsDict);
    this.pieces['queen'] = new NPCB._Queen (pieceArgsDict);
    this.pieces['king'] = new NPCB._King (pieceArgsDict);
    this.pieces['bishop1'] = new NPCB._Bishop (pieceArgsDict);
    this.pieces['knight1'] = new NPCB._Knight (pieceArgsDict);
    this.pieces['rook1'] = new NPCB._Rook (pieceArgsDict);

    var region = NPCB._chessBoard._world.currRegion;
    for (var i in this.pieces) {
        region.addThing (this.pieces[i].thing);
    }

    if (this.homeSliceNum !== undefined) {
        var homeSlice = NPCB._chessBoard._slices[this.homeSliceNum];
        var prevSlice = 
            NPCB._chessBoard._slices[NPCB._chessBoard._getPrevSliceNum (
                this.homeSliceNum)];
        this.pieces['pawn7'].movePieceTo (homeSlice[1][0]);
        this.pieces['pawn6'].movePieceTo (homeSlice[1][1]);
        this.pieces['pawn5'].movePieceTo (homeSlice[1][2]);
        this.pieces['pawn4'].movePieceTo (homeSlice[1][3]);
        this.pieces['pawn3'].movePieceTo (prevSlice[3][1]);
        this.pieces['pawn2'].movePieceTo (prevSlice[2][1]);
        this.pieces['pawn1'].movePieceTo (prevSlice[1][1]);
        this.pieces['pawn0'].movePieceTo (prevSlice[0][1]);
        this.pieces['rook1'].movePieceTo (homeSlice[0][0]);
        this.pieces['knight1'].movePieceTo (homeSlice[0][1]);
        this.pieces['bishop1'].movePieceTo (homeSlice[0][2]);
        this.pieces['queen'].movePieceTo (homeSlice[0][3]);
        this.pieces['king'].movePieceTo (prevSlice[3][0]);
        this.pieces['bishop0'].movePieceTo (prevSlice[2][0]);
        this.pieces['knight0'].movePieceTo (prevSlice[1][0]);
        this.pieces['rook0'].movePieceTo (prevSlice[0][0]);
    }
};

/*
Public static methods
*/

/*
Private static methods
*/

/*
Public instance methods
*/

NPCB._Player.prototype.getPiece = function (piece) {
    if (!this.pieces[piece]) {
        console.log ('Error: getPiece: invalid argument ' + piece);
    }
    return this.pieces[piece];
};

/*
Private instance methods
*/


