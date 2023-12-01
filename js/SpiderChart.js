class SpiderChart {
  constructor(_config, data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: 500,
      containerHeight: 500,
      margin: {
        top: 60,
        right: 15,
        bottom: 20,
        left: 30,
      },
      tooltipPadding: 5,
    };
    this.data = data;
    this.selectedArtists = [];
    this.drawChart();
  }

  drawChart() {
    let data = [];
    let features = [
      "Liveness",
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

    // A's liveness: 0.234
    // B's liveness: 0.612

    // A's danceability: 0.429
    // B's danceability: 0.434

    // A's energy: 0.661
    // B's energy: 0.897

    // A's speechiness: 0.0281
    // B's speechiness: 0.0488

    // A's instrumentalness: 0.000121
    // B's instrumentalness: 0

    //generate the data

    for (let i = 0; i < 2; i++) {
      const point = { artist: i === 0 ? "Coldplay" : "blink-182" };

      // Assign specific values for each feature
      point[features[0]] = i === 0 ? 0.234 : 0.612; // Liveness
      point[features[1]] = i === 0 ? 0.429 : 0.434; // Danceability
      point[features[2]] = i === 0 ? 0.661 : 0.897; // Energy
      point[features[3]] = i === 0 ? 0.0281 : 0.0488; // Speechiness
      point[features[4]] = i === 0 ? 0.121 : 0.232; // Instrumentalness

      data.push(point);
    }

    console.log(features);
    console.log(data);

    let width = 450;
    let height = 500;

    let svg = d3
      .select('body')
      .select(this.config.parentElement)
      .attr("width", width)
      .attr("height", height)
      .attr("transform", `translate(0, 25)`);

    let radialScale = d3.scaleLinear().domain([0, 1]).range([0, 150]);
    let ticks = [0.2, 0.4, 0.6, 0.8, 1.0];

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
        line_coord: angleToCoordinate(angle, 1),
        label_coord: angleToCoordinate(angle, 1.05),
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

    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", this.config.margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "18px")
      .style("font-weight", "bold")
      .text("Coldplay (#86 popular) vs blink-182 (#75 popular)");
  }
}
