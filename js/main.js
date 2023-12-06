const parseTime = d3.timeParse("%Y-%m-%d");
let initial_data, timeline, rectChart, scatterplot, spiderChart;
const dispatcher = d3.dispatch('filterArtists');
const yearDispatcher = d3.dispatch('yearChanged');
let selectedYears = [];
let selectedArtists = [];

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
      d.artistPopularity = +d.artist_popularity;
      d.liveness = +d.liveness;
    });

    let yearData = data.map(d => d.year).filter((v, i, a) => a.indexOf(v) === i);
  
    barChart = new Barchart({
      parentElement: '#bar-chart',
      songAttributes: ["danceability", "liveness", "energy", "acousticness", "valence", "tempo", "speechiness"],
      yearAttributes: yearData,
    }, data, yearDispatcher, selectedYears);

    rectChart = new RectChart({
        parentElement: '#rectangle-chart',
    }, data);
    rectChart.updateVis();  // If RectChart has an update method

    // Initialize Scatterplot
    scatterplot = new Scatterplot({
        parentElement: '#scatterplot',
    }, data, dispatcher);
    scatterplot.updateVis();
    
    spiderChart = new SpiderChart({
      parentElement: "#spider-chart"
    }, data);
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

dispatcher.on('filterArtists', (selectedArtists) => {
  console.log(selectedArtists);
  spiderChart.selectedArtists = selectedArtists;
  spiderChart.drawChart();
  scatterplot.updateVis();

});

yearDispatcher.on('yearChanged', (year) => {

  updateSelectedYears(year);
  barChart.updateVis(selectedYears);
});

function updateSelectedYears(year) {
  // If the selected years array already includes the year, remove it
  if (selectedYears.includes(year)) {
    selectedYears = selectedYears.filter(k => k !== year);
  } else {
    // Add the year to the selected years array
    selectedYears.push(year);
  }
  console.log("Current selected years" + selectedYears);
};