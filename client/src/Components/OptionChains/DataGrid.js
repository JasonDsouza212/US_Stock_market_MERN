import React from "react";

//Import Axios for API calling
import axios from "axios";
//Import clsx
import clsx from "clsx";

export default function DataGrid({ symbol, data, exp }) {
    const [optionData, setOptionData] = React.useState(data);

    React.useEffect(() => {
        const token = localStorage.getItem("Auth Token");
        let axiosConfig = {
            headers: {
                Authorization: token,
            },
        };
        const fetchData = async () => {
            const result = await axios.get(
                `https://www.plutusbackend.com/api/optionChains?symbol=${symbol}&date=${exp}`,
                axiosConfig
            );
            setOptionData(result.data.optionsData);
        };
        if (exp !== null) {
            fetchData();
        }
    }, [symbol, exp]);

    const columns = [
        "Open Interest",
        "Volume",
        "Implied Volatility",
        "Bid",
        "Ask",
        "Last",
        "%Change",
        "Strike",
        "%Change",
        "Last",
        "Bid",
        "Ask",
        "Implied Volatility",
        "Volume",
        "Open Interest",
    ];

    return (
        <table className="OptionsGrid">
            <thead>
                <tr className="CALLPUT ColSpan3">
                    <th colSpan={3} className="Calls">
                        Calls
                    </th>
                    <th></th>
                    <th colSpan={3} className="Puts">
                        Puts
                    </th>
                </tr>
                <tr className="CALLPUT ColSpan4">
                    <th colSpan={4} className="Calls">
                        Calls
                    </th>
                    <th></th>
                    <th colSpan={4} className="Puts">
                        Puts
                    </th>
                </tr>
                <tr className="CALLPUT ColSpan7">
                    <th colSpan={7} className="Calls">
                        Calls
                    </th>
                    <th></th>
                    <th colSpan={7} className="Puts">
                        Puts
                    </th>
                </tr>
                <tr className="Row ColName">
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
                {Object.keys(optionData).length === 0 ? (
                    <tr>
                        <td
                            colSpan="15"
                            style={{
                                height: "100vh",
                                verticalAlign: "sub",
                                textAlign: "center",
                                fontWeight: "bold",
                            }}
                            className="Skeleton"
                        >
                            Loading....
                        </td>
                    </tr>
                ) : (
                    Object.keys(optionData).length !== 0 &&
                    optionData.map((data, idx) => {
                        const c = data.calls !== undefined ? data.calls : {};
                        const p = data.puts !== undefined ? data.puts : {};

                        if (c !== null && p !== null) {
                            if (
                                Object.keys(c).length !== 0 &&
                                Object.keys(p).length !== 0
                            ) {
                                return (
                                    <tr
                                        className={clsx({
                                            Row: true,
                                            CallInTheMoney:
                                                c === null
                                                    ? false
                                                    : c.inTheMoney,
                                            PutInTheMoney:
                                                p === null
                                                    ? false
                                                    : p.inTheMoney,
                                        })}
                                        id={"Option_Strike@" + data.strikes}
                                        key={"data_" + idx}
                                    >
                                        <td className="OpenInterest">
                                            {c.openInterest || " - "}
                                        </td>
                                        <td>{c.volume || " - "}</td>
                                        <td className="ImpliedVolatility">
                                            {parseFloat(
                                                c.impliedVolatility * 100
                                            ).toFixed(2) + "%" || " - "}
                                        </td>
                                        <td className="Bid">
                                            {c.bid || " - "}
                                        </td>
                                        <td className="Ask">
                                            {c.ask || " - "}
                                        </td>
                                        <td>{c.lastPrice || " - "}</td>
                                        <td
                                            className={clsx({
                                                percentChange: true,
                                                up:
                                                    parseFloat(
                                                        c.percentChange
                                                    ).toFixed(2) > 0,
                                                down:
                                                    parseFloat(
                                                        c.percentChange
                                                    ).toFixed(2) < 0,
                                            })}
                                        >
                                            {parseFloat(
                                                c.percentChange
                                            ).toFixed(2) + "%" || " - "}
                                        </td>
                                        <td id={"strike_" + data.strikes}>
                                            <b>{data.strikes}</b>
                                        </td>
                                        <td
                                            className={clsx({
                                                percentChange: true,
                                                up:
                                                    parseFloat(
                                                        p.percentChange
                                                    ).toFixed(2) > 0,
                                                down:
                                                    parseFloat(
                                                        p.percentChange
                                                    ).toFixed(2) < 0,
                                            })}
                                        >
                                            {parseFloat(
                                                p.percentChange
                                            ).toFixed(2) + "%" || " - "}
                                        </td>
                                        <td>{p.lastPrice || " - "}</td>
                                        <td className="Bid">
                                            {p.bid || " - "}
                                        </td>
                                        <td className="Ask">
                                            {p.ask || " - "}
                                        </td>
                                        <td className="ImpliedVolatility">
                                            {parseFloat(
                                                p.impliedVolatility * 100
                                            ).toFixed(2) + "%" || " - "}
                                        </td>
                                        <td>{p.volume || " - "}</td>
                                        <td className="OpenInterest">
                                            {p.openInterest || " - "}
                                        </td>
                                    </tr>
                                );
                            }
                        }
                    })
                )}
            </tbody>
        </table>
    );
}
