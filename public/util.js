/*
 *
 *    Helper Functions for all scripts
 *
 */
var pretty = false;

// compute radians from degrees
function degToRad(deg) {
  return deg*0.01745329252;
}

// computes and returns an array of [x,y] positions for all shapes (in specified svg)
function getPositions(which) {
  var sv = (which == 2) ? svg2 : svg;
  var positions = [];
  sv.selectAll(".shapecontainer").each(function(d) {
    translate = d3.select(this).attr("transform");
    pos = translate.substring(translate.indexOf("(")+1, translate.indexOf(")")).split(",");
    pos[0] = +pos[0];
    pos[1] = +pos[1];
    positions.push(pos);
  });
  return positions;
}

// (OLD) send all the current positions to the server to save
function sendPositions() {
  var data = {};
  var tmp = which;

  // associate the points with an id or set of conditions
  //data.id = condition+...+structure(etc)

  which = 1;
  data.pos1 = getPositions();
  which = 2;
  data.pos2 = getPositions();
  which = tmp;

  POST(data, function(r) {
    console.log(r.status);
  });
}

function sendStimulusData() {
  // : positions      x
  // : rotation       x
  // : shapes         x
  // : task           x
  // : num displays   x
  // : extras
  //    : linear - correlation of both sets
  //    : both - overlap percentage of both sets

  var data = {};

  if(mode == 1) {
    data.positions = getPositions(1);

    data.rotation = svgRotation % 360;

    data.shape1 = symbol1.name;
    data.shape2 = symbol2.name;

    data.overlap = computeOverlapPercentage(getPositions(1));

  } else {
    data.positions1 = getPositions(1);
    data.positions2 = getPositions(2);

    data.rotation1 = svgRotation % 360;
    data.rotation2 = svgRotation2 % 360;

    data.shape1 = symbol1.name;
    data.shape2 = symbol2.name;

    data.overlap1 = computeOverlapPercentage(getPositions(1));

    data.overlap2 = computeOverlapPercentage(getPositions(2));
  }

  // for linear trend tasks, note the correlations of both sets
  if(task == 'linear') {
    if(mode == 1) {
      var sets = splitPositions(getPositions(1));
      data.correlation1 = correlation(sets[0]);
      data.correlation2 = correlation(sets[1]);
    } else {
      data.correlation1 = correlation(getPositions(1));
      data.correlation2 = correlation(getPositions(2));
    }
  }

  if(task == 'numerosity') {
    data.numShapes1 = numShapes;
    data.numShapes2 = numShapes2;
  }

  data.task = task;
  data.numDisplays = mode;


  POST(data, function(r) {
    console.log(r.status);
  });
}

// undo the splicing from the linear trend task
function splitPositions(positions) {
  var a = [];
  var b = [];
  for(var i = 0; i < positions.length; i++) {
    if(i%2 === 0) {
      a.push(positions[i]);
    } else {
      b.push(positions[i]);
    }
  }
  return [a, b];
}

// compute the average position of an array of [x,y] points
function averagePosition(positions) {
  avgPos = [0,0];
  for(var i = 0; i < positions.length; i++) {
    avgPos[0]+=positions[i][0];
    avgPos[1]+=positions[i][1];
  }
  return([avgPos[0]/positions.length,avgPos[1]/positions.length]);
}

// compute the sum of an array of numbers
function sum(nums) {
  var sum = 0;
  for(var i = 0; i < nums.length; i++) {
    sum += nums[i];
  }
  return sum;
}

// compute the average of an array of numbers
function average(nums) {
  var avg = 0;
  for(var i = 0; i < nums.length; i++) {
    avg += nums[i];
  }
  return avg/nums.length;
}

// compute the stddev of an array of numbers
function stddev(nums) {
  var mean = average(nums);
  var sumSquareDiff = 0;
  for(var i = 0; i < nums.length; i++) {
    sumSquareDiff += (nums[i] - mean)*(nums[i] - mean);
  }
  return Math.sqrt(sumSquareDiff/nums.length);
}

// rotate the svg by increments of 90 degrees. (note that shapes should stay the same way up)
function rotateSVG() {
  let sv = (which == 1) ? svg : svg2;
  let rotate = (which == 1) ? svgRotation : svgRotation2;

  sv.attr('transform', 'rotate(' + (rotate+=90)  + ' 0 0)');
  sv.selectAll(".shapecontainer")
    .attr("transform", function(d,i) {
      var myXform = d3.select(this).attr("transform");
      return myXform.slice(0, myXform.indexOf("rotate")) + ' rotate(' + (-rotate)  + ' 0 0)';
    });

  // make sure original rotation variables are exposed
  if(which == 1)
    svgRotation = rotate;
  if(which == 2)
    svgRotation2 = rotate;
}

// brute force n^2 approach
function computeOverlaps(positions) {
  // console.log(positions);
  var counts = [];
  var countByShape = {
    "first": [],
    "second": []
  };
  var px = 0, py = 0;

  // for each position, find number in (bounding circle radius bcr) around point
  for(var i = 0; i < positions.length; i++) {
    px = positions[i][0];
    py = positions[i][1];
    counts.push( searchAll(positions, px, py, bcr).length );
  }

  console.log(sum(counts), average(counts), stddev(counts));
}

// compute the percentage of overlapping positions (considering bounding cirle radius)
function computeOverlapPercentage(positions) {
  var overlaps = 0;
  var px = 0, py = 0;

  // for each position, check for overlaps in (bcr) around point
  for(var i = 0; i < positions.length; i++) {
    px = positions[i][0];
    py = positions[i][1];
    if(searchAll(positions, px, py, bcr).length > 0) {
      overlaps++;
    }
  }

  return overlaps/positions.length;
}

// Find the symbols within the specified circle (brute force)
function searchAll(p, cx, cy, radius) {
  if(pretty) {
    thiscirc = svg.append('g');
    thiscirc.append('circle')
      .attrs({ cx: cx, cy: cy, r:radius , fill: 'none', stroke:'blue' });
  }

  var contains = [];

  for(var i = 0; i < p.length; i++) {
    var d = p[i]; // d is current considered point
    if(d[0] == cx && d[1] == cy) continue; // self

    if(pretty) {
      thiscirc = svg.append('g');
      thiscirc.append('circle').attrs({ cx: d[0], cy: d[1], r:radius , fill: 'none'});
      thiscirc.attr('stroke','purple');
    }

    if(inCircle(d[0], d[1], cx, cy, radius)) {
      if(pretty) thiscirc.attr('stroke','green');

      contains.push(d);
    } else if(pretty) {
      thiscirc.attrs({stroke:'red','stroke-dasharray':'3'});
    }
  }

  return contains;
}

/*
 *  return true if the given coordinates are within (radius) distance
 *    of the point defined by cx, cy
 */
function inCircle(x, y, cx, cy, radius) {
  return ((x) - cx) * ((x) - cx) + ((y) - cy) * ((y)- cy) < 4*radius * radius;
}

/*
 *  return a random number between the given min and max values
 *    with the specified precision
 */
function randomFromInterval(min, max, decimels) {
    return +(Math.random()*(max-min)+min).toFixed(decimels || 3);
}

// return euclidean distance between points
function distance(p1, p2) {
  return Math.sqrt(Math.pow((p1[0] - p2[0]), 2) + Math.pow((p1[1] - p2[1]), 2));
}

// is the point p([x, y]) in screen bounds?
function inBounds(p) {
  // check bounds of display
  if((p[0]-2*bcr) <= width * 0.1 || //left
    (p[0]+2*bcr) >= width - (width * 0.1) || //right
    (p[1]-2*bcr) <= height * 0.1 ||
    (p[1]+2*bcr) >= height - (height * 0.1)) {
    return false;
  }
  return true;
}

// return true if a given point is:
//  - in bounds
//  - not too close to any other shapes
//  - lower than individual overlap threshold
function validOverlapPoint(p, positions) {

  if(!inBounds(p)) return false;

  // count any overlap with other symbols
  var overlaps = 0;
  for(var i = 0; i < positions.length; i++) {
    // if the overlap is too close, return false
    if((Math.abs(p[0] - positions[i][0]) < 0.5*bcr) &&
     (Math.abs(p[1] - positions[i][1]) < 0.5*bcr)){
       // console.log('too close m8');
       return false;
     }

    // otherwise, count the number of overlaps
    if((Math.abs(p[0] - positions[i][0]) < 2*bcr) &&
     (Math.abs(p[1] - positions[i][1]) < 2*bcr)){

      overlaps++;
    }
  }

  return (overlaps < overlapThreshold);
}

// count the number of points which overlap with point 'p' (considering bcr)
function countOverlapsForPoint(p, positions) {
  var overlaps = 0;

  for(var i = 0; i < positions.length; i++) {
    // count the number of overlaps
    if((Math.abs(p[0] - positions[i][0]) < 2*bcr) &&
     (Math.abs(p[1] - positions[i][1]) < 2*bcr)){
      overlaps++;
    }
  }

  return overlaps;
}

// count the number of points which overlap with point at index 'idx' (considering bcr)
function countOverlapsForPointAtIndex(idx, positions) {
  var overlaps = 0;
  var p = positions[idx];

  for(var i = 0; i < positions.length; i++) {
    if(i == idx) continue; // don't count self

    // count the number of overlaps
    if((Math.abs(p[0] - positions[i][0]) < 2*bcr) &&
     (Math.abs(p[1] - positions[i][1]) < 2*bcr)){
      overlaps++;
    }
  }

  return overlaps;
}

// return Pearson's Correlation Coefficient r_xy
function correlation(points) {
  var sumX = 0,
      sumY = 0,
      sumXY = 0,
      sumX2 = 0,
      sumY2 = 0,
      p,
      n = points.length;

  for(var i = 0; i < points.length; i++) {
    p = points[i];
    sumX += p[0];
    sumY += p[1];
    sumXY += (p[0] * p[1]);
    sumX2 += (p[0] * p[0]);
    sumY2 += (p[1] * p[1]);
  }

  var numerator = ((n * sumXY) - (sumX * sumY));
  var denominator = Math.sqrt((n * sumX2 - (sumX * sumX))*(n * sumY2 - (sumY * sumY)));

  return  numerator / denominator;
}
