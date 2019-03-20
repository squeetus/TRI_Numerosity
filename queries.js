const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const async = require('async');
const fs = require('fs');


const allYears = [
	"2017",
	"2016",
	"2000",
	"2015",
	"2002",
	"2001",
	"2006",
	"2005",
	"2004",
	"2003",
	"2011",
	"2010",
	"2009",
	"2008",
	"2007"
];

const allStates = [
	"ME",
	"CA",
	"OH",
	"NV",
	"CO",
	"OK",
	"IA",
	"WV",
	"SD",
	"TX",
	"UT",
	"WA",
	"GA",
	"IL",
	"PA",
	"MS",
	"NC",
	"NY",
	"NJ",
	"IN",
	"AZ",
	"MA",
	"TN",
	"KS",
	"WI",
	"MD",
	"OR",
	"KY",
	"FL",
	"RI",
	"HI",
	"SC",
	"PR",
	"VA",
	"MI",
	"MN",
	"AR",
	"AL",
	"MO",
	"CT",
	"NE",
	"LA",
	"AK",
	"DE",
	"NH",
	"VT",
	"DC",
	"ID",
	"MT",
	"ND",
	"NM",
	"VI",
	"WY",
	"GU",
	"MP",
	"AS",
];


const top20_TX = [ '77541THDWCBUILD',
       '77511SLTNCFM291',
       '77978FRMSPPOBOX',
       '77651TXCCHHWY36',
       '77012STFFR8615M',
       '77530RCCHM2502S',
       '78343CLNSNONEMI',
       '77541BSFCR602CO',
       '78359CCDNTHWY36',
       '77631DPNTSFARMR',
       '77017TXSPT8600P',
       '77507CMRCS5757U',
       '77627CCRYL6350N',
       '77979BPCHMTEXAS',
       '77905NVSTS2695L',
       '77630LLDSGFM100',
       '77643BSFFNNEOFI',
       '77507HCHST9502B',
       '77536CCDNTTIDAL',
       '77536RHMND6600L' ];

const top20_LA = [ '70765THDWCHIGHW',
       '70776CBGGYRIVER',
       '70765GRGGLHIGHW',
       '70669PPGNDCOLUM',
       '70079RSLTN16122',
       '70057NNCRBHWY31',
       '70079MTVNR15536',
       '70669RCCHM900AI',
       '70094MRCNC10800',
       '70734BSFCRRIVER',
       '70079SHLLL1205R',
       '70663WSTLK900HA',
       '70805XXNCH4999S',
       '70602CTGPTHIGHW',
       '70070MNSNTRIVER',
       '70734BRDNCLOUIS',
       '70874SCHYLWESTE',
       '70669CNCLKOLDSP',
       '70737SHLLCRIVER',
       '70821STFFRAIRLI' ];

const top20_TX_LA = [...top20_TX, ...top20_LA];

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
      // function(callback) {
      //   removeUnusedFacilities(db, function(data) {
      //     console.log('removed', data, 'unused facilities');
      //     callback(null);
      //   });
      // },
      //
      // function(callback) {
      //   getAllFacilities(db, function(data) {
      //     console.log('there are', data.length, 'facilities in the database');
      //     callback(null);
      //   });
      // },
      //
      // function(callback) {
      //   getAllUsage(db, function(data) {
      //     console.log('there are', data.length, 'chemical uses in the database');
      //     callback(null);
      //   });
      // },
      //
      // function(callback) {
      //   countUsageByState(db, function(data) {
      //     console.log('usage totals by state:', data);
      //     callback(null);
      //   });
      // },
      //
      // function(callback) {
      //   countUsageByFacility(db, function(data) {
      //     console.log('usage totals by facility:', data);
      //     callback(null);
      //   });
      // },
      //
      function(callback) {
        let conditions = {};
        conditions.states = ["LA"];
        conditions.years = allYears;
        countUsageByFacilityWithConditions(db, conditions, function(data) {
          console.log('usage totals by facility:', data);
          callback(null);
        });
      },
      //
      // function(callback) {
      //   countUsageByFacilityByYear(db, function(data) {
      //     console.log('usage totals for each facility/year:', data);
      //     callback(null);
      //   });
      // },
      //
      // function(callback) {
      //   let conditions = {};
      //   conditions.states = ["LA"];
      //   conditions.years = allYears;
      //   countUsageByFacilityByYearWithConditions(db, conditions, function(data) {
      //     console.log('usage totals for each facility/year:', data);
      //     writeDataToFile(data);
      //     callback(null);
      //   });
      // },

      // function(callback) {
      //   let conditions = {};
      //   conditions.states = ["TX", "LA"];
      //   conditions.years = allYears;
      //   countUsageByFacilityPerYearWithConditions(db, conditions, function(data) {
      //     console.log('usage totals for each facility/year:', data);
      //     writeDataToFile(data);
      //     // console.log(data);
      //     callback(null);
      //   });
      // },

      function(callback) {
        let conditions = {};
        conditions.facilities = top20_TX_LA;
        conditions.years = allYears;
        countUsageBySpecificFacilityPerYearWithConditions(db, conditions, function(data) {
          console.log('usage totals for each facility/year:', data);
          writeDataToFile(data);
          // console.log(data);
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
//  (ordered by total usage)
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
    },
    {$sort: {total_usage: -1}}
  ]).toArray(function(err, res) {
    if (err) throw err;
    cb(res);
  });
};


// find the total usage at each facility
//  (ordered by total usage)
let countUsageByFacility = function(db, cb) {
  const usage = db.collection('usage');

  usage.aggregate([
    {
      $group: {
          _id: "$id",
          states: { $addToSet:  "$state"},
          // chemicals: { $addToSet:  "$chemical" },
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
    },
    {$sort: {total_usage: -1}}
  ]).toArray(function(err, res) {
    if (err) throw err;
    cb(res);
  });
};



// find the total usage at each facility
//  (match by states and/or by years)
//  (ordered by total usage)
let countUsageByFacilityWithConditions = function(db, conditions, cb) {
  const usage = db.collection('usage');

  // perform aggregation
  usage.aggregate([
    { $match : { year : {$in : conditions.years} } },
    { $match :
      { state :
        {$in : conditions.states}
      }
    },
    {
      $group: {
        _id: "$id",
        states: { $addToSet:  "$state"},
        years: { $addToSet:  "$year"},
        chemicals: { $addToSet:  "$chemical" },
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
      },
    },

    {$sort: {total_usage: -1}},
    {$limit: 20},
    { $project : { id: 1}},
    {
      $group: {
        _id: null,
        ids: { $push: "$_id"}
      }
    }

  ]).toArray(function(err, res) {
    if (err) throw err;
    cb(res);
  });
};


// find the usage at each facility in each year
//  (ordered by total usage)
let countUsageByFacilityByYear = function(db, cb) {
  const usage = db.collection('usage');

  usage.aggregate([
    {
      $group: { // for each unique combo of facility and year, sum up the usage values
          _id: {facility: "$id", year: "$year"},
          states: { $addToSet:  "$state"},
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
    },
    { $unwind: "$states" },
    {
      $group: { // now for each unique facility, produce arrays of years and usage values
          _id: {facility: "$_id.facility"},
          all_states: { $addToSet: "$states"},
          years: { $push: "$_id.year"},
          yearly_released: { $push: "$total_released" },
          yearly_recycled: { $push: "$total_recycled" },
          yearly_recovered: { $push: "$total_recovered" },
          yearly_treated: { $push: "$total_treated" },
          yearly_total: { $push: "$total_usage" },
          overall_total: { $sum: "$total_usage" } // running total across all years
      }
    },
    {$sort: {overall_total: -1}} // sort by total usage over time
  ],
  { allowDiskUse: true })
  .toArray(function(err, res) {
    if (err) throw err;
    cb(res);
  });
};




// find the usage at each facility in each year
//  (match by states and/or by years)
//  (ordered by total usage)
let countUsageByFacilityByYearWithConditions = function(db, conditions, cb) {
  const usage = db.collection('usage');

  usage.aggregate([
    { $match : { year : {$in : conditions.years} } },
    { $match :
      { state :
        {$in : conditions.states}
      }
    },
    {
      $group: { // for each unique combo of facility and year, sum up the usage values
          _id: {facility: "$id", year: "$year"},
          states: { $addToSet:  "$state"},
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
    },
    { $unwind: "$states" },
    {
      $group: { // now for each unique facility, produce arrays of years and usage values
          _id: {facility: "$_id.facility"},
          all_states: { $addToSet: "$states"},
          years: { $push: "$_id.year"},
          yearly_released: { $push: "$total_released" },
          yearly_recycled: { $push: "$total_recycled" },
          yearly_recovered: { $push: "$total_recovered" },
          yearly_treated: { $push: "$total_treated" },
          yearly_total: { $push: "$total_usage" },
          overall_total: { $sum: "$total_usage" } // running total across all years
      }
    },
    {$sort: {overall_total: -1}} // sort by total usage over time
  ],
  { allowDiskUse: true })
  .toArray(function(err, res) {
    if (err) throw err;
    cb(res);
  });
};



// find the usage at each facility for separate years
//  (match by states and/or by years)
//  (ordered by total usage)
let countUsageByFacilityPerYearWithConditions = function(db, conditions, cb) {
  const usage = db.collection('usage');

  usage.aggregate([
    { $match : { year : {$in : conditions.years} } },
    { $match :
      { state :
        {$in : conditions.states}
      }
    },
    {
      $group: { // for each unique combo of facility and year, sum up the usage values
          _id: {facility: "$id", year: "$year"},
          states: { $addToSet:  "$state"},
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
    },
    // match facilities with nonzero release and recycle data
    { $match :
      { $and: [
        {total_released: { $gt: 0}},
        {total_recycled: { $gt: 0}},
      ]}
    },
    {$sort: {total_usage: -1}} // sort by total usage over time
  ],
  { allowDiskUse: true })
  .toArray(function(err, res) {
    if (err) throw err;
    cb(res);
  });
};

let countUsageBySpecificFacilityPerYearWithConditions = function(db, conditions, cb) {
  const usage = db.collection('usage');

  usage.aggregate([
    // match specific facilities
    { $match :
      { id :
        {$in : conditions.facilities}
      }
    },
    // match years
    { $match : { year : {$in : conditions.years} } },
    {
      $group: { // for each unique combo of facility and year, sum up the usage values across chemicals
          _id: {facility: "$id", year: "$year"},
          states: { $addToSet:  "$state"},
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
    },
    // match facilities with nonzero release and recycle data
    { $match :
      { $and: [
        {total_released: { $gt: 0}},
        {total_recycled: { $gt: 0}},
      ]}
    },
    {$sort: {total_usage: -1}} // sort by total usage over time
  ],
  { allowDiskUse: true })
  .toArray(function(err, res) {
    if (err) throw err;
    cb(res);
  });
};





const writeDataToFile = function(data) {
  fs.writeFile("./queryOutput.txt", JSON.stringify(data), function(err) {
      if(err) {
          return console.log(err);
      }

      console.log("The file was saved!");
  });
};
