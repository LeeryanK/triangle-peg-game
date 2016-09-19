(function() {
  var board; // TODO: board = new Board(); later on...

  var HAS_TOUCH_EVENTS = 'ontouchstart' in document.documentElement;

  /*
  function isLegalMove(vectorOrIndex1, vectorOrIndex2) {
    var v1 = typeof vectorOrIndex1 === 'number' ? getVector(vectorOrIndex1) :
      vectorOrIndex1;
    var v2 = typeof vectorOrIndex2 === 'number' ? getVector(vectorOrIndex2) :
      vectorOrIndex2;

    var adx = Math.abs(v2.x - v1.x); // Absolute delta-x.
    var ady = Math.abs(v2.y - v1.y); // Absolute delta-y.

    return (ady === 2 && adx === 2) || (ady === 0 && adx === 4);
  }
  */

  function Vector(x, y) {
    this.x = x | 0;
    this.y = y | 0;
  }

  /**
   * @constructor
   * Represents a peg jump.
   * @param {Board} board The board that the jump was made on.
   */
  function Jump(board) {
    this.board = board;
  }

  /**
   * Sets the start index of the jump.
   * @param {number} i The start index of the jump.
   * @return {void}
   */
  Jump.prototype.start_ = function(i) {
    this.start = i;
    this.state++;
  };

  /**
   * Sets the end index of the jump and completes it if the jump is legal.
   * @param {number} i The end index of the jump.
   * @return {boolean} True if the jump is legal, false if the jump is illegal.
   */
  Jump.prototype.end_ = function(i) {
    var removedIndex = this.board.getRemovedIndex(i);

    if (removedIndex !== null && this.board.isEmpty(i) && this.board.isOccupied(removedIndex)) {
      this.end = i;
      this.board.removePeg(this.start);
      this.board.removePeg(removedIndex);
      this.board.addPeg(i);
      this.state++;

      return true;
    }

    return false;
  };

  Jump.prototype.processUserInput = function(i) {
    switch (this.state) {
      case 0:
        this.start_(i);
        break;
      case 1:
        this.end_(i);
        break;
    }
  };

  function Board(viewContainer, namespace) {
    this.board_ = new Array(15);
    this.jumps = [];
    this.view = new BoardView(viewContainer, namespace, this);
  }

  Board.prototype.resetBoard = function() {
    this.board_ = new Array(15);
  };

  /**
   * @enum
   * Describes whether a hole is empty or occupied
   */
  Board.prototype.States = {
    EMPTY: 0,
    OCCUPIED: 1
  };

  /**
   * Get the row of a peg given its index (bottom row is 0).
   * @param {number} The index of the peg.
   * @return {number} The row of the peg.
   */
  Board.prototype.getRow_ = function(i) {
    if (i <= 4)
      return 0;
    else if (i <= 8)
      return 1;
    else if (i <= 11)
      return 2;
    else if (i <= 13)
      return 3;
    else if (i <= 14)
      return 4;
  };

  /**
   * Get the 0-based position of the peg in its row for a given index.
   * @param {number} The index of the peg (0 is the bottom left peg).
   * @return {number} The 0-based position of the peg in its row.
   */
  Board.prototype.getColumn_ = function(i) {
    var firstColumnIndices = [0, 5, 9, 12, 14];
    var row = this.getRow_(i);

    return i - firstColumnIndices[row];
  };

  /**
   * Returns a vector of the coordinates of the given index. (Bottom left
   *   peg is (0, 0))
   * @param {number} i The index of the peg (0 is bottom left).
   * @return {Vector} The coordinates of the given index.
   */
  Board.prototype.getVector = function(i) {
    var row = this.getRow_(i);
    var column = this.getColumn_(i);
    return new Vector(row + column * 2, row);
  };

  /**
   * Takes a vector and returns the index of the peg position.
   * @param {Vector} v The vector of the peg position.
   * @return {number} The index of the peg position (bottom left is 0).
   */
  Board.prototype.getIndex = function(v) {
    var firstIndexOfRows = [0, 5, 9, 12, 14];
    return firstIndexOfRows[v.y] + (v.x - v.y) / 2;
  };

  /**
   * Get the index of the removed peg after a jump.
   * @param {number} i1 The index of the jumping peg's start position.
   * @param {number} i2 The index of the jumping peg's end position.
   * @return {?number} The index of the removed peg or null if jump indices
   *   were illegal.
   */
  Board.prototype.getRemovedIndex = function(i1, i2) {
    var v1 = this.getVector_(i1);
    var v2 = this.getVector_(i2);

    var dx = v2.x - v1.x; // Delta-x.
    var dy = v2.y - v1.y; // Delta-y.

    var adx = Math.abs(dx);
    var ady = Math.abs(dy);

    if (ady === 2 && adx === 2)
      return this.getIndex_(new Vector(v1.x + dx / 2, v1.y + dy / 2));
    else if (ady === 0 && adx === 4)
      return this.getIndex_(new Vector(v1.x + dx / 2, v1.y));
    else
      return null;
  };

  Board.prototype.isEmpty = function(i) {
    return this.board_[i] === this.States.EMPTY;
  };

  Board.prototype.isOccupied = function(i) {
    return this.board_[i] === this.States.OCCUPIED;
  };

  Board.prototype.addPeg = function(i) {
    this.board_[i] = this.States.OCCUPIED;
    this.view.updatePeg(i);
  };

  Board.prototype.removePeg = function(i) {
    this.board_[i] = this.States.EMPTY;
    this.view.updatePeg(i);
  };

  /**
   * @constructor
   * A class for handling the board view HTML. The CSS is in a separate file.
   * @param {HTMLElement} container The container element to add all the child elements to.
   * @param {string} namespace The namespace for HTML attributes.
   * @param {Board] board The board that this view displays.
   */
  function BoardView(container, namespace, board) {
    this.namespace = '' + namespace;
    this.container = container;
    this.board = board;

    this.setUpElements_();
    this.adjustContainerSize_();
    this.updateAllPegs();
  }

  /**
   * @private
   * @param {string} str The string to be namespaced.
   * @return {string} The namespaced string.
   */
  BoardView.prototype.ns_ = function(str) {
    return this.namepsace + str;
  };

  /**
   * @private
   * Sets up HTML elements used for holes and pegs.
   */
  BoardView.prototype.setUpElements_ = function() {
    this.holes_ = new Array(15);
    this.pegs_ = new Array(15);

    var i = 15;
    while (i--) {
      var hole = document.createElement('div');
      var peg = document.createElement('div');

      hole.id = this.ns_('peg-game-hole-' + i);
      hole.zIndex = -1;

      peg.id = this.ns_('peg-game-peg-' + i);
      peg.addEventListener('ontouchend', this.getSelectHandler_(i));
      peg.addEventListener('click', this.getSelectHandler_(i));

      this.holes_[i] = hole;
      this.container.appendChild(hole);
      this.pegs_[i] = peg;
      this.container.appendChild(peg);
    }
  };

  /**
   * @private
   * Adjusts the container size so it fits the screen.
   */
  BoardView.prototype.adjustContainerSize_ = function() {

  };

  /**
   * @private
   * Return a handler that handles when a peg is selected, either by click or
   *   tap.
   * @param {number} i The index of the peg.
   * @return {function} The click or tap handler.
   */
  BoardView.prototype.getSelectHandler_ = function(i) {
    return (function() {
      var jumps = this.board.jumps;
      var last = jumps[jumps.length - 1];

      switch (last.state) {

      }
    }).bind(this);
  };

  /**
   * Updates the visibility of a peg, based on whether the hole is occupied;
   * @param {number} i The index of the peg to update.
   */
  BoardView.prototype.updatePeg = function(i) {
    var holeClasses = this.holes_[i].classList;

    if (this.board.isOccupied(i)) {
      holeClasses.add(this.ns_('peg-game-visible-peg'));
      holeClasses.remove(this.ns_('peg-game-hidden-peg'));
    } else {
      holeClasses.add(this.ns_('peg-game-hidden-peg'));
      holeClasses.remove(this.ns_('peg-game-visible-peg'));
    }
  };

  BoardView.prototype.updateAllPegs = function() {
    var i = 15;
    while (i--) {
      this.updatePeg(i);
    }
  };
})();