import React from "react";

//Import scss
import "./MainChart.scss";

//Import clsx
import clsx from "clsx";

//Import Axios for API calling
import axios from "axios";

//Import d3JS for Stock Chart
import * as d3 from "d3";

export default function Revenue({ symbol }) {
    const ref = React.useRef();
    const [data, setData] = React.useState({});
    const [year, setYear] = React.useState("Quarterly");

    const yearOptions = ["Quarterly", "Annual"];
    const yearMap = { Annual: "yearly", Quarterly: "quarterly" };

    React.useEffect(() => {
        var temp;
        const getRevenue = async () => {
            const response = await axios.get(
                `https://www.plutusbackend.com/api/searchQuote/getData?symbol=${symbol}&type=revenue`
            );
            if (response.data.status !== "fail") {
                setData(response.data.data);
                reDrawChart(response.data.data);
                window.addEventListener("resize", function () {
                    clearTimeout(response.data.data);
                    temp = setTimeout(() => {
                        reDrawChart(response.data.data);
                    }, 500);
                });
            }
        };
        if (Object.keys(data).length === 0) {
            getRevenue();
        } else {
            reDrawChart(data);
        }

        return window.removeEventListener("resize", function () {
            clearTimeout(temp);
            temp = setTimeout(() => {
                reDrawChart();
            }, 500);
        });
    }, [year, symbol]);

    function reDrawChart(bcData) {
        d3.select(ref.current).select("#RevenueChart").remove();
        drawBarChart(bcData);
    }

    function drawBarChart(bcData = null) {
        var margin = { top: 30, right: 70, bottom: 30, left: 70 };
        var width =
            ref.current !== null
                ? ref.current.parentElement.offsetWidth * 0.95 -
                  margin.left -
                  margin.right
                : 900;

        let yearOptions = document.getElementById("YearOptions");
        var height =
            ref.current !== null
                ? (ref.current.parentElement.offsetHeight -
                      yearOptions.offsetHeight -
                      margin.top -
                      margin.bottom) *
                  0.9
                : 370;

        var svg = d3
            .select(ref.current)
            .append("svg")
            .attr("id", "RevenueChart")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`)
            .style("position", "relative");

        const barChartData =
            bcData == null
                ? data.financialsChart[yearMap[year]]
                : bcData.financialsChart[yearMap[year]];

        //x Range and Domain
        var x = d3
            .scaleBand()
            .domain(
                barChartData.map(function (d) {
                    return d.date;
                })
            )
            .range([0, width])
            .padding(0.75);

        var xAxis = svg
            .append("g")
            .attr("class", "xAxis")
            .call(d3.axisBottom(x))
            .attr("transform", `translate(0,${height})`);

        var y = d3
            .scaleLinear()
            .domain([
                d3.min(barChartData, function (d) {
                    return d.earnings.raw > 0 ? 0 : d.earnings.raw * 1.5;
                }),
                d3.max(barChartData, function (d) {
                    return d.revenue.raw * 1.2;
                }),
            ])
            .range([height, 0]);

        //convert currency function
        function convertCurrency(labelValue) {
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

        var yAxis = svg
            .append("g")
            .attr("class", "yAxis")
            .call(
                d3.axisLeft(y).tickFormat(function (d) {
                    return convertCurrency(d);
                })
            );

        //Modify Axis Label
        xAxis
            .selectAll(".tick text")
            .attr("fill", "gray")
            .attr("font-size", "calc(0.5rem + 0.15vw)");

        yAxis
            .selectAll(".tick text")
            .attr("fill", "gray")
            .attr("font-size", "calc(0.6rem + 0.15vw)");

        //Create Grid Line
        yAxis.selectAll(".tick line").attr("x2", width).attr("opacity", 0.15);

        //Check for Negative Amounts
        var negativeAmount =
            d3.min(barChartData, (d) => {
                return d.earnings.raw;
            }) < 0;

        //Picking Color
        const colorRevenue = "#536db5";
        const colorPositiveEarning = "#69b3a2";
        const colorNegativeEarning = "#b55353";

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
            .style("text-align", "center")
            .style("background-color", "white")
            .style("font-size", "calc(0.75rem + 0.2vw)")
            .style("padding", "calc(0.2rem + 0.1vw)");

        //Creating Legend
        var legend = svg
            .append("g")
            .attr("class", "legend")
            .attr(
                "transform",
                `translate(${width - margin.right * 1.25}, ${
                    0 - margin.top - margin.bottom * 3
                })`
            );
        legend
            .append("rect")
            .attr("x", 90)
            .attr("y", 100)
            .attr("width", 10)
            .attr("height", 10)
            .style("fill", colorRevenue);

        if (negativeAmount) {
            legend
                .append("rect")
                .attr("x", 85)
                .attr("y", 115)
                .attr("width", 10)
                .attr("height", 10)
                .style("fill", colorPositiveEarning);
            legend
                .append("rect")
                .attr("x", 95)
                .attr("y", 115)
                .attr("width", 10)
                .attr("height", 10)
                .style("fill", colorNegativeEarning);
        } else {
            legend
                .append("rect")
                .attr("x", 90)
                .attr("y", 115)
                .attr("width", 10)
                .attr("height", 10)
                .style("fill", colorPositiveEarning);
        }

        legend
            .append("text")
            .attr("x", 110)
            .attr("y", 105)
            .text("Revenue")
            .attr("text-anchor", "left")
            .style("font-size", "0.65rem")
            .style("alignment-baseline", "middle");
        legend
            .append("text")
            .attr("x", 110)
            .attr("y", 120)
            .text("Earning")
            .attr("text-anchor", "left")
            .style("font-size", "0.65rem")
            .style("alignment-baseline", "middle");

        //Creating Tooltips Trigger

        function mouseover() {
            var data = d3.select(this).data()[0];

            tooltip
                .style("top", y(data.revenue.raw * 1.1) + "px")
                .style("left", x(data.date) + x.bandwidth() * 1.25 + "px");
            tooltip.html(
                `<b> ${
                    data.date
                } </b><br/><b style=color:${colorRevenue}> Revenue : ${
                    data.revenue.fmt
                } </b><br/><b style=color:${
                    data.earnings.raw > 0
                        ? colorPositiveEarning
                        : colorNegativeEarning
                }> Earning : ${data.earnings.fmt}</b>`
            );

            tooltip.transition().duration(50).style("opacity", 1);
        }
        function mouseout() {
            tooltip.transition().duration(50).style("opacity", 0);
        }

        // Add Revenue Bars
        svg.selectAll("rect.Revenue")
            .data(barChartData)
            .enter()
            .append("rect")
            .attr("x", function (d) {
                return x(d.date) - x.bandwidth() / 2;
            })
            .attr("y", function (d) {
                return y(d.revenue.raw);
            })
            .attr("width", x.bandwidth())
            .attr("height", function (d) {
                return negativeAmount
                    ? y(0) - y(d.revenue.raw)
                    : height - y(d.revenue.raw);
            })
            .attr("fill", colorRevenue)
            .on("mouseover", mouseover)
            .on("mouseout", mouseout);

        // Add Earning Bars
        svg.selectAll("rect.Earning")
            .data(barChartData)
            .enter()
            .append("rect")
            .attr("x", function (d) {
                return x(d.date) + x.bandwidth() / 2;
            })
            .attr("y", function (d) {
                return d.earnings.raw < 0 ? y(0) : y(d.earnings.raw);
            })
            .attr("width", x.bandwidth())
            .attr("height", function (d) {
                return negativeAmount
                    ? d.earnings.raw < 0
                        ? y(d.earnings.raw) - y(0)
                        : y(0) - y(d.earnings.raw)
                    : height - y(d.earnings.raw);
            })
            .attr("fill", function (d) {
                return d.earnings.raw < 0
                    ? colorNegativeEarning
                    : colorPositiveEarning;
            })
            .on("mouseover", mouseover)
            .on("mouseout", mouseout);
    }

    return (
        <div ref={ref} className="RevenueChart">
            {Object.keys(data).length === 0 ? (
                <div className="EmptyData">Not Applicable ...</div>
            ) : (
                <ul className="YearOptions" id="YearOptions">
                    {yearOptions.map((y, idx) => (
                        <li
                            className={clsx({
                                Options: true,
                                Current: year === y,
                            })}
                            onClick={() => setYear(y)}
                            key={idx}
                        >
                            {y}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
