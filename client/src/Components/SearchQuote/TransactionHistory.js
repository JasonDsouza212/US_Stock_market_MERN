import React from "react";

//Import scss
import "./SearchQuote.scss";

//Import Custom Util Components
import Card from "../StyledComponents/Card";

//Import UserContext
import UserContext from "../../Context/UserContext";

export default function TransactionHistory() {
    const { userInfo, nav } = React.useContext(UserContext);

    const filteredTransactions = userInfo.transaction.filter(
        (data) => data.symbol === nav.symbol
    );

    return (
        <div className="TransactionHistory">
            <Card>
                <div className="Header"> Transaction History </div>
                <div className="TableContainer">
                    <table>
                        <thead>
                            <tr className="Colname">
                                <th key="Colname_Date">Date</th>
                                <th key="Colname_Price">Price</th>
                                <th key="Colname_Total">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTransactions.map((d, idx) => {
                                const Buy = d.quantity > 0;
                                return (
                                    <tr
                                        className="Row"
                                        id={"transaction_" + idx}
                                        key={"transaction_" + idx}
                                    >
                                        <td
                                            className="Type"
                                            style={{
                                                color: Buy ? "green" : "red",
                                            }}
                                            date={new Date(
                                                d.date
                                            ).toLocaleDateString()}
                                            id={"transaction_type_" + idx}
                                            key={"transaction_type_" + idx}
                                        >
                                            {Buy ? "Buy" : "Sell"}
                                        </td>

                                        <td
                                            className="Quantity"
                                            price={d.price}
                                            id={"transaction_quantity_" + idx}
                                            key={"transaction_quantity_" + idx}
                                        >
                                            {d.quantity}
                                        </td>

                                        <td
                                            className="Total"
                                            style={{
                                                color: Buy ? "red" : "green",
                                            }}
                                            id={"transaction_total_" + idx}
                                            key={"transaction_total_" + idx}
                                        >
                                            $
                                            {Number(
                                                (
                                                    d.price *
                                                    d.quantity *
                                                    -1
                                                ).toFixed(2)
                                            ).toLocaleString("en")}
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredTransactions.length === 0 && (
                                <>
                                    <td key="1">No</td>
                                    <td key="2">Transaction</td>
                                    <td key="3">History</td>
                                </>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
