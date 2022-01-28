import React from "react";

//Import scss
import "./MarketNews.scss";
//Import SearchInput
import SearchInput from "../StyledComponents/SearchInput";
//Import Axios for API calling
import axios from "axios";
//Import NewsCard
import NewsCard from "./NewsCard";
//Import Custom Util Components
import Card from "../StyledComponents/Card";
import Snackbar from "../StyledComponents/Snackbar";

export default function MarketNews({ symbol }) {
    const [news, setNews] = React.useState([]);

    function toggleSnackbar(status, msg) {
        var snack = document.getElementsByClassName("Snackbar")[0];

        snack.className = `Snackbar ${status} Show`;
        snack.textContent = msg;

        setTimeout(function () {
            snack.className = "Snackbar";
        }, 1900);
    }

    React.useEffect(() => {
        const token = localStorage.getItem("Auth Token");
        let axiosConfig = {
            headers: {
                Authorization: token,
            },
        };
        const fetchData = async () => {
            const result = await axios.get(
                `https://www.plutusbackend.com/api/marketNews?symbol=${symbol}`,
                axiosConfig
            );
            if (result.data.status === "fail") {
                toggleSnackbar("Error", result.data.message);
            } else {
                setNews(result.data.data);
            }
        };
        fetchData();
    }, [symbol]);

    const sampleData = [1, 2, 3, 4, 5, 6];
    return (
        <div className="Contentpage">
            <Snackbar />
            <SearchInput
                placeholder="Search For Stock Quote (default : AAPL)"
                setNews={setNews}
            />
            <div className="NewsCardGrid">
                {news.length === 0
                    ? sampleData.map((d, idx) => {
                          return (
                              <Card key={"card_" + idx}>
                                  <div
                                      className="Skeleton"
                                      style={{ height: "300px", width: "100%" }}
                                  />
                              </Card>
                          );
                      })
                    : news.map((d, idx) => {
                          return <NewsCard key={"newsCard_" + idx} data={d} />;
                      })}
            </div>
        </div>
    );
}
