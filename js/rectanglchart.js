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
            containerHeight: 1200,
            margin: {
                top: 60,
                right: 20,
                bottom: 20,
                left: 45
            },
            tooltipPadding: 5,
            selectedAttribute: rectFilter.attribute,
            selectedYear: rectFilter.year,
            sortBy: 'popularity',
            color: {
                "danceability": danceabilityColor, 
                "liveness": livenessColor,
                "energy": energyColor,
                "acousticness": acousticnessColor,
                "valence": valenceColor,
                "tempo": tempoColor,
                "speechiness": speechinessColor
            }
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
            .tickFormat(d => '');
  
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
            .attr('class', 'rectchart-subtitle axis-label')
            .attr('x', 0)
            .attr('y', 0)
            .attr('dy',15)
            .attr('dx', -40)
            .attr('text-anchor', 'start')
            .attr('font-weight', 'bold')
            .text('Low');
        
        vis.chart.append('text')
            .attr('class', 'rectchart-subtitle axis-label')
            .attr('x', 0)
            .attr('y', vis.height)
            .attr('dy',0)
            .attr('dx', -41)
            .attr('text-anchor', 'start')
            .attr('font-weight', 'bold')
            .text('High');
  
        vis.chart.append('text')
            .attr('class', 'rectchart-axis-title')
            .attr('x', 0)
            .attr('y', 0)
            .attr('dy',-40)
            .attr('dx', -30)
            .attr('text-anchor', 'start')
            .text('Songs by Attribute and Popularity');
  
        vis.yearSubtitle = vis.chart.append('text')
            .attr('class', 'rectchart-subtitle year')
            .attr('x', 0)
            .attr('y', 0)
            .attr('dy',-21)
            .attr('dx', 160)
            .attr('text-anchor', 'end')
            .text(`Year Selected: ${vis.config.selectedYear}`);
  
        vis.attributeSubtitle = vis.chart.append('text')
            .attr('class', 'rectchart-subtitle attr')
            .attr('x', 0)
            .attr('y', 0)
            .attr('dy',-5)
            .attr('dx', 190)
            .attr('text-anchor', 'end')
            .text(`Attribute Selected: ${vis.config.selectedAttribute}`);
  
        vis.updateVis();
  
    }
  
    updateVis() {
        let vis = this;
        vis.config.selectedAttribute = rectFilter.attribute;
        // update color as scale as well

        let color = vis.config.color[vis.config.selectedAttribute]

        vis.colorScale = d3.scaleLinear()
            .domain([0,1])
            .range(['#ffffff', color]);
    
        d3.selectAll(".rectchartlegend")
            .style("background", `linear-gradient(to right, #ffffff, ${color})`);
        

        vis.config.selectedYear = rectFilter.year;
        vis.xValue = d => 1;
        vis.yValue = d => {
        if(vis.config.sortBy == 'popularity'){
          return d.trackPopularity;
        } else{
                return d[vis.config.selectedAttribute];
            }
        }
        vis.filteredData = vis.data.filter(d => d.year == vis.config.selectedYear);
        vis.colorVal = d => d[vis.config.selectedAttribute];
        vis.uniqueYears = vis.filteredData;
  
        if(vis.config.sortBy == 'popularity'){
            // vis.yScale.domain(vis.filteredData.map(vis.yValue).sort((a,b) => a.trackPopularity - b.trackPopularity));
            vis.sortedData = vis.filteredData.sort((a,b) => a.trackPopularity - b.trackPopularity);
          } else{
            vis.sortedData = vis.filteredData.sort((a,b) => a[vis.config.selectedAttribute] - b[vis.config.selectedAttribute]);
        }
  
        vis.yScale.domain(vis.filteredData.map(d => d.track_id));
        //vis.yAxis.tickFormat(d => '' + (vis.filteredData.find(v => v.track_id == d)).trackPopularity);
        
        vis.yearSubtitle.text(`Year Selected: ${vis.config.selectedYear}`);
        vis.attributeSubtitle.text(`Attribute Selected: ${vis.config.selectedAttribute}`);
  
        if(vis.config.selectedAttribute == 'tempo' ){
            var colorExtent = d3.extent(vis.filteredData.map(d => d.tempo));
            // vis.colorScale.domain(colorExtent);
            vis.colorScale.domain([60,211]);
  
        } else{
            vis.colorScale.domain([0, 1]);
        }
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
            <div class="tooltip-text">popularity (0-99): ${d.trackPopularity}</div>
            <div class="tooltip-text">${vis.config.selectedAttribute}: ${d[vis.config.selectedAttribute]} </div>
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