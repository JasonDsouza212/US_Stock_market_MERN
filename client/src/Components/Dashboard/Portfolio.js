import React from "react";

//Import Custom Util Components
import Card from "../StyledComponents/Card";

//Import UserContext
import UserContext from "../../Context/UserContext";

//Import clsx
import clsx from "clsx";

export default function Portfolio({ portfolioData, portfolioValue }) {
    const { setNav } = React.useContext(UserContext);
    portfolioData = portfolioData.sort((a, b) => b.marketValue - a.marketValue);

    const columns = [
        "Symbol",
        "Company Name",
        "Position",
        "Average Cost",
        "Last Price",
        "Market Value",
        "Portfolio Diversity",
        "Total Return",
    ];

    return (
        <div className="Portfolio">
            <div className="Header">Portfolio Overview</div>
            <Card>
                <table className="PortfolioTable">
                    <thead>
                        <tr className="ColName">
                            {columns.map((col, idx) => {
                                return (
                                    <th
                                        className={col.replace(" ", "")}
                                        key={col + idx}
                                    >
                                        {col}
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {portfolioData.length !== 0 &&
                            portfolioData.map((data, idx) => {
                                const totalReturnGain =
                                    data.totalReturn.raw >= 0;
                                return (
                                    <tr
                                        className="Row"
                                        key={"portfolio_" + idx}
                                    >
                                        <td
                                            className="Symbol"
                                            onClick={() =>
                                                setNav({
                                                    currentPage: "Search Quote",
                                                    symbol: data.symbol,
                                                })
                                            }
                                        >
                                            {data.symbol}
                                        </td>
                                        <td className="CompanyName">
                                            {data.companyName}
                                        </td>
                                        <td className="Position">
                                            {data.position}
                                        </td>
                                        <td className="AverageCost">
                                            ${data.averageCost}
                                        </td>
                                        <td className="LastPrice">
                                            ${data.currentPrice}
                                        </td>
                                        <td className="MarketValue">
                                            ${data.marketValue}
                                        </td>
                                        <td className="PortfolioDiversity">
                                            {parseFloat(
                                                data.marketValue /
                                                    portfolioValue
                                            ).toFixed(2) + "%"}
                                        </td>
                                        <td
                                            className={clsx({
                                                TotalReturn: true,
                                                Up: totalReturnGain,
                                                Down: !totalReturnGain,
                                            })}
                                        >
                                            ${data.totalReturn.raw}(
                                            {data.totalReturn.fmt})
                                        </td>
                                    </tr>
                                );
                            })}
                    </tbody>
                </table>
            </Card>
        </div>
    );
}
