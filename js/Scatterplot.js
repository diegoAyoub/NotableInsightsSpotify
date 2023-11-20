class Scatterplot {

    /**
     * Class constructor with basic chart configuration
     * @param {Object}
     * @param {Array}
     */
    constructor(_config, _data) {
        this.config = {
            parentElement: _config.parentElement,
            colorScale: _config.colorScale,
            containerWidth: _config.containerWidth || 1100,
            containerHeight: _config.containerHeight || 350,
            margin: _config.margin || {top: 25, right: 20, bottom: 20, left: 35},
            tooltipPadding: _config.tooltipPadding || 15
        }
        this.data = _data;
        this.initVis();
    }

    /**
     * We initialize scales/axes and append static elements, such as axis titles.
     */
    initVis() {
        let vis = this;
        const keys = ["C", "C♯/D♭", "D", "D♯/E♭", "E", "F", "F♯/G♭", "G", "G♯/A♭", "A", "A♯/B♭", "B"];

        // Calculate inner chart size. Margin specifies the space around the actual chart.
        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

        // X Scale for Tempo
        vis.xScale = d3.scaleLinear()
            .range([0, vis.width])

        // Y Scale for Key
        vis.yScale = d3.scaleLinear()
            .range([vis.height - 15, 15])

        // Initialize axes
        vis.xAxis = d3.axisBottom(vis.xScale)
            .ticks(5)
            .tickSize(-vis.height)
            .tickPadding(10);

        // Define a color scale for year
        vis.colorScale = d3.scaleLinear()
            .range(['#c40c0c', '#002786'])
            .domain((d3.extent(vis.data, d => d.year)));

        vis.radiusScale = d3.scaleLinear()
            .domain(d3.extent(vis.data, d => d.track_popularity))
            .range([15.0, 1.0]);

        vis.yAxis = d3.axisLeft(vis.yScale)
            .ticks(12)
            .tickSize(-vis.width)
            .tickPadding(10)
            .tickFormat(d => keys[d])

        // Define size of SVG drawing area
        vis.svg = d3.select(vis.config.parentElement)
            .attr('width', vis.config.containerWidth + 50)
            .attr('height', vis.config.containerHeight + 100);

        // Append group element that will contain our actual chart
        // and position it according to the given margin config
        vis.chart = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.margin.left + 40},${vis.config.margin.top + 50})`);

        // Append empty x-axis group and move it to the bottom of the chart
        vis.xAxisG = vis.chart.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(0,${vis.height})`);

        // Append y-axis group
        vis.yAxisG = vis.chart.append('g')
            .attr('class', 'axis y-axis');

        // Append axis titles
        vis.svg.append('text')
            .attr('class', 'axis-title')
            .attr('transform', `translate(${(vis.width + 50)/2},${vis.height + vis.config.margin.top + 100})`)
            .style('text-anchor', 'middle')
            .text('Tempo');

        vis.svg.append('text')
            .attr('class', 'axis-title')
            .attr('transform', `translate(${-vis.config.margin.left + 50},${(vis.height+50)/2}) rotate(-90)`)
            .style('text-anchor', 'middle')
            .text('Key');

        vis.chart.append('rect')
            .attr('width', vis.width)
            .attr('height', vis.height)
            .attr('fill', 'none')  // No fill, only border
            .attr('stroke', 'black')  // Border color
            .attr('stroke-width', 1);  // Border width

// // Add the path using this helper function
//         vis.svg.append('rectangle')
//             .attr('x', 100)
//             .attr('y', 100)
//             .attr('width',100)
//             .attr('height', 50)
//             .attr('stroke', 'black')
//             .attr('fill', '#69a3b2');

    }


    /**
     * Prepare the data and scales before we render it.
     */
    updateVis() {
        let vis = this;

        // Specify accessor functions
        vis.xValue = d => d.tempo;  // X-axis: Tempo
        vis.yValue = d => d.key;    // Y-axis: Key
        vis.colorValue = d => d.year;  // Color: Year

        let minTempo = d3.min(vis.data.filter(d => d.tempo > 0), vis.xValue); // exclude songs with missing data

        // Set the scale input domains
        vis.xScale.domain([minTempo, d3.max(vis.data, vis.xValue)]);
        vis.yScale.domain(d3.extent(vis.data, vis.yValue));

        vis.renderVis();
    }


    /**
     * Bind data to visual elements.
     */
    renderVis() {
        let vis = this;

        // Add circles
        const circles = vis.chart.selectAll('.point')
            .data(vis.data)
            .join('circle')
            .attr('class', 'point')
            .attr('r', d => vis.radiusScale(d.track_popularity))  // Circle radius based on popularity
            .attr('cy', d => vis.yScale(vis.yValue(d)))
            .attr('cx', d => vis.xScale(vis.xValue(d)))
            .attr('stroke', 'black')  // Outline color
            .attr('fill', d => vis.colorScale(vis.colorValue(d)));  // Fill color based on year

        // Tooltip event listeners
        circles
            .on('mouseover', (event, d) => {
                d3.select('#tooltip')
                    .style('display', 'block')
                    .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')
                    .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
                    .html(`
                    <div class="tooltip-title">Track: ${d.track_name}</div>
                    <ul>
                        <li>Tempo: ${d.tempo}</li>
                        <li>Key: ${d.key}</li>
                        <li>Popularity: ${d.track_popularity}</li>
                        <li>Year: ${d.year}</li>
                    </ul>
                `);
            })
            .on('mouseleave', () => {
                d3.select('#tooltip').style('display', 'none');
            });

        // Update the axes/gridlines
        vis.xAxisG
            .call(vis.xAxis)
            .call(g => g.select('.domain').remove());

        vis.yAxisG
            .call(vis.yAxis)
            .call(g => g.select('.domain').remove());
    }

}