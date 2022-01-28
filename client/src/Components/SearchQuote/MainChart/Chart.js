import React from "react";
//Import scss
import "./MainChart.scss";

//Import clsx
import clsx from "clsx";

//Import d3JS for Stock Chart
import * as d3 from "d3";

//Import Axios for API calling
import axios from "axios";

import { ReactComponent as Crosshairlogo } from "../../../Assets/crosshair.svg";
import { ReactComponent as Zoominlogo } from "../../../Assets/zoomin.svg";
import { ReactComponent as Infodatalogo } from "../../../Assets/infodata.svg";

const icons = [
    <Crosshairlogo className="ChartToolsIcon" />,
    <Zoominlogo className="ChartToolsIcon" />,
    <Infodatalogo className="ChartToolsIcon" />,
];

const intervalOptions = ["1m", "5m", "15m", "30m", "1h", "1d", "1mo", "3mo"];
const upStroke = "#69b3a2";
const upArea = "#cce5df";
const downStroke = "#b55353";
const downArea = "#e5cccc";

export default function Chart({ previousClose, symbol }) {
    const ref = React.useRef();

    const [data, setData] = React.useState([]);

    const [intervals, setIntervals] = React.useState("1m");
    const [chartTools, setChartTools] = React.useState({
        Crosshair: true,
        Zoomin: true,
        OHLCData: true,
    });

    React.useEffect(() => {
        var temp;
        const getChart = async () => {
            const response = await axios.get(
                `https://www.plutusbackend.com/api/searchQuote/getChart?symbol=${symbol}&interval=${intervals}`
            );
            if (response.data.status !== "fail") {
                setData(response.data.data);
                reDrawChart(response.data.data);
                window.addEventListener("resize", function () {
                    clearTimeout(temp);
                    temp = setTimeout(() => {
                        reDrawChart(response.data.data);
                    }, 500);
                });
            }
        };

        if (previousClose) {
            getChart();
        }
    }, [previousClose, symbol, intervals]);

    React.useEffect(() => {
        if (data.length !== 0) {
            reDrawChart();
        }
    }, [chartTools]);

    function reDrawChart(pData) {
        d3.select(ref.current).select("#PriceChart").remove();
        drawChart(pData);
    }

    function drawChart(pData = null) {
        var margin = { top: 30, right: 30, bottom: 30, left: 40 };
        let intervalOptions = document.getElementById("intervalOptions");
        var width =
            ref.current !== null
                ? ref.current.parentElement.offsetWidth * 0.95 -
                  margin.left -
                  margin.right
                : 980;
        var height =
            ref.current !== null
                ? (ref.current.parentElement.offsetHeight -
                      intervalOptions.offsetHeight -
                      margin.top -
                      margin.bottom) *
                  0.95
                : 490;

        const priceData = pData !== null ? pData : data;

        var svg = d3
            .select(ref.current)
            .append("svg")
            .attr("id", "PriceChart")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`)
            .style("position", "relative");

        //Determine the color
        const color =
            priceData[0].close < priceData[priceData.length - 1].close
                ? [upArea, upStroke]
                : [downArea, downStroke];

        //x Range and Domain (For Other Interval other than 1m)
        var x_not1m = d3
            .scaleTime()
            .domain(
                d3.extent(priceData, function (d) {
                    return new Date(d.date);
                })
            )
            .range([0, width]);
        // var x_not1m = d3.scaleBand().domain(allDates).range([0, width]);

        //x Range and Domain (For 1m)
        function marketClose(d) {
            //return 4pm EST of the Date Object
            d.setUTCHours(20);
            d.setUTCMinutes(0);
            d.setUTCSeconds(0);
            d.setUTCMilliseconds(0);
            return d;
        }

        var x_1m = d3
            .scaleTime()
            .domain([
                new Date(priceData[0].date),
                marketClose(new Date(priceData[0].date)),
            ])
            .range([0, width]);

        var x = intervals === "1m" ? x_1m : x_not1m;

        //Include Previous Close;
        let HighLow = [
            d3.min(priceData, function (d) {
                if (d.low !== null) {
                    return d.low * 0.995;
                }
            }),
            d3.max(priceData, function (d) {
                if (d.high !== null) {
                    return d.high * 1.015;
                }
            }),
        ];
        let pC = parseFloat(previousClose);
        pC = pC * (0.995 + (0.02 * pC > priceData[0].close));

        HighLow.push(pC);

        //y Range and Domain
        var y = d3.scaleLinear().domain(d3.extent(HighLow)).range([height, 0]);

        //xAxis
        var xAxis = svg
            .append("g")
            .attr("class", "xAxis")
            .call(d3.axisBottom(x))
            .attr("transform", `translate(0,${height})`);

        //yAxis
        var yAxis = svg
            .append("g")
            .attr("class", "yAxis")
            .call(
                d3
                    .axisLeft(y)
                    .tickFormat(function (d) {
                        return "$" + d;
                    })
                    .ticks(6)
            );

        //Modify Axis Label
        xAxis
            .selectAll(".tick text")
            .attr("fill", "gray")
            .attr("font-size", function () {
                if (intervals === "30m" || intervals === "1d") {
                    return "calc(0.5rem+0.2vw)";
                }

                return "calc(0.5rem + 0.2vw)";
            });

        yAxis
            .selectAll(".tick text")
            .attr("fill", "gray")
            .attr("font-size", "calc(0.5rem + 0.2vw)");

        //Get Rid of yAxis path domain
        yAxis.select(".domain").style("display", "none");

        //Create Grid Line
        yAxis.selectAll(".tick line").attr("x2", width).attr("opacity", 0.1);

        const lowest = d3.min(HighLow);

        if (!chartTools.Zoomin) {
            svg.append("path")
                .datum(
                    priceData.filter(function (d) {
                        return d.close !== null;
                    })
                )
                // .attr("fill", "#cce5df")
                // .attr("stroke", "#69b3a2")
                .attr("fill", color[0])
                .attr("stroke", color[1])
                .attr("stroke-width", 1.5)
                .attr(
                    "d",
                    d3
                        .area()

                        .x(function (d) {
                            return x(d.date);
                        })
                        .y0(y(lowest))
                        .y1(function (d) {
                            return y(d.close);
                        })
                        .curve(d3.curveMonotoneX)
                );
        }

        //Brush Zoom

        if (chartTools.Zoomin) {
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
                .datum(
                    priceData.filter(function (d) {
                        return d.close !== null;
                    })
                )
                .attr("class", "line")
                .attr("fill", color[0])
                .attr("stroke", color[1])
                .attr("stroke-width", 1.5)
                .attr("stroke-linecap", "round")
                .attr(
                    "d",
                    d3
                        .area()
                        .x(function (d) {
                            return x(d.date);
                        })
                        .y0(y(lowest))
                        .y1(function (d) {
                            return y(d.close);
                        })
                        .curve(d3.curveMonotoneX)
                );

            line.append("g").attr("class", "brush").call(brush);

            var idleTimeout;
            function idled() {
                idleTimeout = null;
            }

            function updateChart(event) {
                const extent = event.selection;

                if (!extent) {
                    if (!idleTimeout)
                        return (idleTimeout = setTimeout(idled, 350));
                    x.domain([4, 8]);
                } else {
                    x.domain([x.invert(extent[0]), x.invert(extent[1])]);

                    line.select(".brush").call(brush.move, null);

                    xAxis.transition().duration(1000).call(d3.axisBottom(x));

                    line.select(".line")
                        .transition()
                        .duration(1000)
                        .attr(
                            "d",
                            d3
                                .area()
                                .x(function (d) {
                                    return x(d.date);
                                })
                                .y0(y(lowest))
                                .y1(function (d) {
                                    return y(d.close);
                                })
                                .curve(d3.curveMonotoneX)
                        );
                }
            }
            svg.on("dblclick", function () {
                if (intervals === "1m") {
                    x.domain([
                        new Date(priceData[0].date),
                        marketClose(new Date(priceData[0].date)),
                    ]);
                } else {
                    x.domain(
                        d3.extent(priceData, function (d) {
                            return new Date(d.date);
                        })
                    );
                }

                xAxis.transition().call(d3.axisBottom(x));

                line.select(".line")
                    .transition()
                    .attr(
                        "d",
                        d3
                            .area()
                            .x(function (d) {
                                return x(d.date);
                            })
                            .y0(y(lowest))
                            .y1(function (d) {
                                return y(d.close);
                            })
                            .curve(d3.curveMonotoneX)
                    );
            });
        }

        //Add Previous Close

        const wholeDayTimeLine = [];
        var marketOpen = priceData[0].date;

        for (var i = 0; i < 391; i++) {
            wholeDayTimeLine.push(new Date(marketOpen));
            marketOpen += 60000;
        }

        // only for 1m
        if (intervals === "1m") {
            svg.append("path")
                .datum(wholeDayTimeLine)
                .attr("fill", "none")
                .attr("stroke", "#000000")
                .attr("stroke-width", 1)
                .attr("stroke-linecap", "round")
                .attr("stroke-dasharray", "10,10")
                .attr(
                    "d",
                    d3
                        .line()
                        .x(function (d) {
                            return x(d);
                        })
                        .y(y(previousClose))
                );
        }

        //Previous Close Tag
        if (intervals === "1m") {
            svg.append("text")
                .text("$" + previousClose)
                .attr("id", "previousCloseTag")
                .attr("x", 0)
                .attr("y", y(previousClose) * 0.98)
                .attr("font-size", "0.75rem")
                .attr("fill", "gray");
        }

        //Add Crosshair
        if (chartTools.Crosshair) {
            var verticalLine = svg
                .append("line")
                .attr("opacity", 0)
                .attr("y1", 0)
                .attr("y2", height)
                .attr("stroke", "black")
                .attr("stroke-width", 1)
                .attr("pointer-events", "none")
                .attr("z-index", 1);
        }

        //Add ohlcDataBox
        if (chartTools.OHLCData) {
            var ohlcDataBox = svg
                .append("g")
                .attr("class", "ohlcDataBox")
                .attr("opacity", 0)
                .style("display", "block");

            var date = ohlcDataBox
                .append("text")
                .attr("class", "Date")
                .text("Date : ")
                .attr("x", 0)
                .attr("y", 0);

            var open = ohlcDataBox
                .append("text")
                .attr("class", "Open")
                .text("Open : ")
                .attr("x", 0)
                .attr("y", 20);
            var high = ohlcDataBox
                .append("text")
                .attr("class", "High")
                .text("High : ")
                .attr("x", 0)
                .attr("y", 40);
            var low = ohlcDataBox
                .append("text")
                .attr("class", "Low")
                .text("Low : ")
                .attr("x", 0)
                .attr("y", 60);
            var close = ohlcDataBox
                .append("text")
                .attr("class", "Close")
                .text("Close : ")
                .attr("x", 0)
                .attr("y", 80);
            var volume = ohlcDataBox
                .append("text")
                .attr("class", "Volume")
                .text("Volume : ")
                .attr("x", 0)
                .attr("y", 100);
        }

        //convert Volume function
        function convertVolume(labelValue) {
            // Nine Zeroes for Billions
            return Math.abs(Number(labelValue)) >= 1.0e9
                ? (Math.abs(Number(labelValue)) / 1.0e9).toFixed(2) + "B"
                : // Six Zeroes for Millions
                Math.abs(Number(labelValue)) >= 1.0e6
                ? (Math.abs(Number(labelValue)) / 1.0e6).toFixed(2) + "M"
                : // Three Zeroes for Thousands
                Math.abs(Number(labelValue)) >= 1.0e3
                ? (Math.abs(Number(labelValue)) / 1.0e3).toFixed(2) + "K"
                : Math.abs(Number(labelValue));
        }

        function mousemove(event) {
            var mousePos = d3.pointer(event);
            {
                chartTools.Crosshair &&
                    verticalLine
                        .attr("x1", mousePos[0] < 0 ? 0 : mousePos[0])
                        .attr("x2", mousePos[0] < 0 ? 0 : mousePos[0])
                        .attr("opacity", 1);
            }

            var bisectDate = d3.bisector(function (d) {
                return d.date;
            }).center;

            var dataIdx = bisectDate(priceData, x.invert(mousePos[0]));
            var data = priceData[dataIdx];

            if (chartTools.OHLCData) {
                ohlcDataBox.attr("opacity", 1);

                if (data !== undefined) {
                    date.text("Date : " + new Date(data.date).toLocaleString());
                    open.text(
                        "Open : " +
                            (data.open !== null
                                ? data.open.toFixed(2)
                                : "  -  ")
                    );
                    high.text(
                        "High :  " +
                            (data.high !== null
                                ? data.high.toFixed(2)
                                : "  -  ")
                    );
                    low.text(
                        "Low :   " +
                            (data.low !== null ? data.low.toFixed(2) : "  -  ")
                    );
                    close.text(
                        "Close : " +
                            (data.close !== null
                                ? data.close.toFixed(2)
                                : "  -  ")
                    );
                    volume.text(
                        "Volume : " +
                            (data.volume !== null
                                ? convertVolume(data.volume)
                                : "  -  ")
                    );
                }
            }
        }
        function mouseout() {
            {
                chartTools.Crosshair && verticalLine.attr("opacity", 0);
            }
            {
                chartTools.OHLCData && ohlcDataBox.attr("opacity", 0);
            }
        }

        svg.on("mousemove", function (e) {
            return mousemove(e);
        }).on("mouseout", mouseout);
    }

    return (
        <div className="ChartContainer" ref={ref}>
            <ul className="IntervalOptions" id="intervalOptions">
                {intervalOptions.map((i, idx) => (
                    <li
                        className={clsx({
                            Options: true,
                            Current: intervals === i,
                        })}
                        onClick={() => setIntervals(i)}
                        key={idx}
                    >
                        {i}
                    </li>
                ))}
            </ul>
            <div className="BtnGroup">
                {["Crosshair", "Zoomin", "OHLCData"].map((tool, idx) => {
                    return (
                        <span
                            key={"ChartTools_" + idx}
                            className={clsx({
                                on: chartTools[tool],
                                [tool]: true,
                            })}
                            onClick={() =>
                                setChartTools({
                                    ...chartTools,
                                    [tool]: !chartTools[tool],
                                })
                            }
                        >
                            {icons[idx]}
                        </span>
                    );
                })}
            </div>
        </div>
    );
}
