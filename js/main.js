// Initialize helper function to convert date strings to date objects
const parseTime = d3.timeParse("%Y-%m-%d");
let initial_data, timeline;

//Load data from CSV file asynchronously and render chart
d3.csv('data/spotify_playlist.csv').then(data => {
  initial_data = data.forEach(d => {
    d.year = +d.year;
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
  });
  
  barChart = new Barchart({
    parentElement: '#vis',
    songAttributes: ["danceability", "liveliness", "energy", "acousticness", "instrumentalness", "valence", "tempo", "speechiness"]
  }, data);

});
