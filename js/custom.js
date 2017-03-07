d3.queue()
    .defer(d3.csv,'results/min_temps.csv')
    .defer(d3.csv,'results/max_temps.csv')
    .defer(d3.json, 'js/us-states.json')
    .await(function(error, lows, highs, map) {
        var margins = {top: 25, right: 50, bottom: 50, left: 40},
            height = 400 - margins.top - margins.bottom,
            width = window.innerWidth - margins.left - margins.right,
            parse_date = d3.timeParse("%Y-%m-%d"),
            date_format = d3.timeFormat("%B %e");

        lows.forEach(function(d) {
            d.date = parse_date(d.date);
            d.latitude = +d.latitude;
            d.longitude = +d.longitude;

        });

        highs.forEach(function(d) {
            d.date = parse_date(d.date);
            d.latitude = +d.latitude;
            d.longitude = +d.longitude;
        });

        var all = highs.concat(lows);

        var i = 1;

        /*
         * Create map
         */
        var scale = 1,
            projection = d3.geoAlbersUsa()
                .scale(scale)
                .translate([0,0]);

        var path = d3.geoPath().projection(projection);
        var bounds = path.bounds(map);
        scale = .95 / Math.max((bounds[1][0] - bounds[0][0]) / width, (bounds[1][1] - bounds[0][1]) / height);
        var translation = [(width - scale * (bounds[1][0] + bounds[0][0])) / 2 -35,
            (height - scale * (bounds[1][1] + bounds[0][1])) / 2];

        projection = d3.geoAlbersUsa().scale(scale).translate(translation);
        path = path.projection(projection);

        var map_svg = d3.select('#map').append('svg')
            .attr("vector-effect", "non-scaling-stroke")
            .attr("height", height)
            .attr("width", width)
            .append('g');

        var maps = map_svg.selectAll("path")
            .data(map.features);

        maps.enter()
            .append("path")
            .merge(maps)
            .attr("d", path);

        maps.exit().remove();

        var radius = (width < 600) ? 1.5 : 2.3;

        var records = map_svg.selectAll("circle")
            .data(all);

        records.enter()
            .append("circle")
            .merge(records)
            .attr("class", function(d) {
                return d.type;
            })
            .attr("cx", function(d) {
                return projection([d.longitude, d.latitude])[0]; })
            .attr("cy", function(d) {
                return projection([d.longitude, d.latitude])[1]; })
            .attr("r", radius)
            .style("fill", function(d) {
                return (d.type === "high") ? "orange" : "steelblue";
            });

        function showDot(data, d , iter) {
            if(d.date.getDate() <= data[iter].date.getDate()) {
                return 1;
            }
        }

        drawLegend();

        /*
         * Animate stuff
         */
        var num_highs = highs.length;
        var num_lows = lows.length;

        var date_low = d3.select("#date_low");
        var location_low = d3.select("#location_low");
        var date_high = d3.select("#date_high");
        var location_high = d3.select('#location_high');

        var circles_low = d3.selectAll("circle.low");
        var circles_high = d3.selectAll("circle.high");

        function animate() {
            var t = d3.interval(function(elapsed) {
                if(lows[i] !== undefined || (i === num_highs - 1))  {
                    var iteration = (i === num_highs - 1) ? num_lows - 1 : i;
                    circles_low.style("opacity", function(d) {
                        return showDot(lows, d, iteration);
                    });

                    date_low.transition().text(date_format(lows[iteration].date));
                    location_low.transition().text(lows[iteration].stationName + ': ' + lows[iteration].value + ' C');
                }

                if(highs[i] !== undefined) {
                    circles_high.style("opacity", function(d) {
                        return showDot(highs, d, i);
                    });
                    date_high.transition().text(date_format(highs[i].date));
                    location_high.transition().text(highs[i].stationName + ': ' + highs[i].value + ' C');
                }

                if (i > num_highs) t.stop();

                i++
            }, 2);
        }

        d3.select('#start').on('click touchstart', function(d) {
            i = 1;
            animate();
        });

        d3.select('#end').on('click touchstart', function(d) {
            i = num_highs - 1;
        });

        function drawLegend() {
            var fields = ["Record Low", "Record High"];
            var colors = ["steelblue", "orange"];

                var legend = d3.select("#legend")
                    .append("svg")
                    .attr("width", width)
                    .attr("height", 55)
                    .attr("class", "legend");

                var j = 0;

                var legend_data = legend.selectAll('g').data(fields);

                legend_data.enter()
                    .append('g')

                    .attr("width",190)
                    .each(function(d, k) {
                        var g = d3.select(this);

                        g.append("rect")
                            .attr("x", j)
                            .attr("y", 15)
                            .attr("width", 10)
                            .attr("height", 10)
                            .style("fill", function(d) { return colors[k]; });

                        g.append("text")
                            .attr("x", j + 15)
                            .attr("y", 25)
                            .attr("height",30)
                            .attr("width", d.length * 50)
                            .text(d);

                        j += (d.length * 5) + 50;
                    });
        }

        var rows = d3.selectAll('.row');
        rows.classed('opaque', false);
        rows.classed('hide', false);
        d3.selectAll('#load').classed('hide', true);
    });