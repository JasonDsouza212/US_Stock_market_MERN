import React from "react";

//Import scss
import "./Dashboard.scss";

//Import Content Components
import PortfolioChart from "./PortfolioChart/PortfolioChart";
import PNLChart from "./PNLChart/PNLChart";
import Portfolio from "./Portfolio";
import Transactions from "./Transactions";

//Import Custom Util Components
import Snackbar from "../StyledComponents/Snackbar";

//Import UserContext
import UserContext from "../../Context/UserContext";
//Import Axios for API calling
import axios from "axios";
import AccountInfo from "./AccountInfo";

export default function Dashboard() {
    const { userInfo } = React.useContext(UserContext);
    const url = "https://www.plutusbackend.com/api/dashboard/getDashboardInfo";

    const [userData, setUserData] = React.useState({
        userPortfolio: userInfo,
        portfolioData: [],
        portfolioValue: 0,
    });

    //toggleSnackbar
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
        const getDashboardInfo = async () => {
            const res = await axios.get(
                url + `?userID=${userInfo.userID}`,
                axiosConfig
            );

            if (res.data.status === "fail") {
                toggleSnackbar("Error", res.data.message);
            } else {
                setUserData(res.data.data);
            }
        };

        getDashboardInfo();
    }, [userInfo.reset]);

    return (
        <div className="Contentpage">
            <Snackbar />
            <div className="Dashboard">
                <AccountInfo
                    userInfo={userInfo}
                    portfolioValue={userData.portfolioValue}
                />

                <PortfolioChart
                    portfolioData={userData.portfolioData}
                    portfolioValue={userData.portfolioValue}
                    cashValue={userData.userPortfolio.balance}
                />
                <PNLChart
                    userInfo={userInfo}
                    transactions={userData.userPortfolio.transaction}
                />
                <Portfolio
                    portfolioValue={userData.portfolioValue}
                    portfolioData={userData.portfolioData}
                />
                <Transactions
                    transactions={userData.userPortfolio.transaction}
                />
            </div>
        </div>
    );
}
