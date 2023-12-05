class SpiderChart {
  constructor(_config, _data) {
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
    this.data = _data;
    this.selectedArtists = [];
    this.drawChart();
  }

  drawChart() {
    let artistData = [];
    let features = [
      "liveness",
      "danceability",
      "energy",
      "speechiness",
      "instrumentalness",
    ];

    console.log(this.data[0].artist_name);
    console.log(
      d3.mean(
        this.data
          .filter((d) => d.artist_name === this.selectedArtists[0])
          .map((d) => d.artist_popularity)
      )
    );

    this.selectedArtists.forEach((artist) => {
      const point = { artist: artist };

      // Assign specific values for each feature
      point[features[0]] = d3.mean(
        this.data
          .filter((d) => d.artist_name === artist)
          .map((d) => d[features[0].toLowerCase()])
      );
      point[features[1]] = d3.mean(
        this.data
          .filter((d) => d.artist_name === artist)
          .map((d) => d[features[1].toLowerCase()])
      );
      point[features[2]] = d3.mean(
        this.data
          .filter((d) => d.artist_name === artist)
          .map((d) => d[features[2].toLowerCase()])
      );
      point[features[3]] = d3.mean(
        this.data
          .filter((d) => d.artist_name === artist)
          .map((d) => d[features[3].toLowerCase()])
      );
      point[features[4]] = d3.mean(
        this.data
          .filter((d) => d.artist_name === artist)
          .map((d) => d[features[4].toLowerCase()])
      );
      artistData.push(point);
    });

    console.log("artistData is...");
    console.log(artistData);

    let width = 550;
    let height = 500;

    let svg = d3
      .select("body")
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
    // Note: The text for attributes are getting overwritten. Fix this.
    svg
      .selectAll(".axislabel")
      .data(featureData, (d) => d.name)
      .join("text")
      .attr("class", "axislabel")
      .attr("x", (d) => d.label_coord.x)
      .attr("y", (d) => d.label_coord.y)
      .text((d) => d.name);

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
      .data(artistData)
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

    if (artistData.length > 0) {
      // Print out the artist of the first element
      console.log(artistData[0].artist);
    } else {
      console.log("The array is empty.");
    }

    if (artistData.length == 0) {
      const title = svg
        .selectAll(".titleText")
        .data(artistData, (d) => d.artist)
        .join("text")
        .attr("class", "titleText")
        .attr("x", width / 2)
        .attr("y", (d, i) => i * 10 + this.config.margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .text(" ");
    }

    if (artistData.length == 1) {
      const meanPopularity = d3.mean(
        this.data
          .filter((d) => d.artist_name === artistData[0].artist)
          .map((d) => d.artist_popularity)
      );

      const title = svg
        .selectAll(".titleText")
        .data(artistData, (d) => d.artist)
        .join("text")
        .attr("class", "titleText")
        .attr("x", width / 2)
        .attr("y", (d, i) => i * 10 + this.config.margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .style("fill", "darkorange")
        .text((d) => d.artist + " (Popularity Score: " + meanPopularity + ")");
    }

    if (artistData.length == 2) {
      const meanPopularity1 = d3.mean(
        this.data
          .filter((d) => d.artist_name === artistData[0].artist)
          .map((d) => d.artist_popularity)
      );

      const meanPopularity2 = d3.mean(
        this.data
          .filter((d) => d.artist_name === artistData[1].artist)
          .map((d) => d.artist_popularity)
      );

      const title = svg
        .selectAll(".titleText")
        .data(artistData, (d) => d.artist)
        // svg
        .join("text")
        .attr("class", "titleText")
        .attr("x", width / 2)
        .attr("y", (d, i) => i * 10 + this.config.margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .style("fill", (d, i) => (i === 0 ? "darkorange" : "navy"))
        .text((d, i) => {
          if (i == 0) {
            return d.artist + " (Popularity Score: " + meanPopularity1 + ")";
          } else {
            return (
              "vs. " + d.artist + " (Popularity Score: " + meanPopularity2 + ")"
            );
          }
        })
        .on("mouseover", (event, d) => {
          const [x, y] = d3.pointer(event);
          d3
            .select("#tooltip")
            .style("display", "block")
            .style("left", x + this.config.tooltipPadding + "px")
            .style("top", y + this.config.tooltipPadding + "px").html(`
                    <div class="tooltip-title">${d.artist}</div>
                    <ul>
                        <li>Popularity: ${meanPopularity1}</li>
                    </ul>
                `);
        })
        .on("mouseleave", () => {
          d3.select("#tooltip").style("display", "none");
        });
    }
  }
}
