class SpiderChart {
  constructor(_config, data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: 200,
      containerHeight: 200,
      margin: {
        top: 60,
        right: 15,
        bottom: 20,
        left: 30,
      },
      tooltipPadding: 5,
    };
    this.data = data;
    this.drawChart();
  }

  drawChart() {
    let data = [];
    let features = [
      "Popularity",
      "Danceability",
      "Energy",
      "Speechiness",
      "Instrumentalness",
    ];

    // Sample Data:
    // Artist A: Coldplay
    // Artist B: blink-182

    // A's popularity: 86
    // B's popularity: 75

    // A's danceability: 0.429
    // B's danceability: 0.434

    // A's energy: 0.661
    // B's energy: 0.897

    // A's speechiness: 0.0281
    // B's speechiness: 0.0488

    // A's instrumentalness: 0.000121
    // B's instrumentalness: 0

    //generate the data
    // for (var i = 0; i < 2; i++) {
    //   var point = {};
    //   //each feature will be a random number from 1-9
    //   features.forEach((f) => (point[f] = 1 + Math.random() * 8));
    //   data.push(point);
    // }
    // console.log(data);

    for (let i = 0; i < 2; i++) {
      const point = { artist: i === 0 ? "Coldplay" : "blink-182" };

      // Assign specific values for each feature
      point[features[0].toLowerCase()] = i === 0 ? 86 : 75; // Popularity
      point[features[1].toLowerCase()] = i === 0 ? 0.429 : 0.434; // Danceability
      point[features[2].toLowerCase()] = i === 0 ? 0.661 : 0.897; // Energy
      point[features[3].toLowerCase()] = i === 0 ? 0.0281 : 0.0488; // Speechiness
      point[features[4].toLowerCase()] = i === 0 ? 0.000121 : 0; // Instrumentalness

      data.push(point);
    }
    // This for loop doesn't work right now

    console.log(data);

    let width = 800;
    let height = 600;
    let svg = d3
      .select("body")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    let radialScale = d3.scaleLinear().domain([0, 10]).range([0, 250]);
    let ticks = [2, 4, 6, 8, 10];

    svg
      .selectAll("circle")
      .data(ticks)
      .join((enter) =>
        enter
          .append("circle")
          .attr("cx", width / 2)
          .attr("cy", height / 2)
          .attr("fill", "none")
          .attr("stroke", "gray")
          .attr("r", (d) => radialScale(d))
      );

    svg
      .selectAll(".ticklabel")
      .data(ticks)
      .join((enter) =>
        enter
          .append("text")
          .attr("class", "ticklabel")
          .attr("x", width / 2 + 5)
          .attr("y", (d) => height / 2 - radialScale(d))
          .text((d) => d.toString())
      );

    let featureData = features.map((f, i) => {
      let angle = Math.PI / 2 + (2 * Math.PI * i) / features.length;
      return {
        name: f,
        angle: angle,
        line_coord: angleToCoordinate(angle, 10),
        label_coord: angleToCoordinate(angle, 10.5),
      };
    });

    function angleToCoordinate(angle, value) {
      let x = Math.cos(angle) * radialScale(value);
      let y = Math.sin(angle) * radialScale(value);
      return { x: width / 2 + x, y: height / 2 - y };
    }

    // draw axis line
    svg
      .selectAll("line")
      .data(featureData)
      .join((enter) =>
        enter
          .append("line")
          .attr("x1", width / 2)
          .attr("y1", height / 2)
          .attr("x2", (d) => d.line_coord.x)
          .attr("y2", (d) => d.line_coord.y)
          .attr("stroke", "black")
      );

    // draw axis label
    svg
      .selectAll(".axislabel")
      .data(featureData)
      .join((enter) =>
        enter
          .append("text")
          .attr("x", (d) => d.label_coord.x)
          .attr("y", (d) => d.label_coord.y)
          .text((d) => d.name)
      );

    let line = d3
      .line()
      .x((d) => d.x)
      .y((d) => d.y);
    let colors = ["darkorange", "navy"];

    function getPathCoordinates(data_point) {
      let coordinates = [];
      for (var i = 0; i < features.length; i++) {
        let ft_name = features[i];
        let angle = Math.PI / 2 + (2 * Math.PI * i) / features.length;
        coordinates.push(angleToCoordinate(angle, data_point[ft_name]));
      }
      return coordinates;
    }

    svg
      .selectAll("path")
      .data(data)
      .join((enter) =>
        enter
          .append("path")
          .datum((d) => getPathCoordinates(d))
          .attr("d", line)
          .attr("stroke-width", 3)
          .attr("stroke", (_, i) => colors[i])
          .attr("fill", (_, i) => colors[i])
          .attr("stroke-opacity", 1)
          .attr("opacity", 0.5)
      );
  }
}
