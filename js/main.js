

d3.csv('data/playlist_2010to2022.csv').then(data => {
    data.forEach(d => {

      d.trackPopularity = +d.track_popularity;
      d.year = +d.year;
      d.danceability = +d.danceability;
      // Optional: other data preprocessing steps
    });
    
    const rectChart = new RectChart({
      parentElement: '#rectangle-chart' 
    }, data);

  });
  