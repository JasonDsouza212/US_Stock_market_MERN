import React from "react";
//Import d3JS for Stock Chart
import * as d3 from "d3";

//Import UserContext
import UserContext from "../../../Context/UserContext";

export default function DonutChart({ donutChartData, portfolioValue }) {
    const ref = React.useRef();

    const { setNav } = React.useContext(UserContext);

    React.useEffect(() => {
        donutChartData.length !== 0 && reDrawChart();

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
    });

    function reDrawChart() {
        d3.select(ref.current).select("#DonutChart").remove();
        drawChart();
    }

    function drawChart() {
        var data = [];

        Object.keys(donutChartData).map((k, idx) => {
            data.push({
                key: k,
                value: donutChartData[k],
            });
        });

        let parentSize = 256;
        if (ref.current !== null) {
            parentSize = Math.min(
                ref.current.parentElement.offsetHeight * 0.95,
                (ref.current.parentElement.offsetWidth -
                    document.getElementById("InfoContainer").offsetWidth) *
                    0.95
            );
        }

        let width = parentSize;
        let height = parentSize;

        let margin = 20;

        var radius = Math.min(width, height) / 2 - margin;

        var color = d3.scaleOrdinal(d3.schemeSet3);

        var svg = d3
            .select(ref.current)
            .append("svg")
            .attr("id", "DonutChart")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${width / 2},${height / 2})`);

        var pie = d3.pie().value(function (d) {
            return d.value;
        });

        var arc = d3
            .arc()
            .innerRadius(parentSize / 4)
            .outerRadius(radius)
            .cornerRadius(5);

        svg.selectAll("DonutLine")
            .data(pie(data))
            .enter()
            .append("path")
            .attr("d", arc)
            .attr("fill", function (d, i) {
                return color(i);
            })
            .attr("stroke", "white")
            .style("stroke-width", "3px")
            .style("cursor", "pointer")

            .on("mouseover", function (d, i) {
                var data = d3.select(this).data()[0].data;

                d3.select("#text1").text(data.key);
                d3.select("#text2").text(
                    "$" + (portfolioValue * data.value).toFixed(2)
                );
                d3.select("#text3")
                    .text((data.value * 100).toFixed(2) + "%")
                    .style("font-weight", "bold");
                d3.select(this).transition().duration(50).attr("opacity", 0.75);
            })
            .on("click", function (d) {
                var data = d3.select(this).data()[0].data;

                if (data.key !== "Cash") {
                    setNav({
                        currentPage: "Search Quote",
                        symbol: d3.select(this).data()[0].data.key,
                    });
                }
            })
            .on("mouseout", function (d, i) {
                d3.select("#text1").text("");
                d3.select("#text2").text("");
                d3.select("#text3").text("");
                d3.select(this).transition().duration(50).attr("opacity", 1);
            });

        svg.selectAll("DonutLine")
            .data(pie(data))
            .enter()
            .append("text")
            .style("font-weight", "bold")
            .attr("text-anchor", "middle")
            .attr("font-size", "0.65rem")
            .attr("transform", function (d) {
                return (
                    "translate(" +
                    arc.centroid(d)[0] +
                    "," +
                    arc.centroid(d)[1] +
                    ")"
                );
            })
            .text(function (d) {
                return d.data.key;
            });

        svg.append("text")
            .attr("id", "text1")
            .attr("text-anchor", "middle")
            .attr("font-size", "calc(1rem + 0.1vw)")
            .attr("font-weight", "bold")
            .attr("dy", "-1.5em");
        svg.append("text")
            .attr("id", "text2")
            .attr("text-anchor", "middle")
            .attr("font-size", "calc(1rem + 0.1vw)");
        svg.append("text")
            .attr("id", "text3")
            .attr("text-anchor", "middle")
            .attr("font-size", "calc(1rem + 0.1vw)")
            .attr("dy", "2em");
    }

    return <div ref={ref} />;
}
