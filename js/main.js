let initial_data, rectChart, scatterplot, spiderChart;
const dispatcher = d3.dispatch('filterArtists');
const yearDispatcher = d3.dispatch('yearChanged');
let selectedYears = [];
let rectFilter;

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

    rectFilter = {attribute: 'danceability', year: 2021};
    rectChart = new RectChart({
        parentElement: '#rectangle-chart',
    }, data);
    rectChart.updateVis();  // If RectChart has an update method

    // Initialize Scatterplot
    scatterplot = new Scatterplot({
        parentElement: '#scatterplot',
    }, data, dispatcher, yearDispatcher, selectedYears);
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
  spiderChart.selectedArtists = selectedArtists;
  spiderChart.updateVis();
  scatterplot.updateVis();
  scatterplot.updateVis(selectedYears);
});

yearDispatcher.on('yearChanged', (year) => {
  updateSelectedYears(year);
  barChart.updateVis(selectedYears);
  scatterplot.updateVis(selectedYears);
  scatterplot.toggleCategory(selectedYears);
});

function updateSelectedYears(year) {
  // If the selected years array already includes the year, remove it
  if (selectedYears.includes(year)) {
    selectedYears = selectedYears.filter(k => k !== year);
  } else {
    // Add the year to the selected years array
    selectedYears.push(year);
  }
}

function filterRectangleChart(attr, val) { //@TODO ADD YEAR LATER
  //update filter and then rectchart after click on bar chart
  rectFilter = {attribute: attr, year: val[1]};
  rectChart.updateVis();

}
