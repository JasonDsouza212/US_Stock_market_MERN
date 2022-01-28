import React from "react";

//Import Custom Util Components
import Card from "../StyledComponents/Card";

//Import clsx
import clsx from "clsx";

export default function AccountInfo({ userInfo, portfolioValue, todayPNL }) {
    const totalReturn = {
        raw: (portfolioValue - 25000).toFixed(2),
        fmt:
            (Math.abs((portfolioValue - 25000) / 25000) * 100).toFixed(2) + "%",
    };

    const totalReturnGain = totalReturn.raw >= 0;
    return (
        <div className="AccountInfo">
            <Card H100={true}>
                <h1 className="Header">
                    Hey {userInfo.userName} ! Welcome Back!
                </h1>

                <h3 className="JoinDate">
                    You Have Been With 🧔🏼💰
                    <span>Plutus </span>
                    for
                    <span>
                        {Math.round(
                            (new Date().getTime() -
                                userInfo.joinDate.getTime()) /
                                (1000 * 60 * 60 * 24)
                        )}
                    </span>
                    days 🥳🎉
                </h3>
                <div className="StatContainer">
                    <h1 className="PortfolioValue">
                        $
                        {Number(portfolioValue.toFixed(2)).toLocaleString("en")}
                    </h1>
                    <h2
                        className={clsx({
                            TotalReturn: true,
                            Up: totalReturnGain,
                            Down: !totalReturnGain,
                        })}
                    >
                        {totalReturnGain ? "+" : "-"}
                        {Math.abs(totalReturn.raw)}(
                        {totalReturnGain ? "+" : "-"}
                        {totalReturn.fmt})
                    </h2>
                </div>
            </Card>
        </div>
    );
}
