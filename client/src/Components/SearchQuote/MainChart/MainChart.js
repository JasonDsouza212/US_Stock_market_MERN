import React from "react";

//Import scss
import "./MainChart.scss";

//Import Custom Util Components
import Card from "../../StyledComponents/Card";

//Import clsx
import clsx from "clsx";

//Import UserContext
import UserContext from "../../../Context/UserContext";

//Import Content Components
import Overview from "../MainChart/Overview";
import Chart from "../MainChart/Chart";
import Revenue from "./Revenue";
import Earning from "./Earning";
import Financial from "../MainChart/Financial";

export default function MainChart({ previousClose }) {
    const { nav, setNav } = React.useContext(UserContext);
    const [currentTab, setCurrentTab] = React.useState("Chart");
    const Tabs = [
        "Overview",
        "Chart",
        "Revenue",
        "Earning",
        "Financial",
        "Options",
        "News",
    ];

    React.useEffect(() => {
        setCurrentTab("Chart");
    }, [nav.symbol]);

    function switchTab(e, col) {
        e.preventDefault();
        if (col === "Options") {
            setNav({ ...nav, currentPage: "Option Chains" });
        }
        if (col === "News") {
            setNav({ ...nav, currentPage: "Market News" });
        } else {
            setCurrentTab(col);
        }
    }

    return (
        <div className="MainChart">
            <ul className="Columns">
                {Tabs.map((col, idx) => (
                    <li
                        className={clsx({
                            Options: true,
                            Current: currentTab === col,
                        })}
                        onClick={(e) => switchTab(e, col)}
                        key={idx}
                    >
                        {col}
                    </li>
                ))}
            </ul>
            {/* <Divider /> */}
            <Card id="Card_MainChart">
                {currentTab === "Overview" && <Overview symbol={nav.symbol} />}
                {currentTab === "Chart" && (
                    <Chart previousClose={previousClose} symbol={nav.symbol} />
                )}
                {currentTab === "Revenue" && <Revenue symbol={nav.symbol} />}
                {currentTab === "Earning" && <Earning symbol={nav.symbol} />}
                {currentTab === "Financial" && (
                    <Financial symbol={nav.symbol} />
                )}
            </Card>
        </div>
    );
}
