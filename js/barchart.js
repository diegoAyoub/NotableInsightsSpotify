class Barchart {
    constructor(_config, _data) {
        this.config = {
            parentElement: _config.parentElement,
            songAttributes: _config.songAttributes,
            containerWidth: 600,
            containerHeight: 600,
            margin: {
                top: 20,
                right: 20,
                bottom: 20,
                left: 20
            }
        }
        this.data = _data;
        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.config.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.config.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

        vis.svg = d3.select(vis.config.parentElement)
            .append("svg")
            .attr("width", vis.config.containerWidth)
            .attr("height", vis.config.containerHeight)
            .append("g")
            .attr("transform", `translate(${vis.config.margin.left},${vis.config.margin.top})`);

        vis.xScale = d3.scaleBand()
            .range([0, vis.config.width])
            .paddingInner(0.1);

        vis.yScale = d3.scaleLinear()
            .range([vis.config.height, 0]);

        vis.xAxis = d3.axisBottom(vis.xScale);

        vis.yAxis = d3.axisLeft(vis.yScale);

        vis.svg.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", `translate(0,${vis.config.height})`);

        vis.svg.append("g")
            .attr("class", "y-axis axis");

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        vis.xScale.domain(vis.data.map(d => d.category));
        vis.yScale.domain([0, d3.max(vis.data, d => d.value)]);

        vis.svg.select(".x-axis").call(vis.xAxis);
        vis.svg.select(".y-axis").call(vis.yAxis);

        let bars = vis.svg.selectAll(".bar")
            .data(vis.data);

        bars.enter().append("rect")
            .attr("class", "bar")
            .merge(bars)
            .attr("x", d => vis.xScale(d.category))
            .attr("y", d => vis.yScale(d.value))
            .attr("width", vis.xScale.bandwidth())
            .attr("height", d => vis.config.height - vis.yScale(d.value));

        bars.exit().remove();
    }
}