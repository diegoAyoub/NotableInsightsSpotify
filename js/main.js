// Initialize helper function to convert date strings to date objects
const parseTime = d3.timeParse("%Y-%m-%d");
let initial_data, timeline;

//Load data from CSV file asynchronously and render chart
d3.csv('data/spotify_playlist.csv').then(data => {
  data.forEach(d => {
    d.year = +d.year;
    d.date = +d.date;
    d.dancibility = +d.dancibility;
    d.energy = +d.energy;
    d.loudness = +d.loudness;
    d.speechiness = +d.speechiness;
    d.acousticness = +d.acousticness;
    d.instrumentalness = +d.instrumentalness;
    d.liveness = +d.liveness;
    d.valence = +d.valence;
    d.tempo = +d.tempo;
  });
  initial_data = data;
  
  barChart = new Barchart({
    parentElement: '#vis',
    songAttributes: ["dancibility", "liveliness", "energy", "acousticness", "instrumentalness", "valence", "tempo", "loudness", "speechiness"]
  }, data);

});

// function filterData() {
//   if (timeline.selectedCategories.length == 0) {
//     timeline.data = initial_data;
//   } else {
//     timeline.data = initial_data.filter(d => timeline.selectedCategories.includes(d.category));
//   }
//   timeline.updateVis();
// }