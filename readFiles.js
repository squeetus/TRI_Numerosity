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
    this.numChemicals = 1;

    this.total_released = +row.TOTAL_RELEASES;

    this.total_recycled = +row['OFF-SITE_RECYCLED_TOTAL'] + (+row['8.4_RECYCLING_ON-SITE']);

    this.total_recovered = +row['8.3_ENERGY_RECOVERY_OFF-SITE'] + (+row['8.2_ENERGY_RECOVERY_ON-SITE']);

    this.total_treated = +row['8.7_TREATMENT_OFF-SITE'] + (+row['8.6_TREATMENT_ON-SITE']);
  }

  // add successive chemical usage
  addRow(row) {
    this.numChemicals++;

    this.total_released += +row.TOTAL_RELEASES;

    this.total_recycled += +row['OFF-SITE_RECYCLED_TOTAL'] + (+row['8.4_RECYCLING_ON-SITE']);

    this.total_recovered += +row['8.3_ENERGY_RECOVERY_OFF-SITE'] + (+row['8.2_ENERGY_RECOVERY_ON-SITE']);

    this.total_treated += +row['8.7_TREATMENT_OFF-SITE'] + (+row['8.6_TREATMENT_ON-SITE']);
  }

}

readDataFile = function(year) {
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
        readDataFile(--year);
    });
};

readDataFile(2017);
