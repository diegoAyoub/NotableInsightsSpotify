class RectChart {

    /**
     * Class constructor with basic chart configuration
     * @param {Object}
     */
    // Todo: Add or remove parameters from the constructor as needed
    constructor(_config, data) {
        this.config = {
            parentElement: _config.parentElement,
        containerWidth: 260,
        containerHeight: 720,
        margin: {
          top: 60,
          right: 15,
          bottom: 20,
          left: 30
        },
            tooltipPadding: 5,
            selectedAttribute: rectFilter.attribute,
            selectedYear: rectFilter.year,
            sortBy: 'popularity'
        }
        this.data = data;
        this.initVis();
    }

    initVis() {
        let vis = this;
      // Todo: Create SVG area, chart, initialize scales and axes, add titles, etc
        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;
        //Initialize Scales
        vis.yScale = d3.scaleBand()
            .range([0, vis.height]);

        vis.xScale = d3.scaleBand()
            .domain([1])
            .range([0, vis.width])
            .paddingInner(0.1);

        vis.colorScale = d3.scaleLinear()
          .domain([0,1])
            .range(['#ffffff', '#7733ff']);

        vis.xAxis = d3.axisBottom(vis.xScale)
            .tickFormat(d => '')
            .tickSize(0);

        vis.yAxis = d3.axisLeft(vis.yScale)
            .tickSize(1)
            .ticks(5)
            .tickSizeOuter(0)
            .tickPadding(10)
            .tickFormat(d => d);

        //define drawing area size
        vis.svg = d3.select(vis.config.parentElement)
            .attr('width', vis.config.containerWidth)
            .attr('height', vis.config.containerHeight);

        //append group element containing chart
        vis.chart = vis.svg.append('g')
          .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

        // Append empty x-axis group and move it to the bottom of the chart
        vis.xAxisG = vis.chart.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(0,${vis.height})`);

        // Append y-axis group
        vis.yAxisG = vis.chart.append('g')
            .attr('class', 'axis y-axis')
            .attr('transform', `translate(0,0)`);

        vis.chart.append('text')
            .attr('class', 'axis-title')
            .attr('x', 0)
            .attr('y', 0)
          .attr('dy',-40)
            .attr('dx', -15)
            .attr('text-anchor', 'start')
            .text('Songs by Attribute and Popularity');

        vis.chart.append('text')
            .attr('class', 'axis-title')
            .attr('x', 0)
            .attr('y', 0)
          .attr('dy',-22)
            .attr('dx', 25)
            .attr('text-anchor', 'start')
            .text(`Year Selected: ${vis.config.selectedYear}`);

        vis.chart.append('text')
            .attr('class', 'axis-title')
            .attr('x', 0)
            .attr('y', 0)
        .attr('dy',-7)
            .attr('dx', 0)
            .attr('text-anchor', 'start')
            .text(`Attribute Selected: ${vis.config.selectedAttribute}`);

        vis.updateVis();

    }

    updateVis() {
        let vis = this;
        vis.config.selectedAttribute = rectFilter.attribute;
        vis.config.selectedYear = rectFilter.year;
        vis.xValue = d => 1;
        vis.yValue = d => {
        if(vis.config.sortBy == 'popularity'){
          return d.trackPopularity;
        } else{
                return d[vis.config.selectedAttribute];
            }
        }
        vis.filteredData = vis.data.filter(d => d.year == 2021);
        console.log(vis.filteredData.length);
        vis.colorVal = d => d.danceability;
        vis.uniqueYears = vis.filteredData;

        if(vis.config.sortBy == 'popularity'){
            // vis.yScale.domain(vis.filteredData.map(vis.yValue).sort((a,b) => a.trackPopularity - b.trackPopularity));
            vis.sortedData = vis.filteredData.sort((a,b) => a.trackPopularity - b.trackPopularity);
          } else{
            vis.sortedData = vis.filteredData.sort((a,b) => a[vis.config.selectedAttribute] - b[vis.config.selectedAttribute]);
        }

        vis.yScale.domain(vis.filteredData.map(d => d.track_id));
        vis.yAxis.tickFormat(d => '' + (vis.filteredData.find(v => v.track_id == d)).trackPopularity);
    
        //vis.sortedData = vis.filteredData.map(vis.yValue).sort((a,b) => a - b);
        console.log(vis.sortedData);
      
        //console.log(vis.filteredData.sort((a, b) => a.trackPopularity - b.trackPopularity));

    //   if(vis.config.sortBy == 'popularity'){
    //     // vis.yScale.domain(vis.filteredData.map(vis.yValue).sort((a,b) => a.trackPopularity - b.trackPopularity));
    //     vis.yScale.domain(vis.filteredData.map(vis.yValue).sort((a,b) => a.trackPopularity - b.trackPopularity));
    //   } else{
    //     vis.yScale.domain(vis.filteredData.map(vis.yValue).sort((a,b) => a.danceability - b.danceability));
    //     }
        vis.renderVis();

    }

    renderVis() {
        let vis = this;

        //render circles onto chart
        const rectangles = vis.chart.selectAll('.bar')
      .data(vis.filteredData, d => d.track_id)
            .join('rect')
            .attr('class', 'bar')
            .attr('x', 0)
            .attr('width', vis.xScale.bandwidth())
            .attr('height', vis.yScale.bandwidth())
            .attr('y', d => vis.yScale(d.track_id))
            .attr('fill', d => vis.colorScale(vis.colorVal(d)))
            .attr('stroke-width', 1)
            .attr('stroke', 'black');

        // Tooltip mouseover event

        rectangles
      .on('mouseover', (event,d) => {
                d3.select('#tooltip')
                    .style('display', 'block')
                    .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')
                    .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
                    .html(`
            <div class="tooltip-bold">Artist: ${d.artist_name} </div>
            <div class="tooltip-bold">Song: ${d.track_name} </div>
            <div class="tooltip-text">Popularity (0-99): ${d.trackPopularity}</div>
            <div class="tooltip-text">Atrribute (0-1): ${d.danceability} </div>
          `);
            })
            .on('mouseleave', () => {
                d3.select('#tooltip').style('display', 'none');
            });


        //update axis
        vis.xAxisG
            .call(vis.xAxis)
            .call(g => g.select('.domain').remove());

        vis.yAxisG
            .call(vis.yAxis)
            .call(g => g.select('.domain').remove());
    }

}

function uniqueFilter(value, index, self) {
    return self.indexOf(value) === index;
}