
let rectChart;
d3.csv('data/playlist_2010to2022.csv').then(data => {
    data.forEach(d => {

      d.trackPopularity = +d.track_popularity;
      d.year = +d.year;
      d.danceability = +d.danceability;
      // Optional: other data preprocessing steps
    });
    
    rectChart = new RectChart({
      parentElement: '#rectangle-chart' 
    }, data);

  });

  d3.select('#sort-selector').on('change', function() {

    // Get selected display type and update chart
    rectChart.config.sortBy = d3.select(this).property('value');
    rectChart.updateVis();
  
  });
  