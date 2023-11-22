const parseTime = d3.timeParse("%Y-%m-%d");
let initial_data, timeline, rectChart, scatterplot;

d3.csv('data/spotify_playlist.csv').then(data => {
  initial_data = data.forEach(d => {
    d.year = +d.year;
    d.trackPopularity = +d.track_popularity;
    d.date = +d.date;
    d.danceability = +d.danceability;
    d.energy = +d.energy;
    d.loudness = +d.loudness;
    d.speechiness = +d.speechiness;
    d.acousticness = +d.acousticness;
    d.instrumentalness = +d.instrumentalness;
    d.liveness = +d.liveness;
    d.valence = +d.valence;
    d.tempo = +d.tempo;
    d.key = +d.key;
  });
  
  // barChart = new Barchart({
  //   parentElement: '#vis',
  //   songAttributes: ["danceability", "liveliness", "energy", "acousticness", "instrumentalness", "valence", "tempo", "speechiness"]
  // }, data);

    rectChart = new RectChart({
        parentElement: '#rectangle-chart',
    }, data);
    rectChart.updateVis();  // If RectChart has an update method

    // Initialize Scatterplot
    scatterplot = new Scatterplot({
        parentElement: '#scatterplot',
    }, data);
    scatterplot.updateVis();
});

// Event listeners for interactivity, if needed
// Example: if you have a sort selector that should update both charts
d3.select('#sort-selector').on('change', function() {
    const sortBy = d3.select(this).property('value');

    // Update Rectangle Chart
    rectChart.config.sortBy = sortBy;
    rectChart.updateVis();

    // Update Scatterplot if it has similar sorting functionality
    scatterplot.config.sortBy = sortBy;
    scatterplot.updateVis();
});

  
