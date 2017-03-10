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
            .attr("class", "overlay")
            .attr("vector-effect", "non-scaling-stroke")
            .attr("height", height + margins.top + margins.bottom)
            .attr("width", width)
            .append('g');

        var maps = map_svg.selectAll("path")
            .data(map.features);

        maps.enter()
            .append("path")
            .merge(maps)
            .attr("d", path);

        maps.exit().remove();

        lows.forEach(function(d) {
            d.date = parse_date(d.date);
            d.latitude = +d.latitude;
            d.longitude = +d.longitude;
            d.x = projection([d.longitude, d.latitude])[0];
            d.y = projection([d.longitude, d.latitude])[1];
        });

        highs.forEach(function(d) {
            d.date = parse_date(d.date);
            d.latitude = +d.latitude;
            d.longitude = +d.longitude;
            d.x = projection([d.longitude, d.latitude])[0];
            d.y = projection([d.longitude, d.latitude])[1];
        });

        var all = highs.concat(lows);

        var canvas = d3.select("#map").append("canvas")
            .attr("class", "overlay")
            .attr("width", width)
            .attr("height", height);

        var radius = (width < 600) ? 1.5 : 2;
        var context = canvas.node().getContext("2d");

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

        var circles_low = [];
        var circles_high = [];

        function animate() {
            var t = d3.interval(function(elapsed) {
                if(lows[i] !== undefined || (i === num_highs - 1))  {
                    var iteration = (i === num_highs - 1) ? num_lows - 1 : i;

                    circles_low.push(lows[iteration]);
                    showNodes(circles_low, iteration);

                    date_low.transition().text(date_format(lows[iteration].date));
                    location_low.transition().text(lows[iteration].stationName + ': ' + lows[iteration].value + ' C');
                }

                if(highs[i] !== undefined) {
                    circles_high.push(highs[i]);
                    showNodes(circles_high, i);

                    date_high.transition().text(date_format(highs[i].date));
                    location_high.transition().text(highs[i].stationName + ': ' + highs[i].value + ' C');
                }

                if (i > num_highs) t.stop();

                i++
            }, 2);
        }

        d3.select('#start').on('click touchstart', function(d) {
            i = 1;
            circles_low = [];
            circles_high = [];
            animate();
        });

        d3.select('#end').on('click touchstart', function(d) {
            i = num_highs - 1;
            showNodes(all, 0);
        });

        function showNodes(values, clear) {
            if(clear == 1) {
                context.clearRect(0, 0, width, height);
            }


            for (var t = 0, n = values.length; t < n; ++t) {
                var node = values[t];
                context.beginPath();
                context.moveTo(node.x, node.y);
                context.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
                context.lineWidth = 8;
                context.fillStyle = (node.type === "high") ? "orange" : "steelblue";
                context.fill();
            }
        }

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