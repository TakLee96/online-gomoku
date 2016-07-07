import skygear from 'skygear';

import State from './state';

const User = skygear.Record.extend('user');
// {
//   nickname: string,
//   status: "online" | "ingame" | "offline" | "history",
//   win: number,
//   lose: number,
//   unfinished: number
// }
const Game = skygear.Record.extend('game');
// {
//   opponentNickname: string,
//   opponentId: string,
//   history: reference,
//   isBlue: boolean,
//   status: "win" | "lose" | "unfinished",
//   numMoves: number
// }
const History = skygear.Record.extend('history');
// {
//   blue: string,
//   green: string,
//   moves: string[]
// }

export function postChallenge(userid, data) {
  data['_id'] = id();
  skygear.pubsub.publish(userid, data);
}

export function waitChallenge(receive, accept, refuse, confirm) {
  skygear.on(id(), (data) => {
    if (data.challenge) {
      receive(data);
    } else if (data.accept) {
      accept(data);
    } else if (data.confirm) {
      confirm(data);
    } else {
      refuse(data);
    }
  });
}

export function terminateWaitChallenge() {
  skygear.off(id());
}

export function gameActive(handler) {
  skygear.on('game-'+id(), (data) => handler(data.i, data.j));
}

export function reportMove(i, j, userid) {
  skygear.pubsub.publish('game-'+userid, { i, j });
}

export function online() {
  return !(!skygear.currentUser);
}

function id() {
  if (!skygear.currentUser)
    throw new Error('user is not online!');
  return skygear.currentUser.id;
}

export function login(username, password) {
  return skygear.loginWithUsername(username, password);
}

export function signup(username, nickname, password, file) {
  return skygear.signupWithUsername(username, password)
    .then((user) => setProfile({
      nickname: nickname,
      status: 'online',
      win: 0,
      lose: 0,
      unfinished: 0,
      avatar: new skygear.Asset({ name: 'avatar', file })
    }, user.id));
}

export function logoutUser() {
  return setStatus('offline').then(() => skygear.logout());
}

export function getGames() {
  var query = new skygear.Query(Game);
  query.equalTo('_created_by', id());
  query.addDescending('_created_at');
  return skygear.publicDB.query(query);
}

export function getGame(gameId) {
  var query = new skygear.Query(Game);
  query.equalTo('_id', gameId);
  query.transientInclude('history');
  return skygear.publicDB.query(query);
}

export function saveGameAndHistory(data, myNickname) {
  var isBlue = (data.confirm) ? true : false;
  var history = new History({
    blue: (isBlue) ? myNickname : data.nickname,
    green: (isBlue) ? data.nickname : myNickname,
    moves: []
  });
  var game = new Game({
    opponentNickname: data.nickname,
    opponentId: data._id,
    history: new skygear.Reference(history),
    isBlue: data.confirm || false,
    status: 'unfinished',
    numMoves: -1
  });
  return skygear.publicDB.save([history, game]);
}

export function getHistory(historyId) {
  var query = new skygear.Query(History);
  query.equalTo('_id', historyId);
  return skygear.publicDB.query(query);
}

export function saveHistory(gameId, state) {
  return getGame(gameId).then((records) => {
    var game = records[0];
    var status = {
      [State.EMPTY]: 'unfinished',
      [State.BLACK]: (game.isBlue) ? 'win' : 'lose',
      [State.WHITE]: (game.isBlue) ? 'lose' : 'win'
    };
    game.numMoves = state._history.length;
    game.status = status[state.winner()];

    var history = records[0].$transient['history'];
    history.moves = state._history;

    return skygear.publicDB.save([history, game]);
  }).then((result) => {
    if (result.errors[0] || result.errors[1]) console.error(result.errors);
    return saveGameResult(result.savedRecords[1].status);
  });
}

function saveGameResult(field) {
  var query = new skygear.Query(User);
  query.equalTo('_id', id());
  return skygear.publicDB.query(query)
    .then((records) => {
      var record = records[0];
      record[field] += 1;
      return skygear.publicDB.save(record);
    });
}

export function getProfile() {
  var query = new skygear.Query(User);
  query.equalTo('_id', id());
  return skygear.publicDB.query(query);
}

export function setProfile(config) {
  var query = new skygear.Query(User);
  query.equalTo('_id', id());
  return skygear.publicDB.query(query)
    .then((records) => {
      var record = records[0];
      Object.assign(record, config);
      return skygear.publicDB.save(record);
    });
}

export function setStatus(status) {
  return setProfile({ status }, id());
}

export function getUsers() {
  var query = new skygear.Query(User);
  query.notEqualTo('_id', id());
  query.addDescending('status');
  return skygear.publicDB.query(query);
}

export function getUsersWithStatus(status) {
  var query = new skygear.Query(User);
  query.equalTo('status', status);
  query.notEqualTo('_id', id());
  query.addDescending('_updated_at');
  return skygear.publicDB.query(query);
}
