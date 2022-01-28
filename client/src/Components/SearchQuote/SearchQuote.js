import React from "react";

//Import scss
import "./SearchQuote.scss";

//Import SearchInput
import SearchInput from "../StyledComponents/SearchInput";

//Import Custom Util Components
import Snackbar from "../StyledComponents/Snackbar";

//Import Axios for API calling
import axios from "axios";

//Import Content Components
import StockInfo from "./StockInfo";
import KeyData from "./KeyData";
import MainChart from "./MainChart/MainChart";
import OrderPanel from "./OrderPanel";
import TransactionHistory from "./TransactionHistory";

export default function SearchQuote({ symbol }) {
    const [data, setData] = React.useState({
        stockInfo: [],
        keyData: [],
    });
    React.useEffect(() => {
        const fetchData = async () => {
            const responseInfo = await axios.get(
                `https://www.plutusbackend.com/api/searchQuote/getInfo?symbol=${symbol}`
            );

            if (responseInfo.data.status !== "fail") {
                setData(responseInfo.data.data);
            }
        };

        fetchData();
    }, [symbol]);

    return (
        <div className="Contentpage">
            <Snackbar />
            <div className="SearchQuote">
                <SearchInput />
                <StockInfo stockInfo={data.stockInfo} />
                <KeyData keyData={data.keyData} />
                <MainChart previousClose={data.keyData.previousClose} />
                <OrderPanel
                    lastPrice={Number(data.stockInfo.lastPrice).toLocaleString(
                        "en"
                    )}
                />
                <TransactionHistory />
            </div>
        </div>
    );
}
