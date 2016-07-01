import skygear from 'skygear';

const User = skygear.Record.extend('user');
const History = skygear.Record.extend('history');

export function getAllHistory(userid) {
  var query = new skygear.Query(History);
  query.equalTo('_created_by', userid);
  return skygear.publicDB.query(query);
}

export function saveHistory(history) {
  return skygear.publicDB.save(new History(history));
}

export function getNickname(userid) {
  var query = new skygear.Query(User);
  query.equalTo('_created_by', userid);
  return skygear.publicDB.query(query);
}

export function setNickname(nickname, userid) {
  var query = new skygear.Query(User);
  query.equalTo('_created_by', userid);
  return skygear.publicDB.query(query)
    .then((records) => {
      var record = records[0];
      record['nickname'] = nickname;
      return skygear.publicDB.save(record);
    });
}

export function setStatus(status, userid) {
  var query = new skygear.Query(User);
  query.equalTo('_created_by', userid);
  return skygear.publicDB.query(query)
    .then((records) => {
      var record = records[0];
      record['status'] = status;
      return skygear.publicDB.save(record);
    }).then(() => {
      console.log("status updated to: %o", status);
    }, (error) => {
      console.error(error)
    });
}

export function getUsersWithStatus(status, userid) {
  var query = new skygear.Query(User);
  query.equalTo('status', status);
  query.notEqualTo('_created_by', userid);
  return skygear.publicDB.query(query);
}