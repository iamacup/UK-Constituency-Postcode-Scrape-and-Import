
Database = require('arangojs').Database;

db = new Database('http://127.0.0.1:8529');
db.useDatabase('dump');
db.useBasicAuth('root', process.argv[2]);

module.exports = db;

module.exports.createConstituencyDocument = async(postcode, constituencyName, data) => {
  const collection = db.collection('constituencyPostcodes');

  return await collection.save({
    _key: postcode,
    constituencyName,
    data,
  });
};

