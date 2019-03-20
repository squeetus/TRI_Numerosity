// attributes of the canvas area
var margin = {top: 50, right: 50, bottom: 100, left: 100},
    width = 700 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;



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
client.get('/get_facilities_TX', function(response1) {
    // do something with response

    // releases_vs_recycling(JSON.parse(response1));
    // releases_vs_other(JSON.parse(response1));

    client.get('/get_facilities_LA', function(response2) {
        // do something with response

        // releases_vs_recycling_comparison(JSON.parse(response1), JSON.parse(response2));
        // releases_vs_other(JSON.parse(response1), JSON.parse(response2));
        releases_vs_recycling_log_comparison(JSON.parse(response1), JSON.parse(response2));

        thenAnother();
    });
});

function thenAnother() {
  client.get('/get_yearly', function(data) {
    recycling_temporal_comparison(JSON.parse(data));

    andAgain();
  });
}

function andAgain() {
  client.get('/get_top20_TX_LA', function(data) {
    recycling_linear_temporal_comparison(JSON.parse(data));
    recycling_linear_relationship_comparison(JSON.parse(data));
  });
}



/*

          Chart 1

*/
function releases_vs_recycling(data) {
  // data = data.slice(10, 300);
  d3.select("body").append("div").html("<h1>Texas Facilities: Releases vs Recycling since 2000</h1>");
  d3.select("body").append("div").html("<h3>measurements in pounds (lbs)<h3>");
  // canvas area
  var svg = d3.select("body").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // linear scale for x axis
  // get min and max release
  var x = d3.scaleLinear().domain([
    d3.min(data, function(d){
      return d3.sum(d.yearly_released);
    }),
    d3.max(data, function(d){
      return d3.sum(d.yearly_released);
    })
  ])
  .range([0, width]);

  // linear scale for y axis
  // get min and max recycling
  var y = d3.scaleLinear().domain([
    d3.min(data, function(d){
      return d3.sum(d.yearly_recycled);
    }),
    d3.max(data, function(d){
      return d3.sum(d.yearly_recycled);
    })
  ])
  .range([height, 0]);

  console.log(x.domain(), y.domain());

  var xAxis = d3.axisBottom(x);

  var yAxis = d3.axisLeft(y);

  var color = d3.scaleOrdinal(d3.schemeCategory10);

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text("Releases");

  svg.append("text")
  .attr("transform",
        "translate(" + (width/2) + " ," +
                       (height + margin.top + 20) + ")")
  .style("text-anchor", "middle")
  .text("Releases");

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Recycling");

  // text label for the y axis
  svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x",0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Recycling");

  svg.selectAll(".dot")
      .data(data)
    .enter().append("circle")
      .attr("class", "dot")
      .attr("r", 2)
      .attr("cx", function(d) { return x(d3.sum(d.yearly_released)); })
      .attr("cy", function(d) { return y(d3.sum(d.yearly_recycled)); })
      .style("fill","none");
}




/*

          Chart 2

*/
function releases_vs_other(data) {
  // data = data.slice(0, 300);
  d3.select("body").append("div").html("<h1>Texas Facilities: Releases vs Recycling, Treatment, and Recovery since 2000</h1>");
  d3.select("body").append("div").html("<h3>measurements in pounds (lbs)<h3>");
  // canvas area
  var svg = d3.select("body").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // linear scale for x axis
  // get min and max release
  var x = d3.scaleLinear().domain([
    d3.min(data, function(d){
      return d3.sum(d.yearly_released);
    }),
    d3.max(data, function(d){
      return d3.sum(d.yearly_released);
    })
  ])
  .range([0, width]);

  // linear scale for y axis
  // get min and max recycling, recovery, treatment
  var y = d3.scaleLinear().domain([
    d3.min(data, function(d){
      return d3.sum(d.yearly_recycled)+d3.sum(d.yearly_recovered)+d3.sum(d.yearly_treated);
    }),
    d3.max(data, function(d){
      return d3.sum(d.yearly_recycled)+d3.sum(d.yearly_recovered)+d3.sum(d.yearly_treated);
    })
  ])
  .range([height, 0]);

  var xAxis = d3.axisBottom(x);

  var yAxis = d3.axisLeft(y);

  var color = d3.scaleOrdinal(d3.schemeCategory10);

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text("Releases");

  svg.append("text")
  .attr("transform",
        "translate(" + (width/2) + " ," +
                       (height + margin.top + 20) + ")")
  .style("text-anchor", "middle")
  .text("Releases");

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Recycling");

  // text label for the y axis
  svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x",0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Recycling + Recovery + Treatment");

  svg.selectAll(".dot")
      .data(data)
    .enter().append("circle")
      .attr("class", "dot")
      .attr("r", 2)
      .attr("cx", function(d) { return x(d3.sum(d.yearly_released)); })
      .attr("cy", function(d) { return y(d3.sum(d.yearly_recycled)+d3.sum(d.yearly_recovered)+d3.sum(d.yearly_treated)); })
      .style("fill","none");
}





/*

          Chart 3

*/
function releases_vs_recycling_comparison(data1, data2) {
  // data = data.slice(10, 300);
  d3.select("body").append("div").html("<h1>Texas (circles) vs Louisiana (squares): Releases vs Recycling since 2000</h1>");
  d3.select("body").append("div").html("<h3>measurements in pounds (lbs)<h3>");
  // canvas area
  var svg = d3.select("body").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // linear scale for x axis
  // get min and max release
  // var x = d3.scaleLinear().domain([
  //   d3.min([
  //     d3.min(data1, function(d){
  //       return d3.sum(d.yearly_released);
  //     }),
  //     d3.min(data2, function(d){
  //       return d3.sum(d.yearly_released);
  //     })
  //   ]),
  //   d3.max([
  //     d3.max(data1, function(d){
  //       return d3.sum(d.yearly_released);
  //     }),
  //     d3.max(data2, function(d){
  //       return d3.sum(d.yearly_released);
  //     })
  //   ])
  // ])
  // .range([0, width]);

  var x = d3.scaleLinear().domain([100000, 2500000]).range([0,width]);


  // linear scale for y axis
  // get min and max recycling
  // var y = d3.scaleLinear().domain([
  //   d3.min([
  //     d3.min(data1, function(d){
  //       return d3.sum(d.yearly_recycled);
  //     }),
  //     d3.min(data2, function(d){
  //       return d3.sum(d.yearly_recycled);
  //     })
  //   ]),
  //   d3.max([
  //     d3.max(data1, function(d){
  //       return d3.sum(d.yearly_recycled);
  //     }),
  //     d3.max(data2, function(d){
  //       return d3.sum(d.yearly_recycled);
  //     })
  //   ])
  // ])
  // .range([height, 0]);
  // var y = d3.scaleLinear().domain([100000, 2500000]).range([height, 0]);

  console.log(x.domain(), y.domain());

  var xAxis = d3.axisBottom(x);

  var yAxis = d3.axisLeft(y);

  var color = d3.scaleOrdinal(d3.schemeCategory10);

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text("Releases");

  svg.append("text")
  .attr("transform",
        "translate(" + (width/2) + " ," +
                       (height + margin.top + 20) + ")")
  .style("text-anchor", "middle")
  .text("Releases");

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Recycling");

  // text label for the y axis
  svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x",0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Recycling");

  svg.selectAll(".dot")
      .data(data1)
    .enter().append("circle")
      .attr("class", "dot")
      .attr("r", 4)
      .attr("cx", function(d) { return x(d3.sum(d.yearly_released)); })
      .attr("cy", function(d) { return y(d3.sum(d.yearly_recycled)); })
      .style("fill","none");

  svg.selectAll(".rect")
      .data(data2)
    .enter().append("svg:rect")
      .attr("class", "rect")
      .attr("width", 8)
      .attr("height", 8)
      .attr("x", function(d) { return x(d3.sum(d.yearly_released)); })
      .attr("y", function(d) { return y(d3.sum(d.yearly_recycled)); })
      .style("fill","none");
}




/*

          Chart 4

*/
function releases_vs_recycling_log_comparison(data1, data2) {

  d3.select("body").append("div").html("<h1>Texas vs Louisiana: Releases vs Recycling since 2000</h1>");
  d3.select("body").append("div").html("<h3>measurements in pounds (lbs)<h3>");
  // canvas area
  var svg = d3.select("body").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  //TODO: make function
  // concat data arrays
  let data = [...data1, ...data2];

  let count = [0,0];

  data = data.map(function(d) {
    d.state = d.all_states[0];
    d.total_released = d3.sum(d.yearly_released);
    d.total_recycled = d3.sum(d.yearly_recycled);
    d.total_treated = d3.sum(d.yearly_treated);
    d.total_recovered = d3.sum(d.yearly_recovered);
    return d;
  });
  // data = data.filter(function(d) {
  //   return d.total_released > 0 && d.total_recycled > 0 && d.overall_total > 1000;
  // });

  data.forEach(function(d) {
    if(d.state == "TX") count[0]++;
    if(d.state == "LA") count[1]++;
  });
  console.log(count);


  // log scale for x axis
  // get min and max release
  var x = d3.scaleLog().domain([
    1,
    d3.max(data, (d) => { return d.total_released; })
  ])
  .range([0, width])
  .clamp(true)
  .nice();

  // log scale for y axis
  // get min and max recycling
  var y = d3.scaleLog().domain([
    1,
    d3.max(data, (d) => { return d.total_recycled; })
  ])
  .range([height, 0])
  .clamp(true)
  .nice();

  var xAxis = d3.axisBottom(x);

  var yAxis = d3.axisLeft(y);

  // x axis
  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  // text label for the x axis
  svg.append("text")
  .attr("transform",
        "translate(" + (width/2) + " ," +
                       (height + margin.top) + ")")
  .style("text-anchor", "middle")
  .text("Releases");

  // y axis
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
              x(d3.sum(d.yearly_released)) + ',' +
              y(d3.sum(d.yearly_recycled)) + ')';
          })
    .append("path")
      .classed("shape", true)
      .attr("id", function(d, i) { return i; })
      .attr("d", function(d, i) {
        if(d.state == "TX") {
          return fiveLine();
        } else if(d.state == "LA") {
          return triangle();
        }
      })
      .style("stroke", "black")
      .style("fill-opacity", 1)
      .style("opacity", function(d) {
        if(d.total_released > 1000 && d.total_recycled > 1000) return 1;
        return 0.2;
      })
      .style("fill","none")
      .on('mouseover', function(d) {
        console.log(d);
      });

}


/*

          Chart 5

*/
function recycling_temporal_comparison(data) {

  data = data.slice(0, 1000);

  d3.select("body").append("div").html("<h1>Texas vs Louisiana: Recycling per year since 2000</h1>");
  d3.select("body").append("div").html("<h3>measurements in pounds (lbs)<h3>");
  // canvas area
  var svg = d3.select("body").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  //TODO: make function
  // concat data arrays

  let count = [0,0];

  data = data.map(function(d) {
    d.state = d.states[0];
    d.year = new Date(d._id.year, 0);
    return d;
  });
  // data = data.filter(function(d) {
  //   return d.total_released > 0 && d.total_recycled > 0 && d.overall_total > 1000;
  // });

  data.forEach(function(d) {
    if(d.state == "TX") count[0]++;
    if(d.state == "LA") count[1]++;
  });
  console.log(count);


  // year scale for x axis
  // hard code extent for now
  var x = d3.scaleTime().domain([
    new Date(1999, 0),
    new Date(2012, 0)
  ])
  .range([0, width])
  .clamp(true)
  .nice();


  // log scale for y axis
  // get min and max recycling
  var y = d3.scaleLog().domain([
    1,
    d3.max(data, (d) => { return d.total_recycled; })
  ])
  .range([height, 0])
  .clamp(true)
  .nice();

  var xAxis = d3.axisBottom(x).tickFormat(d3.timeFormat("%Y"));

  var yAxis = d3.axisLeft(y);

  // x axis
  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  // text label for the x axis
  svg.append("text")
  .attr("transform",
        "translate(" + (width/2) + " ," +
                       (height + margin.top) + ")")
  .style("text-anchor", "middle")
  .text("Date");

  // y axis
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
              // x(d3.sum(d.yearly_released)) + ',' +
              x(d.year) + ',' +
              y(d.total_recycled) + ')';
          })
    .append("path")
      .classed("shape", true)
      .attr("id", function(d, i) { return i; })
      .attr("d", function(d, i) {
        if(d.state == "TX") {
          return fiveLine();
        } else if(d.state == "LA") {
          return triangle();
        }
      })
      .style("stroke", "black")
      .style("fill-opacity", 1)
      .style("opacity", function(d) {
        // if(d.total_released > 1000 && d.total_recycled > 1000) return 1;
        // return 0.2;
        return 1;
      })
      .style("fill","none")
      .on('mouseover', function(d) {
        console.log(d);
      });

}



/*

          Chart 6

*/
function recycling_linear_temporal_comparison(data) {

  data = data.slice(0, 1000);

  d3.select("body").append("div").html("<h1>Texas vs Louisiana: Recycling per year since 2000</h1>");
  d3.select("body").append("div").html("<h3>measurements in pounds (lbs)<h3>");
  // canvas area
  var svg = d3.select("body").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  //TODO: make function
  // concat data arrays

  let count = [0,0];

  data = data.map(function(d) {
    d.state = d.states[0];
    d.year = new Date(d._id.year, 0);
    return d;
  });
  // data = data.filter(function(d) {
  //   return d.total_released > 0 && d.total_recycled > 0 && d.overall_total > 1000;
  // });

  data.forEach(function(d) {
    if(d.state == "TX") count[0]++;
    if(d.state == "LA") count[1]++;
  });
  console.log(count);


  // year scale for x axis
  // hard code extent for now
  var x = d3.scaleTime().domain([
    new Date(1999, 0),
    new Date(2012, 0)
  ])
  .range([0, width])
  .clamp(true)
  .nice();


  // log scale for y axis
  // get min and max recycling
  var y = d3.scaleLinear().domain([
    1,
    d3.max(data, (d) => { return d.total_recycled; })
  ])
  .range([height, 0])
  .clamp(true)
  .nice();

  var xAxis = d3.axisBottom(x).tickFormat(d3.timeFormat("%Y"));

  var yAxis = d3.axisLeft(y);

  // x axis
  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  // text label for the x axis
  svg.append("text")
  .attr("transform",
        "translate(" + (width/2) + " ," +
                       (height + margin.top) + ")")
  .style("text-anchor", "middle")
  .text("Date");

  // y axis
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
              // x(d3.sum(d.yearly_released)) + ',' +
              x(d.year) + ',' +
              y(d.total_recycled) + ')';
          })
    .append("path")
      .classed("shape", true)
      .attr("id", function(d, i) { return i; })
      .attr("d", function(d, i) {
        if(d.state == "TX") {
          return fiveLine();
        } else if(d.state == "LA") {
          return triangle();
        }
      })
      .style("stroke", "black")
      .style("fill-opacity", 1)
      .style("opacity", function(d) {
        // if(d.total_released > 1000 && d.total_recycled > 1000) return 1;
        // return 0.2;
        return 1;
      })
      .style("fill","none")
      .on('mouseover', function(d) {
        console.log(d);
      });

}



/*

          Chart 7

*/
function recycling_linear_relationship_comparison(data) {

  d3.select("body").append("div").html("<h1>Texas vs Louisiana: Recycling vs Release since 2000</h1>");
  d3.select("body").append("div").html("<h3>measurements in pounds (lbs)<h3>");
  // canvas area
  var svg = d3.select("body").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  //TODO: make function
  // concat data arrays

  let count = [0,0];
  console.log(data);
  data = data.map(function(d) {
    d.state = d.states[0];
    // d.total_released = d3.sum(d.yearly_released);
    // d.total_recycled = d3.sum(d.yearly_recycled);
    // d.total_treated = d3.sum(d.yearly_treated);
    // d.total_recovered = d3.sum(d.yearly_recovered);
    return d;
  });
  // data = data.filter(function(d) {
  //   return d.total_released > 0 && d.total_recycled > 0 && d.overall_total > 1000;
  // });

  data.forEach(function(d) {
    if(d.state == "TX") count[0]++;
    if(d.state == "LA") count[1]++;
  });
  console.log(count);


  // log scale for x axis
  // get min and max release
  var x = d3.scaleLog().domain(d3.extent(data, (d) => { return d.total_released; }))
  .range([0, width])
  .clamp(true)
  .nice();

  // log scale for y axis
  // get min and max recycling
  var y = d3.scaleLog().domain(d3.extent(data, (d) => { return d.total_recycled; }))
  .range([height, 0])
  .clamp(true)
  .nice();

  var xAxis = d3.axisBottom(x);//.tickFormat(d3.timeFormat("%Y"));

  var yAxis = d3.axisLeft(y);

  // x axis
  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  // text label for the x axis
  svg.append("text")
  .attr("transform",
        "translate(" + (width/2) + " ," +
                       (height + margin.top) + ")")
  .style("text-anchor", "middle")
  .text("Releases");

  // y axis
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
              // x(d3.sum(d.yearly_released)) + ',' +
              x(d.total_released) + ',' +
              y(d.total_recycled) + ')';
          })
    .append("path")
      .classed("shape", true)
      .attr("id", function(d, i) { return i; })
      .attr("d", function(d, i) {
        if(d.state == "TX") {
          return fiveLine();
        } else if(d.state == "LA") {
          return triangle();
        }
      })
      .style("stroke", "black")
      .style("fill-opacity", 1)
      .style("opacity", function(d) {
        // if(d.total_released > 1000 && d.total_recycled > 1000) return 1;
        // return 0.2;
        return 1;
      })
      .style("fill","none")
      .on('mouseover', function(d) {
        console.log(d);
      });

}
