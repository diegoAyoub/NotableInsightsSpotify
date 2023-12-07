class Scatterplot {
    /**
     * Class constructor for scatterplot, used to represent keys and tempor of music
     * @param _config
     * @param _data
     * @param _dispatcher
     * @param _yearDispatcher
     * @param _selectedYears
     */
    constructor(_config, _data, _dispatcher, _yearDispatcher, _selectedYears) {
        this.config = {
            parentElement: _config.parentElement,
            colorScale: _config.colorScale,
            containerWidth: _config.containerWidth || 1600,
            containerHeight: _config.containerHeight || 520,
            margin: _config.margin || {top: 80, right: 20, bottom: 20, left: 70},
            tooltipPadding: _config.tooltipPadding || 15,
        };
        this.dispatcher = _dispatcher;
        this.yearDispatcher = _yearDispatcher;
        this.datacache = _data;
        this.selectedYears = _selectedYears;
        this.data = this.datacache;
        this.selectedArtists = [];
        this.initVis();
    }

    /**
     * We initialize scales/axes and append static elements, such as axis titles.
     */
    initVis() {
        let vis = this;
        const keys = [
            "C",
            "C♯/D♭",
            "D",
            "D♯/E♭",
            "E",
            "F",
            "F♯/G♭",
            "G",
            "G♯/A♭",
            "A",
            "A♯/B♭",
            "B",
        ];

        // Calculate inner chart size. Margin specifies the space around the actual chart.
        vis.width =
            vis.config.containerWidth -
            vis.config.margin.left -
            vis.config.margin.right;
        vis.height =
            vis.config.containerHeight -
            vis.config.margin.top -
            vis.config.margin.bottom;

        // X Scale for Tempo
        vis.xScale = d3.scaleLinear().range([0, vis.width]);

        // Y Scale for Key
        vis.yScale = d3.scaleLinear().range([vis.height - 15, 15]);

        // Initialize axes
        vis.xAxis = d3
            .axisBottom(vis.xScale)
            .ticks(5)
            .tickSize(-vis.height)
            .tickPadding(10);

        // Define a color scale for year
        vis.colorScale = d3
            .scaleLinear()
            .range(["#fa3b3b", "#3369fc"])
            .domain(d3.extent(vis.data, (d) => d.year));

        vis.radiusScale = d3
            .scaleRadial()
            .domain(d3.extent(vis.data, (d) => d.trackPopularity))
            .range([1.0, 17.0]);

        vis.yAxis = d3
            .axisLeft(vis.yScale)
            .ticks(12)
            .tickSize(-vis.width)
            .tickPadding(10)
            .tickFormat((d) => keys[d]);

        // Define size of SVG drawing area
        vis.svg = d3
            .select(vis.config.parentElement)
            .attr("width", vis.config.containerWidth + 50)
            .attr("height", vis.config.containerHeight + 100);

        vis.chart = vis.svg
            .append("g")
            .attr(
                "transform",
                `translate(${vis.config.margin.left + 50},${
                    vis.config.margin.top + 50
                })`
            );

        vis.xAxisG = vis.chart
            .append("g")
            .attr("class", "axis x-axis")
            .attr("transform", `translate(0,${vis.height})`);
        vis.yAxisG = vis.chart.append("g").attr("class", "axis y-axis");
        vis.svg
            .append("text")
            .attr("class", "axis-title-scatterplot")
            .attr(
                "transform",
                `translate(${(vis.width + 50) / 2},${
                    vis.height + vis.config.margin.top + 100
                })`
            )
            .style("text-anchor", "middle")
            .text("Tempo");

        vis.svg
            .append("text")
            .attr("class", "axis-title-scatterplot")
            .attr(
                "transform",
                `translate(${-vis.config.margin.left + 100},${
                    (vis.height) / 2 + 100
                }) rotate(-90)`
            )
            .style("text-anchor", "middle")
            .text("Key");

        vis.chart
            .append("rect")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .attr("fill", "none")
            .attr("stroke", "black")
            .attr("stroke-width", 1);

        this.colorLegend(vis); // adds legend for color with filter
        this.sizeLegend()// adds legend for circle size
    }

    sizeLegend() {
        let vis = this

        // Assuming you have an SVG container with a width and height

        // Coordinates and sizes
        let x = this.config.containerWidth - 300;
        let y = 50;
        let smallCircle = 5;
        let mediumCircle = 12;
        let largeCircle = 20;
        let spaceBetweenCircles = 200;


        // Draw small circle
        vis.svg.append('circle')
            .attr('cx', x)
            .attr('cy', y)
            .attr('r', smallCircle)
            .style('fill', "#4f3cff")
            .style('opacity', '0.8')
            .style('stroke', 'black');

        // Draw medium circle
        vis.svg.append('circle')
            .attr('cx', x + mediumCircle + smallCircle + spaceBetweenCircles / 2)
            .attr('cy', y - 5)
            .attr('r', mediumCircle)
            .style('fill', "#4f3cff")
            .style('opacity', '0.8')
            .style('stroke', 'black');


        // Draw large circle
        vis.svg.append('circle')
            .attr('cx', x + smallCircle + largeCircle + spaceBetweenCircles + 10)
            .attr('cy', y - 10)
            .attr('r', largeCircle)
            .style('fill', "#4f3cff")
            .style('opacity', '0.8')
            .style('stroke', 'black');

        // Draw bracket line under the circles
        let bracketLineStartX = x - 5;
        let bracketLineEndX = x + smallCircle + largeCircle + spaceBetweenCircles + largeCircle + 5;
        vis.svg.append('path')
            .attr('d', `M ${bracketLineStartX} ${y + largeCircle + 5} h ${bracketLineEndX - bracketLineStartX} M ${bracketLineStartX} ${y + largeCircle + 5} v -5 M ${bracketLineEndX} ${y + largeCircle + 5} v -5`)
            .style('stroke', 'black');

        // Add text label
        vis.svg.append('text')
            .attr('x', x + (largeCircle + spaceBetweenCircles) / 2 + 10)
            .attr('y', y + largeCircle + 35)
            .style('text-anchor', 'middle')
            .style('font-size', '20px')
            .text('Popularity');
    }

    colorLegend(vis) {
        // Get unique years from the data and sort them
        let years = [...new Set(vis.data.map(d => d.year))].sort();
        let minYear = Math.min(...years);
        let maxYear = Math.max(...years);

        // Legend dimensions and position
        let legendRectSize = 20;
        let legendSpacing = 4;
        let legendX = 150;
        let legendY = 50;

        // Create a legend group
        let legend = vis.svg.selectAll('.legend')
            .data(years)
            .enter()
            .append('g')
            .attr('class', 'legend')

        // Draw rectangles
        legend.append('rect')
            .attr('width', legendRectSize)
            .attr('height', legendRectSize + 20)
            .style('fill', d => vis.colorScale(d))
            .style('stroke', d => vis.colorScale(d))
            .attr('transform', (d, i) => {
                let width = legendRectSize + legendSpacing;
                let x = legendX + i * width;
                return `translate(${x},${legendY - 10})`;
            })
            .on("mouseover", (event, d) => {
                d3
                    .select("#tooltip")
                    .style("display", "block")
                    .style("left", event.pageX + vis.config.tooltipPadding + "px")
                    .style("top", event.pageY + vis.config.tooltipPadding + "px").html(`
                    <div class="tooltip-text">${d} </div>
                `);
            })
            .on("mouseleave", () => {
                d3.select("#tooltip").style("display", "none");
            })
            .on('click', (event, d) => {
                vis.yearDispatcher.call('yearChanged', event, d);
            });


        vis.svg.append('text')
            .attr('x', legendX + years.indexOf(minYear) * (legendRectSize + legendSpacing) + 20)
            .attr('y', legendY + legendRectSize - 35)
            .style('text-anchor', 'middle')
            .style('font-size', '20px')
            .text(minYear);

        vis.svg.append('text')
            .attr('x', legendX + years.indexOf(maxYear) * (legendRectSize + legendSpacing))
            .attr('y', legendY + legendRectSize - 35)
            .style('text-anchor', 'middle')
            .style('font-size', '20px')
            .text(maxYear);

        vis.svg.append('text')
            .attr('x', legendX + years.indexOf((maxYear + minYear) / 2) * (legendRectSize + legendSpacing))
            .attr('y', legendY + legendRectSize + 40)
            .style('text-anchor', 'middle')
            .style('font-size', '25px')
            .text('Click to filter');
    }

    toggleCategory(selectedYear) {
        let vis = this;
        // Select existing legend rectangles
        let legendRects = vis.svg.selectAll('.legend rect');
        // Update rectangles to active or inactive, based on selected years
        legendRects.attr('class', d => `legend-rect ${vis.selectedYears.includes(d) || vis.selectedYears.length === 0 ? 'active' : 'inactive'}`);
    }


    /**
     * Prepare the data and scales before we render it.
     */
    updateVis(selectedYears) {
        let vis = this;
        vis.selectedYears = selectedYears;

        // Specify accessor functions
        vis.xValue = (d) => d.tempo; // X-axis: Tempo
        vis.yValue = (d) => d.key; // Y-axis: Key
        vis.colorValue = (d) => d.year; // Color: Year

        let minTempo = d3.min(
            vis.datacache.filter((d) => d.tempo > 0),
            vis.xValue
        ); // exclude songs with missing data
        // Set the scale input domains
        vis.xScale.domain([minTempo, d3.max(vis.datacache, vis.xValue)]);
        vis.yScale.domain(d3.extent(vis.data, vis.yValue));
        // vis.radiusScale.domain(d3.extent(vis.data, (d) => d.track_popularity));
        vis.renderVis();
    }

    /**
     * Bind data to visual elements.
     */
    renderVis() {
        let vis = this;

        vis.data = vis.selectedYears && vis.selectedYears.length &&
            vis.datacache.filter(d => vis.selectedYears.includes(d.year)) ||
            vis.datacache;

        // Add circles
        const circles = vis.chart
            .selectAll(".point")
            .data(vis.data)
            .join("circle")
            .attr("class", "point")
            .attr("r", (d) => {
                return vis.radiusScale(d.trackPopularity);
            }) // Circle radius based on popularity
            .attr("cy", (d) => vis.yScale(vis.yValue(d)))
            .attr("cx", (d) => vis.xScale(vis.xValue(d)))
            .attr("stroke", "black") // Outline color
            .attr("stroke-width", function (d) {
                if (vis.selectedArtists.includes(d.artist_name)) {
                    return 1.5;
                } else {
                    return 0.2;
                }
            })
            .attr("fill", function (d) {
                if (vis.selectedArtists.includes(d.artist_name)) {
                    return "#FFF300"; // Point becomes yellow when selected
                } else {
                    return vis.colorScale(vis.colorValue(d));
                }
            }); // Fill color based on year

        // Tooltip event listeners
        circles
            .on("mouseover", (event, d) => {
                d3
                    .select("#tooltip")
                    .style("display", "block")
                    .style("left", event.pageX + vis.config.tooltipPadding + "px")
                    .style("top", event.pageY + vis.config.tooltipPadding + "px").html(`
                    <div class="tooltip-title">Track: ${d.track_name}</div>
                    <ul>
                        <li>Tempo: ${d.tempo}</li>
                        <li>Key: ${d.key}</li>
                        <li>Artist: ${d.artist_name}</li>
                        <li>Popularity: ${d.trackPopularity}</li>
                        <li>Year: ${d.year}</li>
                    </ul>
                `);
            })
            .on("mouseleave", () => {
                d3.select("#tooltip").style("display", "none");
            });

        circles.on("click", function (event, d) {
            if (vis.selectedArtists.includes(d.artist_name)) {
                vis.selectedArtists = vis.selectedArtists.filter(
                    (k) => k !== d.artist_name
                );
            } else {
                if (vis.selectedArtists.length < 2) {
                    vis.selectedArtists.push(d.artist_name);
                }
            }
            vis.dispatcher.call("filterArtists", event, vis.selectedArtists);
        });

        vis.svg.on("click", function (event) {

            if (event.target.id === "scatterplot") {
                vis.selectedArtists = [];
                vis.dispatcher.call('filterArtists', event, vis.selectedArtists);
            }
            vis.dispatcher.call('filterArtists', event, vis.selectedArtists);
        });

        // Update the axes/gridlines
        vis.xAxisG.call(vis.xAxis).call((g) => g.select(".domain").remove());
        vis.yAxisG.call(vis.yAxis).call((g) => g.select(".domain").remove());
    }
}
