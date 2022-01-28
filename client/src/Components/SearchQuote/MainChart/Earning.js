import React from "react";
//Import scss
import "./MainChart.scss";

//Import Axios for API calling
import axios from "axios";

//Import d3JS for Stock Chart
import * as d3 from "d3";

export default function Earning({ symbol }) {
    const ref = React.useRef();
    const [data, setData] = React.useState({});

    React.useEffect(() => {
        var temp;
        const getEarning = async () => {
            const response = await axios.get(
                `https://www.plutusbackend.com/api/searchQuote/getData?symbol=${symbol}&type=earning`
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
        if (Object.keys(data).length === 0) {
            getEarning();
        }

        return window.removeEventListener("resize", function () {
            clearTimeout(temp);
            temp = setTimeout(() => {
                reDrawChart(data);
            }, 500);
        });
    }, [symbol]);

    function reDrawChart(data) {
        d3.select(ref.current).select("#EarningChart").remove();
        drawEarningChart(data);
    }

    function drawEarningChart(data) {
        var margin = { top: 40, right: 70, bottom: 40, left: 70 };
        var width =
            ref.current !== null
                ? (ref.current.parentElement.offsetWidth -
                      margin.left -
                      margin.right) *
                  0.95
                : 900;

        var height =
            ref.current !== null
                ? (ref.current.parentElement.offsetHeight -
                      margin.top -
                      margin.bottom) *
                  0.9
                : 370;

        var svg = d3
            .select(ref.current)
            .append("svg")
            .attr("id", "EarningChart")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`)

            .style("position", "relative");

        //Need to format data first;
        let earningChartData = data.earningsChart.quarterly;
        earningChartData.push({
            date:
                data.earningsChart.currentQuarterEstimateDate +
                data.earningsChart.currentQuarterEstimateYear,
            estimate: data.earningsChart.currentQuarterEstimate,
            earningsDate: data.earningsChart.earningsDate[0],
        });

        // X Range and Domain
        var x = d3
            .scaleBand()
            .domain(
                earningChartData.map(function (d) {
                    return d.date;
                })
            )
            .range([0, width])
            .padding(1);

        var xAxis = svg
            .append("g")
            .attr("class", "xAxis")
            .call(d3.axisBottom(x))
            .attr("transform", `translate(0,${height})`);

        // Y Range and Domain
        // get actual and estimated eps together;
        let eps = [];
        earningChartData.map((d) => {
            if (d.actual !== undefined) eps.push(d.actual.raw);
            eps.push(d.estimate.raw);
        });

        let ydomain = d3.extent(eps);
        ydomain[0] = ydomain[0] < 0 ? ydomain[0] - 0.1 : ydomain[0] * 0.9;
        ydomain[1] = ydomain[1] * 1.1;

        var y = d3.scaleLinear().domain(ydomain).range([height, 0]);
        var yAxis = svg.append("g").attr("class", "yAxis").call(d3.axisLeft(y));

        xAxis
            .selectAll(".tick text")
            .attr("fill", "gray")
            .attr("font-size", "calc(0.4rem + 0.2vw)");

        //Add new line to xAxis
        function beat_miss(date) {
            const data = earningChartData.find((el) => el.date === date);
            if (!data) return "";
            if (!data.actual) return [" TBD ", "black"];
            return data.actual.raw > data.estimate.raw
                ? ["Beat", "green"]
                : ["Miss", "red"];
        }

        var insert = function () {
            var el = d3.select(this);

            let result = beat_miss(el.data());
            var tspan = el
                .append("tspan")
                .text(result[0])
                .attr("fill", result[1]);
            tspan.attr("x", 0).attr("dy", 15);
        };
        xAxis.selectAll(".tick text").each(insert);

        yAxis
            .selectAll(".tick text")
            .attr("fill", "gray")
            .attr("font-size", "calc(0.7rem + 0.15vw)");

        //Create Grid Line
        yAxis.selectAll(".tick line").attr("x2", width).attr("opacity", 0.15);

        //Get Rid of xAxis&yAxis path domain
        xAxis.select(".domain").style("display", "none");
        yAxis.select(".domain").style("display", "none");

        //setColor
        const colorBeats = "#69b3a2";
        const colorMiss = "#b55353";

        //Check Miss
        const earningMiss = earningChartData
            .filter(function (d) {
                return d.actual !== undefined;
            })
            .find((el) => el.actual.raw < el.estimate.raw);

        //Creating Legend
        var legend = svg
            .append("g")
            .attr("class", "legend")
            .attr(
                "transform",
                `translate(${width - margin.right * 1.25}, ${
                    0 - margin.top - margin.bottom * 2
                })`
            );
        legend
            .append("circle")
            .attr("cx", 95)
            .attr("cy", 100)
            .attr("r", "calc(0.3rem + 0.1vw)")
            .style("fill", "gray");

        if (earningMiss !== undefined) {
            legend
                .append("circle")
                .attr("cx", 90)
                .attr("cy", 125)
                .attr("r", "calc(0.3rem + 0.1vw)")

                .style("fill", colorBeats);
            legend
                .append("circle")
                .attr("cx", 100)
                .attr("cy", 125)
                .attr("r", "calc(0.3rem + 0.1vw)")

                .style("fill", colorMiss);
        } else {
            legend
                .append("circle")
                .attr("cx", 95)
                .attr("cy", 125)
                .attr("r", "calc(0.3rem + 0.1vw)")

                .style("fill", colorBeats);
        }

        legend
            .append("text")
            .attr("x", 110)
            .attr("y", 100)
            .text("Estimate")
            .attr("text-anchor", "left")
            .style("font-size", "0.65rem")
            .style("alignment-baseline", "middle");
        legend
            .append("text")
            .attr("x", 110)
            .attr("y", 125)
            .text("Actual")
            .attr("text-anchor", "left")
            .style("font-size", "0.65rem")
            .style("alignment-baseline", "middle");

        //Create Tooltips

        var tooltip = d3
            .select(ref.current)
            .append("div")
            .attr("class", "tooltip")
            .style("display", "block")
            .style("position", "absolute")
            .style("opacity", 0)
            .style("z-index", 2)
            .style("border", "2px solid black")
            .style("border-radius", "15px")
            .style("background-color", "white")
            .style("font-size", "calc(0.5rem + 0.3vw)")
            .style("padding", "calc(0.2rem + 0.3vw)");

        function mouseout() {
            tooltip
                .transition()
                .duration(300)
                .style("display", "none")
                .style("opacity", 0)
                .style("color", "black");
        }

        //Adding Dots Estimate;
        svg.selectAll("dot.Estimate")
            .data(earningChartData)
            .enter()
            .append("circle")
            .attr("cx", function (d) {
                return x(d.date);
            })
            .attr("cy", function (d) {
                return y(d.estimate.raw);
            })
            .attr("r", "calc(0.5rem + 0.1vw)")
            .style("fill", "gray")
            .on("mouseover", function (event, d) {
                tooltip
                    .style("top", y(d.estimate.raw) + "px")
                    .style("left", x(d.date) + margin.left + "px")
                    .html(`<b>Estimate EPS : ${d.estimate.raw}</b>`);
                tooltip.transition().duration(50).style("opacity", 1);
                tooltip.style("display", "block");
            })
            .on("mouseout", mouseout);

        //Adding Dots Actual;
        svg.selectAll("dot.Actual")
            .data(
                earningChartData.filter(function (d) {
                    return d.actual !== undefined;
                })
            )
            .enter()
            .append("circle")
            .attr("cx", function (d) {
                return x(d.date);
            })
            .attr("cy", function (d) {
                return y(d.actual.raw);
            })
            .attr("r", "calc(0.5rem + 0.1vw)")
            .style("fill", function (d) {
                return d.actual.raw > d.estimate.raw ? colorBeats : colorMiss;
            })
            .on("mouseover", function (event, d) {
                tooltip
                    .style("top", y(d.actual.raw) + "px")
                    .style("left", x(d.date) + margin.left + "px")
                    .style(
                        "color",
                        d.actual.raw > d.estimate.raw ? colorBeats : colorMiss
                    )
                    .html(`<b>Actual EPS : ${d.actual.raw}</b>`);
                tooltip.transition().duration(50).style("opacity", 1);
                tooltip.style("display", "block");
            })
            .on("mouseout", mouseout);
    }

    return (
        <div className="EarningChart" ref={ref}>
            {Object.keys(data).length === 0 && (
                <div className="EmptyData">Not Applicable ...</div>
            )}
        </div>
    );
}
