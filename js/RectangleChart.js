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
          top: 30,
          right: 15,
          bottom: 20,
          left: 30
        },
        
        // Todo: Add or remove attributes from config as needed
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
          .range(['lightgreen', 'darkgreen']);
      
      vis.xAxis = d3.axisBottom(vis.xScale);
  
      vis.yAxis = d3.axisLeft(vis.yScale)
          .tickSize(1)
          .ticks(5)
          .tickSizeOuter(0)
          .tickPadding(10);
  
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
      
      
      
  
      // axis titles
      vis.chart.append('text')
          .attr('class', 'axis-title')
          .attr('y', vis.height)
          .attr('x', 0)
          .attr('dy', 30)
          .attr('dx',0)
          .style('text-anchor', 'start')
          .text('Accuracy');
  
      // vis.chart.append('text')
      //     .attr('class', 'axis-title')
      //     .attr('x', 0)
      //     .attr('y', 0)
      //     .attr('dy',0)
      //     .attr('dx', -15)
      //     .attr('text-anchor', 'start')
      //     .text('Age');
  
      // vis.chart.append('text')
      //     .attr('class', 'axis-title')
      //     .attr('x', vis.width)
      //     .attr('y', vis.height)
      //     .attr('dy',0)
      //     .attr('dx', -150)
      //     .attr('text-anchor', 'start')
      //     .text('GDP per Capita (US$)');
      
    vis.updateVis();
    
    }
  
    updateVis() {
      let vis = this;
  
      // vis.xValue = d => {
      //   return d.pcgdp;
      // }
      vis.xValue = d => 1;
      vis.yValue = d => d.trackPopularity;
      vis.filteredData = vis.data.filter(d => d.year == 2021);
      vis.colorVal = d => d.danceability;
      vis.uniqueYears = vis.filteredData.map(vis.yValue).filter(vis.uniqueFilter);
      console.log(vis.uniqueYears.sort((a, b) => a - b));
      vis.yScale.domain(vis.uniqueYears.sort((a,b) => a - b));
      
      vis.renderVis();
      
    }
  
renderVis() {
  let vis = this;
  
  //render circles onto chart
  const rectangles = vis.chart.selectAll('.bar')
      .data(vis.filteredData, d => d.trackPopularity)
      .join('rect')
      .attr('class', 'bar')
      // .attr('x', d => vis.xScale(vis.xValue(d)))
      .attr('x', d => vis.xScale.bandwidth()/2)
      .attr('width', vis.xScale.bandwidth())
      .attr('height', vis.yScale.bandwidth())
      .attr('y', d => vis.yScale(vis.yValue(d)))
      .attr('fill', d => vis.colorScale(vis.colorVal(d)))
      .attr('stroke-width', 3);

  //update axis
  vis.xAxisG
      .call(vis.xAxis)
      .call(g => g.select('.domain').remove());

  vis.yAxisG
      .call(vis.yAxis)
      .call(g => g.select('.domain').remove());
  }


uniqueFilter(value, index, self) {
    return self.indexOf(value) === index;
}

sortHelper (a, b) {
  return b - a;
}

}