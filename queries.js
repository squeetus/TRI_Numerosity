const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const async = require('async');


/*
  Connect to DB
*/
(async function() {
  // Connection URL
  const url = 'mongodb://localhost:27017/TRI_Parser';
  // Database Name
  const dbName = 'TRI_Parser';
  const client = new MongoClient(url);

  try {
    // Use connect method to connect to the Server
    await client.connect();

    const db = client.db(dbName);

    async.series([
      function(callback) {
        removeUnusedFacilities(db, function(data) {
          console.log('removed', data, 'unused facilities');
          callback(null);
        });
      },

      function(callback) {
        query1(db, function(data) {
          console.log(data.length);
          callback(null);
        });
      },

      // function(callback) {
      //   query1(db, function(data) {
      //     console.log(data.length);
      //     callback(null);
      //   });
      // }
    ]);

  } catch (err) {
    console.log('!', err.stack);
  }
})();

// query all facilities
let query1 = function(db, cb) {
  const facilities = db.collection('facilities');
  facilities.find().toArray(function(err, docs) {
    assert.equal(err, null);
    cb(docs);
  });
};


/*
    Remove facilities with no corresponding usage
*/
var removeUnusedFacilities = function(db, cb) {
  async.waterfall([
    function(callback) {
        // code a
        findUsedFacilities(db, function(data) {
            // console.log(data);
            callback(null, data);
        });
    },
    function(ids, callback) {
        // code b
        deleteUnusedFacilities(db, ids, function(data) {
            // console.log(data);
            callback(null, data);
        });
    }], function(err, result) {
        if(err) cb(err);
        // console.log(result);
        cb(result);
    });
};
// get distinct facility IDs from usage
let findUsedFacilities = function(db, cb) {
  const usage = db.collection('usage');

  usage.distinct("id", function(err, ids) {
    assert.equal(err, null);
    cb(ids);
  });
};
// remove facilities if they do not appear in distinct ID list
let deleteUnusedFacilities = function(db, ids, cb) {
  const facilities = db.collection('facilities');

  facilities.deleteMany({"id": {$nin: ids}}, function(err, data) {
    assert.equal(err, null);
    cb(data.result.n);
  });
};



// find the total usage in each state
