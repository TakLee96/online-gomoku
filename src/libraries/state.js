import { GRID_SIZE } from 'config';

var resolve = {
  '^' : (i, j) => { return [ i - 1, j     ]; },
  'v' : (i, j) => { return [ i + 1, j     ]; },
  '<' : (i, j) => { return [ i    , j - 1 ]; },
  '>' : (i, j) => { return [ i    , j + 1 ]; },
  '<^': (i, j) => { return [ i - 1, j - 1 ]; },
  '^>': (i, j) => { return [ i - 1, j + 1 ]; },
  '<v': (i, j) => { return [ i + 1, j - 1 ]; },
  'v>': (i, j) => { return [ i + 1, j + 1 ]; }
};

function _outOfBound(i, j) {
  return i < 0 || i >= GRID_SIZE || j < 0 || j >= GRID_SIZE;
}

function _countDirection(i, j, board, direction, player) {
  if (_outOfBound(i, j) || board[i][j] !== player)
    return 0;
  var next = resolve[direction](i, j);
  return 1 + _countDirection(next[0], next[1], board, direction, player);
}

function _win(i, j, board) {
  var player = board[i][j];
  if (_countDirection(i, j, board, '^',  player) + _countDirection(i, j, board, 'v',  player) - 1 === 5)
    return 1;
  if (_countDirection(i, j, board, '<',  player) + _countDirection(i, j, board, '>',  player) - 1 === 5)
    return 2;
  if (_countDirection(i, j, board, '<^', player) + _countDirection(i, j, board, 'v>', player) - 1 === 5)
    return 3;
  if (_countDirection(i, j, board, '^>', player) + _countDirection(i, j, board, '<v', player) - 1 === 5)
    return 4;
  return false;
}

var _dir = [
  null,
  ['^', 'v'],
  ['<', '>'],
  ['<^', 'v>'],
  ['^>', '<v']
];
function _append(i, j, d, b, w, r) {
  if (_outOfBound(i, j) || b[i][j] != w)
    return;
  r.push([i, j]);
  [i, j] = resolve[d](i, j);
  _append(i, j, d, b, w, r);
}
function _build(last, code, board) {
  var retval = [ last ];
  var [i, j] = last;
  var [a, b] = _dir[code];
  var who = board[i][j];
  _append(i, j, a, board, who, retval);
  _append(i, j, b, board, who, retval);
  return retval;
}

export default class State {
  static GRID_SIZE = GRID_SIZE;
  static EMPTY = 0;
  static BLACK = 1;
  static WHITE = 2;

  static other (who) {
    return 3 - who;
  }

  constructor () {
    this._board = [];
    for (let i = 0; i < GRID_SIZE; i++) {
      this._board[i] = [];
      for (let j = 0; j < GRID_SIZE; j++) {
        this._board[i][j] = State.EMPTY;
      }
    }
    this._history = [];
    this._win = false;
    this.highlight = null;
  }

  get next () {
    return this._history.length % 2 + 1;
  }

  get isWin () {
    return this._win;
  }

  get isEnd () {
    return this._win || this._history.length === GRID_SIZE * GRID_SIZE;
  }

  get last () {
    return this._history[this._history.length - 1];
  }

  get(i, j) {
    return this._board[i][j];
  }

  canMove (i, j, who) {
    return (
      !this.isEnd &&
      who === this.next &&
      !_outOfBound(i, j) &&
      this.get(i, j) === State.EMPTY
    );
  }

  play (i, j) {
    const next = this.next;
    this._board[i][j] = next;
    this._history.push([i, j]);
    this._win = _win(i, j, this._board);
    if (this._win) {
      this.highlight = _build(this.last, this._win, this._board);
    }
  }

  rewind () {
    var [i, j] = this._history.pop();
    this._win = false;
    this._board[i][j] = State.EMPTY;
    var highlight = this.highlight;
    this.highlight = null;
    return [i, j, highlight];
  }

  winner () {
    if (this.isWin)
      return State.other(this.next);
    return State.EMPTY;
  }
}
