import React from "react";

//Import scss
import "./MainChart.scss";

//Import clsx
import clsx from "clsx";

//Import Axios for API calling
import axios from "axios";

function convertKey(str) {
    str = str.replace(" ", "");
    str = str.charAt(0).toLowerCase() + str.substring(1);
    return str;
}

export default function Financial({ symbol }) {
    const [data, setData] = React.useState({});
    const [year, setYear] = React.useState("Quarterly");
    const [statement, setStatement] = React.useState("IncomeStatement");

    const yearOptions = ["Quarterly", "Annual"];
    const statementOptions = [
        "IncomeStatement",
        "BalanceSheet",
        "CashflowStatement",
    ];

    const Columns = {
        IncomeStatement: {
            "Total Revenue": "totalRevenue",
            "Cost Of Revenue": "costOfRevenue",
            "Gross Profit": "grossProfit",
            "Selling General Administrative ": "sellingGeneralAdministrative",
            "Research & Development": "researchDevelopment",
            "Operating Income": "operatingIncome",
            "Income Before Tax (EBIT)": "incomeBeforeTax",
            "Income Tax Expense": "incomeTaxExpense",
            "Net Income": "netIncomeApplicableToCommonShares",
        },

        BalanceSheet: {
            "Total Assets": "totalAssets",
            "Current Assets": "totalCurrentAssets",
            Cash: "cash",
            Receivables: "netReceivables",
            Inventory: "inventory",
            "Property Plant Equipment": "propertyPlantEquipment",
            "Other Assets": "otherAssets",
            "Total Liabilities": "totalLiab",
            "Current Liabilities": "totalCurrentLiabilities",
            "Account Payable": "accountsPayable",
            "Short Term Debt": "shortLongTermDebt",
            "Long Term Debt": "longTermDebt",
            "Other Current Liabilities": "otherCurrentLiab",
            "Miniority Interest": "minorityInterest",
            "Other Libailities": "otherLiab",
            "Total Stockholder Equity": "totalStockholderEquity",
            "Capital Surplus": "capitalSurplus",
            "Retained Earnings": "retainedEarnings",
            "Other Stockholder Equity": "otherStockholderEquity",
            "Common Stock": "commonStock",
            "Treasury Stock": "treasuryStock",
        },
        CashflowStatement: {
            "Operating Cash Flow": "totalCashFromOperatingActivities",
            "Investing Cash Flow": "totalCashflowsFromInvestingActivities",
            "Other Investing Cash Flow":
                "otherCashflowsFromInvestingActivities",
            "Financing Cash Flow": "totalCashFromFinancingActivities",
            "Other Financing Cash Flow":
                "otherCashflowsFromFinancingActivities",
            "Change In Cash": "changeInCash",
            "Change to Account Receivables": "changeToAccountReceivables",
            "Change to Inventory": "changeToInventory",
            "Change to Liabilities": "changeToLiabilities",
            "Change to Net Income": "changeToNetincome",
            "Net income": "netIncome",
        },
    };

    React.useEffect(() => {
        const getData = async () => {
            const response = await axios.get(
                `https://www.plutusbackend.com/api/searchQuote/getData?symbol=${symbol}&type=financial`
            );
            if (response.data.status !== "fail") {
                setData(response.data.data);
            }
        };

        if (Object.keys(data).length === 0) {
            getData();
        }
    }, [symbol]);

    return (
        <div
            className={clsx({
                Financial: true,
                Empty: Object.keys(data).length === 0,
            })}
        >
            {Object.keys(data).length === 0 ? (
                <div className="EmptyData">Not Applicable ...</div>
            ) : (
                <>
                    <ul className="StatementOptions" id="StatementOptions">
                        {statementOptions.map((s, idx) => (
                            <li
                                className={clsx({
                                    Options: true,
                                    Current: statement === s,
                                })}
                                onClick={() => setStatement(s)}
                                key={idx}
                            >
                                {s}
                            </li>
                        ))}
                    </ul>
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
                    <div className="TableContainer">
                        {Object.keys(data).length !== 0 && (
                            <table>
                                <thead>
                                    <tr>
                                        <th></th>
                                        {data[
                                            convertKey(statement) +
                                                "History" +
                                                year
                                        ].map((d, idx) => (
                                            <th
                                                key={"Date_" + idx}
                                                className="Date"
                                            >
                                                {d.endDate.fmt}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.keys(Columns[statement]).map(
                                        (c, idx) => {
                                            const statementData =
                                                data[
                                                    convertKey(statement) +
                                                        "History" +
                                                        year
                                                ];
                                            return (
                                                <tr
                                                    key={"Column_" + idx}
                                                    className="Column"
                                                >
                                                    <td
                                                        className={
                                                            "ColumnName " +
                                                            Columns[statement][
                                                                c
                                                            ]
                                                        }
                                                        key={c + "_" + idx}
                                                    >
                                                        {c}
                                                    </td>

                                                    {[0, 1, 2, 3].map(
                                                        (i, idx) => {
                                                            return (
                                                                <td
                                                                    className={
                                                                        "Data " +
                                                                        Columns[
                                                                            statement
                                                                        ][c]
                                                                    }
                                                                    key={
                                                                        c +
                                                                        "_" +
                                                                        idx
                                                                    }
                                                                >
                                                                    {statementData[
                                                                        i
                                                                    ][
                                                                        Columns[
                                                                            statement
                                                                        ][c]
                                                                    ] ===
                                                                    undefined
                                                                        ? " - "
                                                                        : statementData[
                                                                              i
                                                                          ][
                                                                              Columns[
                                                                                  statement
                                                                              ][
                                                                                  c
                                                                              ]
                                                                          ].fmt}
                                                                </td>
                                                            );
                                                        }
                                                    )}
                                                </tr>
                                            );
                                        }
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
