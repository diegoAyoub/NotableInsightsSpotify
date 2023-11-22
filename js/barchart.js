class Barchart {
    constructor(_config, _data) {
        this.config = {
            parentElement: _config.parentElement,
            songAttributes: _config.songAttributes,
            legendX: 50,
            legendY: -75,
            legendRadius: 10,
            containerWidth: 2000,
            containerHeight: 700,
            margin: {
                top: 100,
                right: 40,
                bottom: 30,
                left: 40
            },
            color: ["#f26b21", "#f78e31", "#fbb040", "#fcec52", "#cbdb47", "#99ca3c", "#208b3a"]
        }
        this.data = _data;
        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

        vis.svg = d3.select(vis.config.parentElement)
            .append("svg")
            .attr("width", vis.config.containerWidth)
            .attr("height", vis.config.containerHeight)
            .append("g")
            .attr("transform", `translate(${vis.config.margin.left},${vis.config.margin.top})`);

        // getting years from data
        vis.years = new Set(vis.data.map(d => d.year));

        // adding x-axis
        vis.xScale = d3.scaleBand()
            .domain(vis.years)
            .range([0, vis.width]);
        
        vis.xAxis = d3.axisBottom(vis.xScale)
            .tickSizeOuter(0)
            .tickSize(0)
            .tickPadding(8);
        
        vis.svg.append("g")
            .attr("class", "x_axis_barchart")
            .attr("transform", `translate(0,${vis.height})`)
            .call(vis.xAxis)
            .call(g => g.selectAll(".domain").remove());

        // adding bars
        const xbars = vis.config.songAttributes
        
        vis.bars = d3.scaleBand()
            .domain(xbars)
            .range([0, vis.xScale.bandwidth()])
            .padding(0.05)

        // adding colours
        vis.color = d3.scaleOrdinal()
            .domain(xbars)
            .range(vis.config.color)

        // adding y-axis
        vis.yScaleLeft = d3.scaleLinear()
            .domain([0, 1])
            .range([vis.height, 0]);
        
        vis.yAxisLeft = d3.axisLeft(vis.yScaleLeft)
            .tickSizeOuter(0)
            .tickSize(0)
            .tickPadding(8);

        vis.svg.append("g")
            .attr("class", "y_axis_barchart_left")
            .call(vis.yAxisLeft)

        vis.yScaleRight = d3.scaleLinear()
            .range([vis.height, 0])
            .domain([0, d3.max(vis.data, d => d.tempo)]);

        vis.yAxisRight = d3.axisRight(vis.yScaleRight)
            .tickSizeOuter(0)
            .tickSize(0)
        
        vis.svg.append("g")
            .attr("class", "y_axis_barchart_right")
            .attr("transform", `translate(${vis.width},0)`)
            .call(vis.yAxisRight)
        
        
        vis.svg.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", `translate(0,${vis.height})`);

        vis.svg.append("g")
            .attr("class", "y-axis axis");

        // creating area for legend
        vis.legend = vis.svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${vis.config.legendX},${vis.config.legendY})`)

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        vis.groupedData = d3.group(vis.data, d => d.year)
        vis.aggregatedData = vis.aggregateData(vis.groupedData)

        vis.xScale.domain(vis.years)

        vis.xAxis = d3.axisBottom(vis.xScale)
            .tickSizeOuter(0)
            .tickSize(0)
            .tickPadding(8);

        vis.svg.selectAll(".x_axis_barchart")
            .call(vis.xAxis)
        
        vis.renderVis();
    }

    renderVis() {
        let vis = this;
        var groups = vis.data.columns.slice(1);
        // console.log(groups)

        // level 1: group by years
        const yearGroup = vis.svg.selectAll('.year-groups')
            .data(vis.groupedData, d => d[0])
        
        const yearGroupEnter = yearGroup.join('g')
            .attr('class', d => 'year-groups-'+d[0])
            .attr('transform', d => `translate(${vis.xScale(d[0])},0)`)
        
        yearGroupEnter.merge(yearGroup);

        var bars = yearGroupEnter.selectAll('.category-bars')
            .data(function(d) {
                let subgroups = groups.map(function(key) { return {key: key, value: d[1][0][key]} })
                subgroups = subgroups.filter(function(d) { return vis.config.songAttributes.includes(d.key) })
                return subgroups
            } )
            .join('g')
            .attr('class', d => d.key + '-bars')
            .append("rect")
            // .attr('class', d.key+'_bar')
            .attr('x', d => vis.bars(d.key))
            .attr('y', d => d.key == "tempo" ? vis.yScaleRight(d.value) : vis.yScaleLeft(d.value))
            .attr('width', vis.bars.bandwidth())
            .attr('height', d => d.key == "tempo" ? vis.height - vis.yScaleRight(d.value) : vis.height - vis.yScaleLeft(d.value))
            .attr("fill", d => vis.color(d.key))
            .on('mouseover', function(event, d) {
                // turn opacity of all bars to 0.25
                vis.svg.selectAll(vis.selectNonMatchingAttributes(d.key))
                    .attr('opacity', 0.25)
            })
            .on('mouseout', function(event, d) {
                // turn opacity of all bars to 1
                vis.svg.selectAll(vis.selectNonMatchingAttributes(d.key))
                    .attr('opacity', 1)
            });

            vis.renderLegend();
    }

    renderLegend() {
        let vis = this;
        let attribute1 = ["danceability", "liveliness", "energy", "acousticness"]
        let attribute2 = ["instrumentalness", "valence", "tempo", "speechiness"]

        const yLegendScale1 = d3.scaleBand()
            .domain(attribute1)
            .range([0, 125])
            .padding(0)

        const yLegendScale2 = d3.scaleBand()
            .domain(attribute2)
            .range([0, 125])
            .padding(0)


        const legendGroup = vis.legend.selectAll('.legend-groups')
            .data(vis.config.songAttributes)

        const legendGroupEnter = legendGroup.join('g')
            .attr('class', "legend-groups")

        legendGroupEnter.append('circle')
            .attr('class', d => `legend-circle ${d}`)
            .attr('r', vis.config.legendRadius)
            .attr('cx', d => attribute1.includes(d) ? 0 : 150)
            .attr('cy', d => attribute1.includes(d)? yLegendScale1(d) -5: yLegendScale2(d) - 5)
            .attr('fill', d => vis.color(d))

        legendGroupEnter.append('text')
            .attr('class', 'legend-text')
            .attr('y', d => attribute1.includes(d)? yLegendScale1(d): yLegendScale2(d))
            .attr('x', d => attribute1.includes(d) ? 15 : 165)
            .text(d => d && d[0].toUpperCase() + d.slice(1))
            .on('mouseover', function(event, d) {
                // turn opacity of all bars to 0.5
                vis.svg.selectAll(vis.selectNonMatchingAttributes(d))
                    .attr('opacity', 0.25)
            })
            .on('mouseout', function(event, d) {
                // turn opacity of all bars to 1
                vis.svg.selectAll(vis.selectNonMatchingAttributes(d))
                    .attr('opacity', 1)
            })
    }

    selectNonMatchingAttributes(attribute) {
        let vis = this;
        let nonMatchedAttributes = vis.config.songAttributes.filter(d => d != attribute)
        return nonMatchedAttributes.map(d => `.${d}-bars rect`)
    }


    aggregateData(data) {
        let aggregatedData = []
        for (const [key, value] of data.entries()) {
            let year = key
            let danceability = d3.mean(value, d => d.danceability)
            let energy = d3.mean(value, d => d.energy)
            let speechiness = d3.mean(value, d => d.speechiness)
            let acousticness = d3.mean(value, d => d.acousticness)
            let instrumentalness = d3.mean(value, d => d.instrumentalness)
            let liveness = d3.mean(value, d => d.liveness)
            let valence = d3.mean(value, d => d.valence)
            let tempo = d3.mean(value, d => d.tempo)
            aggregatedData.push({
                "year": year,
                "danceability": danceability,
                "energy": energy,
                "speechiness": speechiness,
                "acousticness": acousticness,
                "instrumentalness": instrumentalness,
                "liveness": liveness,
                "valence": valence,
                "tempo": tempo
            })
        }
        return aggregatedData
    }

}