// attributes of the canvas area
var margin = {top: 50, right: 50, bottom: 100, left: 100},
    width = 700 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;

// list of states with >100 facilities
let states = [ "ME", "NV", "RI", "PR", "AZ", "IA", "WV", "MN", "MA", "MI", "OK", "DE", "TN", "LA", "WA", "NH", "SC", "AL", "CO", "SD", "NM", "IN", "VA", "MS", "ND", "NJ", "NY", "KY", "CA", "CT", "OR", "MD", "IL", "TX", "WI", "UT", "OH", "MO", "KS", "PA", "GA", "NE", "NC", "ID", "FL", "AR" ];
console.log(states);
// numerosity task variables
// let targetStates = ["CO", "MO"];
let targetCount = [100, 150];
let shapes = [sixLine, triangle];


var HttpClient = function() {
    this.get = function(aUrl, aCallback) {
        var anHttpRequest = new XMLHttpRequest();
        anHttpRequest.onreadystatechange = function() {
            if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200)
                aCallback(anHttpRequest.responseText);
        };

        anHttpRequest.open( "GET", aUrl, true );
        anHttpRequest.send( null );
    };
};


var client = new HttpClient();

let i = 0;
let targetStates = [states[i], states[i+1]];
function makeTheChart(theseStates) {
  client.get('/numerosity_data?states='+JSON.stringify(targetStates), function(data) {
    releases_vs_recycling(JSON.parse(data));
    if(i < states.length - 2) {
      i++;
      targetStates = [states[i], states[i+1]];
      makeTheChart(targetStates);
      shapes = pickTwo();
    }
  });
}
makeTheChart(targetStates);





/*

          Numerosity

*/
function releases_vs_recycling(data) {

  // console.log(data);

  // modify facilities
  //  (pull out individual states, sum up usage)
  data = data.map(function(d) {
    d.state = d.all_states[0];
    d.total_released = d3.sum(d.yearly_released);
    d.total_recycled = d3.sum(d.yearly_recycled);
    d.total_treated = d3.sum(d.yearly_treated);
    d.total_recovered = d3.sum(d.yearly_recovered);
    return d;
  });

  // filter facilities with 0 in either release or recycling
  // filter facilities with less than 1000 lbs total
  data = data.filter(function(d) {
    return d.total_released > 0 && d.total_recycled > 0 && d.overall_total > 1000;
  });

  // count totals in each
  let count = [0,0];
  data.forEach(function(d) {
    if(d.state == targetStates[0]) count[0]++;
    if(d.state == targetStates[1]) count[1]++;
  });

  // trim down for numerosity task
  count = [0,0];
  data = data.filter(function(d) {
    if(d.state == targetStates[0] && count[0] < targetCount[0]) {
      count[0]++;
      return true;
    }

    if(d.state == targetStates[1] && count[1] < targetCount[1]) {
      count[1]++;
      return true;
    }

    return false;
  });

  if(count[0] < targetCount[0] || count[1] < targetCount[1]) {
    // console.log("WEAK");
    return;
  }


  // console.log(count);


  d3.select("body").append("div").html("<h1>" + targetStates[0] + " vs " + targetStates[1] + ": Releases vs Recycling since 2000</h1>");

  d3.select("body").append("div").html("<h3>measurements in pounds (lbs)<h3>");
  // canvas area
  var svg = d3.select("body").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // log scale for x axis
  // get min and max release
  var x = d3.scaleLog().domain([
    d3.max([1, d3.min(data, function(d){
      return d.total_released;
    })]),
    d3.max(data, function(d){
      return d.total_released;
    })
  ])
  .range([0, width])
  .clamp(true)
  .nice();

  // log scale for y axis
  // get min and max recycling
  var y = d3.scaleLog().domain([
    d3.min([1, d3.min(data, function(d){
      return d.total_recycled;
    })]),
    d3.max(data, function(d){
      return d.total_recycled;
    })
  ])
  .range([height, 0])
  .clamp(true)
  .nice();

  // console.log(x.domain(), y.domain());

  var xAxis = d3.axisBottom(x);

  var yAxis = d3.axisLeft(y);

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);
  svg.append("text")
  .attr("transform",
        "translate(" + (width/2) + " ," +
                       (height + margin.top) + ")")
  .style("text-anchor", "middle")
  .text("Releases");

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis);
  // text label for the y axis
  svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x",0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Recycling");

  svg.selectAll(".facility")
      .data(data)
    .enter().append("g")
          .classed("nodecontainer", true)
          .attr('transform', function(d, i) {
            return 'translate(' +
              x(d.total_released) + ',' +
              y(d.total_recycled) + ')';
          })
    .append("path")
      .classed("shape", true)
      .attr("id", function(d, i) { return i; })
      .attr("d", function(d, i) {
        if(d.state == targetStates[0]) {
          return shapes[0]();
        } else if(d.state == targetStates[1]) {
          return shapes[1]();
        }
      })
      .style("stroke", "black")
      .style("fill-opacity", 1)
      .style("opacity", function(d) {
        return 1;
      })
      .style("fill","none")
      .on('mouseover', function(d) {
        console.log(d);
      });
}
