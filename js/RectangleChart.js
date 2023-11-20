class RectangleChart {

    /**
     * Class constructor with basic chart configuration
     * @param {Object}
     */
    // Todo: Add or remove parameters from the constructor as needed
    constructor(_config, data) {
      this.config = {
        parentElement: _config.parentElement,
        containerWidth: 720,
        containerHeight: 260,
        margin: {
          top: 30,
          right: 15,
          bottom: 20,
          left: 30
        },
        tooltipPadding: 15,
        countryType: "oecd"
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
      vis.yScale = d3.scaleLinear()
          .domain([25,95])
          .range([vis.height,0]);
      
      //const extent = d3.extent(vis.data, d => d.pcgdp);
      vis.xScale = d3.scaleLinear()
          .range([0,vis.width]);
      
      vis.xAxis = d3.axisBottom(vis.xScale)
          .ticks(6)
          .tickSize(-vis.height + 15)                  
          .tickPadding(5);
  
      vis.yAxis = d3.axisLeft(vis.yScale)
          .ticks(6)
          .tickSize(-vis.width - 10)
          .tickSizeOuter(0)
          .tickPadding(13);
  
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
      
      //append reset area on scatterplot
      const rectangle = vis.chart.append('rect')
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', vis.width)
          .attr('height', vis.height)
          .attr('class', 'resetArea')
          .attr('fill-opacity', 0)
          .on('click', function(event, d) {
            leaderHighlight = [];
            genderFilter = []; 
            resetEverything();
          });
  
      // axis titles
      vis.chart.append('text')
          .attr('class', 'axis-title')
          .attr('y', vis.height)
          .attr('x', 0)
          .attr('dy', 30)
          .attr('dx',0)
          .style('text-anchor', 'start')
          .text('Accuracy');
  
      vis.chart.append('text')
          .attr('class', 'axis-title')
          .attr('x', 0)
          .attr('y', 0)
          .attr('dy',0)
          .attr('dx', -15)
          .attr('text-anchor', 'start')
          .text('Age');
  
      vis.chart.append('text')
          .attr('class', 'axis-title')
          .attr('x', vis.width)
          .attr('y', vis.height)
          .attr('dy',0)
          .attr('dx', -150)
          .attr('text-anchor', 'start')
          .text('GDP per Capita (US$)');
    
    }
  
    updateVis() {
      let vis = this;
  
      vis.xValue = d => {
        return d.pcgdp;
      }
      
      vis.yValue = d => d.start_age;
      vis.filteredData = vis.data.filter(d => ((d.pcgdp !== null) && vis.filterHelper(d)));
  
      vis.xScale.domain(d3.extent(vis.filteredData, d => d.pcgdp))
      
      vis.renderVis();
      
    }
  
    renderVis() {
      let vis = this;
      
      //render circles onto chart
      const points = vis.chart.selectAll('.point')
          .data(vis.filteredData, d => d.id)
          .join('circle')
          .attr('class', d => vis.classHelper(d))
          .attr('r', 5)
          .attr('cy', d => vis.yScale(vis.yValue(d)))
          .attr('cx', d => vis.xScale(vis.xValue(d)))
          .attr('fill-opacity',d => vis.opacityHelper(d))
          .attr('fill', 'darkgray')
          .on('click', function(event, d) {
            const isActive = leaderHighlight.includes(d.id);
            if (isActive) {
              leaderHighlight = leaderHighlight.filter(f => f !== d.id); // Remove filter
            } else if(vis.opacityHelper(d) !== 0.15) {
              leaderHighlight.push(d.id); // Append filter
            } 
            
            d3.select(this).classed('active', !isActive); // Add class to style active filters with CSS
            updateHighlight(); // Call global function to update scatter plot
          });
      
  
      //tooltip 
      points
        .on('mouseover', (event,d) => {
          if((d.pcgdp != null) && (vis.opacityHelper(d)!== 0.15)){
  
            d3.select('#tooltip')
            .style('display', 'block')
            .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')   
            .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
            .html(`
              <div class="tooltip-bold">${d.leader}</div>
              <div class="tooltip-text">${d.country}, ${d.start_year} - ${d.end_year}</div>
              <div class="tooltip-text">Age at Inaguration: ${d.start_age}</div>
              <div class="tooltip-text">Time in Office: ${d.duration}</div>
              <div class="tooltip-text">GDP/Capita: ${d.pcgdp}</div>
    
            `);
          } else if(vis.opacityHelper(d)!== 0.15) {
            d3.select('#tooltip')
            .style('display', 'block')
            .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')   
            .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
            .html(`
              <div class="tooltip-bold">${d.leader}</div>
              <div class="tooltip-text">${d.country}, ${d.start_year} - ${d.end_year}</div>
              <div class="tooltip-text">Age at Inaguration: ${d.start_age}</div>
              <div class="tooltip-text">Time in Office: ${d.duration}</div>`);
            
          }
        })
        .on('mouseleave', () => {
          d3.select('#tooltip').style('display', 'none');
        }).attr('marker-end', 'url(#arrow-head)');
  
  
      //update axis
      vis.xAxisG
          .call(vis.xAxis)
          .call(g => g.select('.domain').remove());
  
      vis.yAxisG
          .call(vis.yAxis)
          .call(g => g.select('.domain').remove());
    }
  
  
    
  
    //helpers!
    filterHelper(val){
      let vis = this;
      switch(vis.config.countryType){
        case "oecd":
          return(val.oecd == 1);
        case "brics":
          return (val.brics == 1);
        case "gseven":
          return (val.gseven == 1);
        case "gtwenty":
          return (val.gtwenty == 1);
        case "eu27":
          return (val.eu27 == 1);
      }
     
    }
  
    opacityHelper(val){
      let vis = this;
      if(genderFilter.length == 0 || genderFilter.includes(val.gender)){
        return 0.70;
      }
      let index = leaderHighlight.indexOf(val.id);
        if(index !== -1){
        leaderHighlight.splice(index,1);
        updateHighlight();
       }
      return 0.15;
    }
  
    classHelper(val){
      let vis = this;
      
      if(leaderHighlight.includes(val.id)){
        return 'point active';
      } else if(vis.opacityHelper(val) == 0.70){
        return 'point unselected'
      }
  
      return 'point'
    }
  }