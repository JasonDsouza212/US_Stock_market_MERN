import React from "react";

//Import Custom Util Components
import Card from "../../StyledComponents/Card";
import LineChart from "./LineChart";

export default function PNLChart({ userInfo, transactions }) {
    transactions =
        transactions !== undefined
            ? transactions.map((data) => ({
                  ...data,
                  date: new Date(data.date),
              }))
            : [];

    return (
        <div className="PNLChart" id="PNLChart_">
            <div className="Header">Realized PNL</div>
            <Card>
                <LineChart userInfo={userInfo} transactions={transactions} />
            </Card>
        </div>
    );
}
