import React from "react";
//Import scss
import "./MainChart.scss";

//Import Custom Read More Component;
import ReadMore from "../../StyledComponents/ReadMore";

//Import Axios for API calling
import axios from "axios";

export default function Overview({ symbol }) {
    const [data, setData] = React.useState({});

    const [readMore, setReadMore] = React.useState(true);

    React.useEffect(() => {
        const fetchData = async () => {
            const response = await axios.get(
                `https://www.plutusbackend.com/api/searchQuote/getData?symbol=${symbol}&type=overview`
            );
            if (response.data.status !== "fail") {
                setData(response.data.data);
            }
        };

        if (Object.keys(data).length === 0) {
            fetchData();
        }
    }, [symbol]);

    return (
        <div className="Overview">
            {Object.keys(data).length !== 0 ? (
                <>
                    <div className="About">
                        <h1>About</h1>
                        {/* <p>{data.summary}</p> */}
                        <ReadMore readMore={readMore} setReadMore={setReadMore}>
                            {data.summary}
                        </ReadMore>
                    </div>
                    {readMore && (
                        <div className="CompanyInfo">
                            <div className="CEO" text="CEO">
                                {data.ceoName}
                            </div>
                            <div className="HeadQuarter" text="HeadQuarter">
                                {data.city}
                                {data.state ? ", " + data.state : ""},{" "}
                                {data.country}
                            </div>
                            <div className="Employees" text="Employees">
                                {data.employees}
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="EmptyData">Not Applicable ...</div>
            )}
        </div>
    );
}
