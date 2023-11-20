d3.csv('data/playlist_2010to2022.csv').then(_data => {
    data = _data;
    data.forEach(d => {

      d.trackPopularity = +d.track_popularity;
      d.year = +d.year;
      d.danceability = +d.danceability
      // Optional: other data preprocessing steps
    });
    
    rectangleChart = new RectangleChart({
      parentElement: '#rectangle-chart',
      // Optional: other configurations
    }, data);
    //timeline.updateVis()
  });
  