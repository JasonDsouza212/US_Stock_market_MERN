import React from "react";

//Import Custom Util Components
import Card from "../StyledComponents/Card";

//Import UserContext
import UserContext from "../../Context/UserContext";

//Import clsx
import clsx from "clsx";

export default function Transactions({ transactions }) {
    const { setNav } = React.useContext(UserContext);
    transactions =
        transactions !== undefined
            ? transactions.sort(
                  (a, b) => Date.parse(b.date) - Date.parse(a.date)
              )
            : [];
    const columns = [
        "Date",
        "Symbol",
        "Transaction Type",
        "Quantity",
        "Average Price Per Share",
        "Total Amount",
        "Profit & Loss",
    ];
    return (
        <div className="Transactions">
            <div className="Header">Recent Transactions</div>
            <Card>
                <table className="TransactionsTable">
                    <thead>
                        <tr className="ColName">
                            {columns.map((col, idx) => {
                                return (
                                    <th
                                        className={col.replaceAll(" ", "")}
                                        key={col + idx}
                                    >
                                        {col}
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.length !== 0 &&
                            transactions.map((data, idx) => {
                                return (
                                    <tr
                                        className="Row"
                                        key={"transactions_" + idx}
                                    >
                                        <td>
                                            {new Date(data.date)
                                                .toLocaleString()
                                                .replace(",", " ")}
                                        </td>
                                        <td
                                            className="Symbol"
                                            onClick={() =>
                                                setNav({
                                                    currentPage: "Search Quote",
                                                    symbol: data.symbol,
                                                })
                                            }
                                        >
                                            <b>{data.symbol}</b>
                                        </td>
                                        <td
                                            className={clsx({
                                                TransactionType: true,
                                                Up: data.quantity > 0,
                                                Down: data.quantity < 0,
                                            })}
                                        >
                                            {data.quantity > 0 ? "Buy" : "Sell"}
                                        </td>
                                        <td>{Math.abs(data.quantity)}</td>
                                        <td className="AveragePricePerShare">
                                            ${data.price}
                                        </td>
                                        <td className="TotalAmount">
                                            $
                                            {(
                                                data.price *
                                                data.quantity *
                                                -1
                                            ).toFixed(2)}
                                        </td>
                                        <td
                                            className={clsx({
                                                Up: data.pnl > 0,
                                                Down: data.pnl < 0,
                                            })}
                                        >
                                            {data.pnl === 0
                                                ? " - "
                                                : "$" + data.pnl.toFixed(2)}
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
