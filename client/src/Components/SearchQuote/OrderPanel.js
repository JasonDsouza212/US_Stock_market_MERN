import React from "react";

//Import scss
import "./SearchQuote.scss";

//Import Custom Util Components
import Card from "../StyledComponents/Card";
import Divider from "../StyledComponents/Divider";

//Import UserContext
import UserContext from "../../Context/UserContext";

//Import Axios for API calling
import axios from "axios";

export default function OrderPanel({ lastPrice }) {
    const { userInfo, setUserInfo, nav } = React.useContext(UserContext);
    const cashValue =
        Number(userInfo.balance.toFixed(2)).toLocaleString("en") || 0;
    const position = userInfo.portfolio[nav.symbol] || 0;

    const marketPrice = lastPrice || 0;

    const sharesRef = React.useRef();

    const url = "https://www.plutusbackend.com/api/order/";

    //toggle snackbar
    function toggleSnackbar(status, msg) {
        var snack = document.getElementsByClassName("Snackbar")[0];

        snack.className = `Snackbar ${status} Show`;
        snack.textContent = msg;

        setTimeout(function () {
            snack.className = "Snackbar";
        }, 1900);
    }

    //Place order
    function placeOrder(e, idx) {
        e.preventDefault();
        let _url = url + (idx === 0 ? "buy" : "sell");

        let Shares = document.getElementsByClassName("Shares");

        let quantity = idx === 0 ? Shares[idx].value : -Shares[idx].value;

        const token = localStorage.getItem("Auth Token");
        let axiosConfig = {
            headers: {
                Authorization: token,
            },
        };

        const sendOrder = async () => {
            const res = await axios.post(
                _url,
                {
                    userID: userInfo.userID,
                    symbol: nav.symbol,
                    quantity: Math.round(quantity),
                },
                axiosConfig
            );
            if (res.data.status === "fail") {
                toggleSnackbar("Error", res.data.message);
            } else {
                toggleSnackbar("Success", res.data.message);
                setUserInfo({
                    ...userInfo,
                    balance: res.data.balance,
                    portfolio: res.data.portfolio,
                    transaction: res.data.transaction,
                    unitPrice: res.data.unitPrice,
                });
            }
        };
        sendOrder();
    }

    //calculate diffeent total price
    function reCalculate(e, idx) {
        let totalCost = document.getElementsByClassName("TotalCost");

        totalCost[idx].textContent =
            "$" +
            Number((e.target.value * marketPrice).toFixed(2)).toLocaleString(
                "en"
            );
    }

    function toggleSwitch(idx) {
        let Interface = document.getElementsByClassName("OrderInterface");
        Interface[idx].className = "OrderInterface Out";
        Interface[Math.abs(idx - 1)].className = "OrderInterface Show";
    }

    function Flattern(idx) {
        toggleSwitch(idx);

        let newIdx = Math.abs(idx - 1);

        let Shares = document.getElementsByClassName("Shares");
        Shares[newIdx].value = Math.abs(position);

        let totalCost = document.getElementsByClassName("TotalCost");
        totalCost[newIdx].textContent =
            "$" +
            Number(
                (Math.abs(position) * marketPrice).toFixed(2)
            ).toLocaleString("en");
    }

    function Reverse(idx) {
        toggleSwitch(idx);

        let newIdx = Math.abs(idx - 1);

        let Shares = document.getElementsByClassName("Shares");
        Shares[newIdx].value = Math.abs(position) * 2;

        let totalCost = document.getElementsByClassName("TotalCost");
        totalCost[newIdx].textContent =
            "$" +
            Number(
                (Math.abs(position) * 2 * marketPrice).toFixed(2)
            ).toLocaleString("en");
    }

    return (
        <div className="OrderPanel">
            <Card id="flipCard">
                <div className="OrderInterface Show">
                    <div className="Header">
                        <div className="CardTitle">Market Order</div>
                        <div className="Type Buy">Buy</div>
                    </div>

                    <div className="PositionInfo">
                        <div className="CashBalance" name="Cash Balance">
                            ${cashValue}
                        </div>
                        <div className="Position" name="Current Position">
                            {position}
                        </div>

                        <div className="ButtonGroup">
                            <button
                                disabled={position === 0 || position < 0}
                                onClick={() => Flattern(0)}
                            >
                                Flattern
                            </button>
                            <button
                                disabled={position === 0 || position < 0}
                                onClick={() => Reverse(0)}
                            >
                                Reverse
                            </button>
                        </div>
                    </div>
                    <div className="OrderForm">
                        <div className="InputContainer" name="Shares ">
                            <input
                                ref={sharesRef}
                                defaultValue={1}
                                min={1}
                                type="number"
                                id="Shares"
                                className="Shares"
                                onChange={(e) => reCalculate(e, 0)}
                            />
                        </div>
                        <div className="MarketPrice" name="Market Price ">
                            ${marketPrice}
                        </div>
                        <div
                            className="TotalCost"
                            id="TotalCost"
                            name="Total Cost "
                        >
                            ${marketPrice}
                        </div>
                        <Divider />
                        <button
                            onClick={(e) => placeOrder(e, 0)}
                            className="OrderButton"
                        >
                            Place Order
                        </button>
                        <h6 onClick={() => toggleSwitch(0)}>Sell?</h6>
                    </div>
                </div>

                <div className="OrderInterface">
                    <div className="Header">
                        <div className="CardTitle">Market Order</div>
                        <div className="Type Sell">Sell</div>
                    </div>
                    <div className="PositionInfo">
                        <div className="CashBalance" name="Cash Balance">
                            ${cashValue}
                        </div>
                        <div className="Position" name="Current Position">
                            {position}
                        </div>

                        <div className="ButtonGroup">
                            <button
                                disabled={position === 0 || position > 0}
                                onClick={() => Flattern(1)}
                            >
                                Flattern
                            </button>
                            <button
                                disabled={position === 0 || position > 0}
                                onClick={() => Reverse(1)}
                            >
                                Reverse
                            </button>
                        </div>
                    </div>

                    <div className="OrderForm">
                        <div className="InputContainer" name="Shares ">
                            <input
                                ref={sharesRef}
                                defaultValue={1}
                                min={1}
                                type="number"
                                id="Shares"
                                className="Shares"
                                onChange={(e) => reCalculate(e, 1)}
                            />
                        </div>
                        <div className="MarketPrice" name="Market Price ">
                            ${marketPrice}
                        </div>
                        <div
                            className="TotalCost"
                            id="TotalCost"
                            name="Total Credit "
                        >
                            ${marketPrice}
                        </div>
                        <Divider />
                        <button
                            onClick={(e) => placeOrder(e, 1)}
                            className="OrderButton"
                        >
                            Place Order
                        </button>
                        <h6 onClick={() => toggleSwitch(1)}>Buy?</h6>
                    </div>
                </div>
            </Card>
        </div>
    );
}
