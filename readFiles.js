const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const csv = require('csv-parser')
const fs = require('fs')
const facilities = {};
const usages = [];

/*
  Unique facility metadata
*/
class facility {
  // initialize the facility data and add the first chemical usage
  constructor(row) {
    this.id = row.TRI_FACILITY_ID;
    this.facility_name = row.FACILITY_NAME;
    this.state = row.ST;
    this.lat = row.LATITUDE;
    this.long = row.LONGITUDE;
  }
}

/*
  Unique facility/year usage metrics (aggregated across all chemicals)
  Keep track of the following attributes:

  // release
  total release (on and offsite)         =>    TOTAL_RELEASES

  // recycle
  total recycling offsite                =>    OFF-SITE_RECYCLED_TOTAL
  total recycling onsite                 =>    8.4_RECYCLING_ON-SITE

  // recovery
  total recovery onsite                  =>    8.2_ENERGY_RECOVERY_ON-SITE
  total recovery offsite                 =>    8.3_ENERGY_RECOVERY_OFF-SITE

  // treatment
  total treatment offsite                =>    8.7_TREATMENT_OFF-SITE
  total treatment onsite                 =>    8.6_TREATMENT_ON-SITE
*/
class usage {
  constructor(row) {
    this.id = row.TRI_FACILITY_ID; // foreign key to facility metadata
    this.year = row.YEAR;
    this.chemical = row.CHEMICAL;

    this.total_released = +row.TOTAL_RELEASES;

    this.total_recycled = +row['OFF-SITE_RECYCLED_TOTAL'] + (+row['8.4_RECYCLING_ON-SITE']);

    this.total_recovered = +row['8.3_ENERGY_RECOVERY_OFF-SITE'] + (+row['8.2_ENERGY_RECOVERY_ON-SITE']);

    this.total_treated = +row['8.7_TREATMENT_OFF-SITE'] + (+row['8.6_TREATMENT_ON-SITE']);
  }
}

readDataFile = function(year, cb) {
  fs.createReadStream('./../datafiles/TRI_'+year+'_US.csv')
    .pipe(csv())
    .on('data', (data) => {

      // add facility metadata (if unseen facility)
      if(!facilities[data.TRI_FACILITY_ID]) {
        facilities[data.TRI_FACILITY_ID] = new facility(data);
      }

      // record chemical usage info (only non-zero data)
      let u = new usage(data);
      if(u.total_released + u.total_recycled + u.total_recovered + u.total_treated > 0)
        usages.push(u);

    })
    .on('end', () => {
      console.log(Object.keys(facilities).length + ' unique facilities seen; ', usages.length + ' chemical uses logged');

      if(year > 2000)
        readDataFile(--year, cb);
      else {
        cb();
      }
    });
};


/*
  Set up DB connection
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

    // read all datafiles, then save to db
    readDataFile(2017, function() {
      saveFacilitiesToDB(db, function() {
        saveUsagesToDB(db, function() {
          console.log('ok closing db connection');
          client.close();
        });
      });
    });

  } catch (err) {
    console.log('!', err.stack);
  }
})();

const saveFacilitiesToDB = function(db, callback) {
  // Save the facilities (metadata) to the db
  const collection = db.collection('facilities');

  // clear old data
  collection.remove();

  collection.insertMany(Object.values(facilities), function(err, result) {
    assert.equal(err, null);
    let numFac = Object.keys(facilities).length;
    assert.equal(numFac, result.result.n);
    assert.equal(numFac, result.ops.length);
    console.log("Inserted", numFac, "facilities");
    callback(result);
  });
};

const saveUsagesToDB = function(db, callback) {
  // Save the chemical usage to the db
  const collection = db.collection('usage');

  // clear old data
  collection.remove();

  collection.insertMany(usages, function(err, result) {
    assert.equal(err, null);
    assert.equal(usages.length, result.result.n);
    assert.equal(usages.length, result.ops.length);
    console.log("Inserted", usages.length, "usages");
    callback(result);
  });
};
