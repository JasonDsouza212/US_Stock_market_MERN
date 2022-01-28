import React from "react";

//Import scss
import "./SearchQuote.scss";

//Import Custom Util Components
import Card from "../StyledComponents/Card";

export default function KeyData({ keyData }) {
    const dataLeft = [
        { "Previous Close": "previousClose" },
        { Open: "open" },
        { High: "high" },
        { Low: "low" },
        { Close: "close" },
    ];

    const dataRight = [
        { "MA 50D": "ma50" },
        { "MA 200D": "ma200" },
        { MarketCap: "marketCap" },
        { Volume: "volume" },
        { "Average Volume": "averageVolume" },
    ];
    return (
        <div className="KeyData">
            <Card>
                <div className="Header">Key Stats</div>
                <div className="DataTable">
                    {dataLeft.map((d, idx) => {
                        return (
                            <div
                                className="DataValue"
                                datalabel={Object.keys(d)}
                                key={"DataLeft_" + idx}
                            >
                                {keyData[Object.values(d)] || "N/A"}
                            </div>
                        );
                    })}
                    {dataRight.map((d, idx) => {
                        return (
                            <div
                                className="DataValue"
                                datalabel={Object.keys(d)}
                                key={"DataRight_" + idx}
                            >
                                {keyData[Object.values(d)] || "N/A"}
                            </div>
                        );
                    })}
                </div>
            </Card>
        </div>
    );
}
