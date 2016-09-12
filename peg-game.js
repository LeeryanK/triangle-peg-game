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

  function Jump() {

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
    var removedIndex = board.getRemovedIndex(i);

    if (removedIndex !== null && board.isEmpty(i) && board.isOccupied(removedIndex)) {
      this.end = i;
      board.removePeg(this.start);
      board.removePeg(removedIndex);
      board.addPeg(i);
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

  function Board() {
    this.board_ = new Array(15);
  }

  Board.prototype.resetBoard = function() {
    this.board_ = new Array(15);
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

  // TODO: Add Board.prototype.{isEmpty, isOccupied, addPeg, removePeg} functions.
})();