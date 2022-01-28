import React from "react";
//Import d3JS for Stock Chart
import * as d3 from "d3";

export default function LineChart({ userInfo, transactions }) {
    const ref = React.useRef();

    React.useEffect(() => {
        if (transactions.length !== 0) {
            transactions.push({ date: new Date(), pnl: 0 });
        } else {
            transactions.push({ date: new Date(userInfo.joinDate), pnl: 0 });
            transactions.push({ date: new Date(), pnl: 0 });
        }
        var initalBalance = 25000;
        transactions.map((data, idx) => {
            data.currentBalance = initalBalance += data.pnl;
        });
        reDrawChart();

        var temp;

        window.addEventListener("resize", function () {
            clearTimeout(temp);
            temp = setTimeout(() => {
                reDrawChart();
            }, 500);
        });

        return window.removeEventListener("resize", function () {
            clearTimeout(temp);
            temp = setTimeout(() => {
                reDrawChart();
            }, 500);
        });
    }, [transactions]);

    function reDrawChart() {
        d3.select(ref.current).select("#LineChart").remove();
        drawChart();
    }

    function drawChart() {
        var margin = { top: 20, bottom: 25, left: 70, right: 70 };

        let width =
            ref.current !== null
                ? ref.current.parentElement.offsetWidth * 0.95 -
                  margin.left -
                  margin.right
                : 1150;
        let height =
            ref.current !== null
                ? ref.current.parentElement.offsetHeight * 0.95
                : 400;

        var svg = d3
            .select(ref.current)
            .append("svg")
            .attr("id", "LineChart")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr(
                "transform",
                "translate(" + margin.left + "," + margin.top + ")"
            );

        //x domain and range
        var x = d3
            .scaleTime()
            .domain(
                d3.extent(transactions, function (d) {
                    return new Date(d.date);
                })
            )
            .range([0, width]);

        const format = d3.timeFormat("%m/%d/%y %H:%M");
        var xAxis = d3
            .axisBottom(x)
            .tickFormat(function (d) {
                return format(d);
            })
            .ticks(4);

        //y domain and range
        var y = d3
            .scaleLinear()
            .domain(
                d3
                    .extent(transactions, function (d) {
                        return d.currentBalance;
                    })
                    .map((d, idx) => d * (0.999 + idx * 0.002))
            )
            .range([height, 0]);

        var yAxis = d3
            .axisLeft(y)
            .tickFormat(function (d) {
                return "$" + d;
            })
            .ticks(4);

        // x axis
        var xTick = svg
            .append("g")
            .attr("class", "xAxis")
            .call(xAxis)
            .attr("transform", `translate(0,${height})`);
        // y axis
        var yTick = svg.append("g").attr("class", "yAxis").call(yAxis);

        // y gridline
        yTick.selectAll(".tick line").attr("x2", width).attr("opacity", 0.1);

        // starting balance gridline
        svg.append("path")
            .datum(transactions)
            .attr("fill", "none")
            .attr("stroke", "#000000")
            .attr("stroke-width", 2)
            .attr("stroke-linecap", "round")
            .attr("stroke-dasharray", "5,5")
            .attr(
                "d",
                d3
                    .line()
                    .x(function (d) {
                        return x(d.date);
                    })
                    .y(function (d) {
                        return y(25000);
                    })
            );

        //Brush Zoom

        var brush = d3
            .brushX()
            .extent([
                [0, 0],
                [width, height],
            ])
            .on("end", function (event, d) {
                return updateChart(event);
            });

        svg.append("defs")
            .append("svg:clipPath")
            .attr("id", "clip")
            .append("svg:rect")
            .attr("width", width)
            .attr("height", height)
            .attr("x", 0)
            .attr("y", 0);

        var line = svg.append("g").attr("clip-path", "url(#clip)");

        line.append("path")
            .datum(transactions)
            .attr("fill", "none")
            .attr("class", "line")
            .attr(
                "stroke",
                transactions[transactions.length - 1].currentBalance >= 0
                    ? "#69b3a2"
                    : "#FF0000"
            )
            .attr("stroke-width", 3)
            .attr("stroke-linecap", "round")
            .attr(
                "d",
                d3
                    .line()
                    .x(function (d) {
                        return x(d.date);
                    })
                    .y(function (d) {
                        return y(d.currentBalance);
                    })
                    .curve(d3.curveStep)
            );

        line.append("g").attr("class", "brush").call(brush);

        var idleTimeout;
        function idled() {
            idleTimeout = null;
        }

        function updateChart(event) {
            const extent = event.selection;

            if (!extent) {
                if (!idleTimeout) return (idleTimeout = setTimeout(idled, 350));
                x.domain([4, 8]);
            } else {
                x.domain([x.invert(extent[0]), x.invert(extent[1])]);

                line.select(".brush").call(brush.move, null);

                xTick.transition().duration(1000).call(d3.axisBottom(x));

                line.select(".line")
                    .transition()
                    .duration(1000)
                    .attr(
                        "d",
                        d3
                            .line()
                            .x(function (d) {
                                return x(d.date);
                            })
                            .y(function (d) {
                                return y(d.currentBalance);
                            })
                            .curve(d3.curveStep)
                    );
            }
        }
        //reset
        svg.on("dblclick", function () {
            x.domain(
                d3.extent(transactions, function (d) {
                    return new Date(d.date);
                })
            );

            xTick.transition().call(xAxis);

            line.select(".line")
                .transition()
                .attr(
                    "d",
                    d3
                        .line()
                        .x(function (d) {
                            return x(d.date);
                        })
                        .y(function (d) {
                            return y(d.currentBalance);
                        })
                        .curve(d3.curveStep)
                );
        });

        var dataBox = svg
            .append("g")
            .attr("class", "dataBox")
            .attr("opacity", 0)
            .style("display", "block");
        var date = dataBox
            .append("text")
            .attr("class", "Date")
            .text("Date : ")
            .attr("x", 0)
            .attr("y", 0);
        var realizedPNL = dataBox
            .append("text")
            .attr("class", "RealizedPNL")
            .text("Realized PNL : ")
            .attr("x", 0)
            .attr("y", 20);

        var verticalLine = svg
            .append("line")
            .attr("opacity", 0)
            .attr("y1", 0)
            .attr("y2", height)
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .attr("pointer-events", "none")
            .attr("z-index", 1);

        function mouseover() {}
        function mouseout() {
            verticalLine.attr("opacity", 0);
            dataBox.attr("opacity", 0);
        }

        function mousemove(event) {
            var mousePos = d3.pointer(event);

            var bisectDate = d3.bisector(function (d) {
                return d.date;
            }).center;
            var dataIdx = bisectDate(transactions, x.invert(mousePos[0]));
            var selectedData = transactions[dataIdx];

            if (selectedData === undefined) {
                //pass
                return;
            }

            dataBox.attr("opacity", 1);
            date.text(
                `Date : ${new Date(selectedData.date)
                    .toLocaleString()
                    .replace(",", "")}`
            );
            realizedPNL.text(
                `Realized PNL : $ ${Number(
                    selectedData.currentBalance
                ).toLocaleString("en")}`
            );

            realizedPNL.style(
                "fill",
                selectedData.currentBalance >= 25000 ? "green" : "red"
            );

            verticalLine
                .attr("x1", mousePos[0] < 0 ? 0 : mousePos[0])
                .attr("x2", mousePos[0] < 0 ? 0 : mousePos[0])
                .attr("opacity", 0.5);
        }

        svg.on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseout", mouseout);
    }

    return <div ref={ref} />;
}
