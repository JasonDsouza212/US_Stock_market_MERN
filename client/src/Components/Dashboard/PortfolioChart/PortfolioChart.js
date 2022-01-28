import React from "react";

//Import Custom Util Components
import Card from "../../StyledComponents/Card";
import DonutChart from "./DonutChart";

export default function PortfolioChart({
    portfolioData,
    portfolioValue,
    cashValue,
}) {
    let donutChartData = { Cash: (cashValue / portfolioValue).toFixed(4) };

    cashValue = cashValue === undefined ? 0 : cashValue.toFixed(2);
    portfolioValue =
        portfolioValue === undefined ? 0 : portfolioValue.toFixed(2);

    portfolioData.map((d, idx) => {
        donutChartData[d.symbol] = d.marketValue / portfolioValue;
    });

    const totalStockValue = portfolioValue - cashValue;

    return (
        <div className="PortfolioChart">
            <Card H100={true}>
                <div className="InfoContainer" id="InfoContainer">
                    <h3 className="CashValue">
                        ${Number(cashValue).toLocaleString("en")}
                    </h3>
                    <h3 className="TotalStockValue">
                        ${Number(totalStockValue).toLocaleString("en")}
                    </h3>
                </div>

                <DonutChart
                    donutChartData={donutChartData}
                    portfolioValue={portfolioValue}
                />
            </Card>
        </div>
    );
}
