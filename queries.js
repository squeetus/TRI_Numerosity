const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const async = require('async');

var usage;
var facilities;

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

    usage = db.collection('usage');
    facilities = db.collection('facilities');

    async.series([
      function(callback) {
        removeUnusedFacilities(db, function(data) {
          console.log('removed', data, 'unused facilities');
          callback(null);
        });
      },

      function(callback) {
        getAllFacilities(db, function(data) {
          console.log('there are', data.length, 'facilities in the database');
          callback(null);
        });
      },

      function(callback) {
        getAllUsage(db, function(data) {
          console.log('there are', data.length, 'chemical uses in the database');
          callback(null);
        });
      },

      function(callback) {
        countUsageByState(db, function(data) {
          console.log('usage totals by state:', data);
          callback(null);
        });
      }
    ]);

  } catch (err) {
    console.log('!', err.stack);
  }
})();

// query all facilities
let getAllFacilities = function(db, cb) {
  // const facilities = db.collection('facilities');
  facilities.find().toArray(function(err, docs) {
    assert.equal(err, null);
    cb(docs);
  });
};

// query all usage
let getAllUsage = function(db, cb) {
  // const usage = db.collection('usage');
  usage.find().toArray(function(err, docs) {
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

  usage.distinct("id", function(err, ids) {
    assert.equal(err, null);
    cb(ids);
  });
};
// remove facilities if they do not appear in distinct ID list
let deleteUnusedFacilities = function(db, ids, cb) {
  // const facilities = db.collection('facilities');

  facilities.deleteMany({"id": {$nin: ids}}, function(err, data) {
    assert.equal(err, null);
    cb(data.result.n);
  });
};



// find the total usage in each state
let countUsageByState = function(db, cb) {
  const usage = db.collection('usage');

  usage.aggregate([
    {
      $group: {
          _id: "$state",
          total_released: {
            $sum : "$total_released"
          },
          total_recycled: {
            $sum : "$total_recycled"
          },
          total_recovered: {
            $sum : "$total_recovered"
          },
          total_treated: {
            $sum : "$total_treated"
          },
          total_usage: {
            $sum: {$add : ["$total_released", "$total_recycled", "$total_recovered", "$total_treated"]}
          }
        }
    }
  ]).toArray(function(err, res) {
    if (err) throw err;
    console.log(res);
  });
};
