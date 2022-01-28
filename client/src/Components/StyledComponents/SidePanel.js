import React from "react";

//Import Scss
import "./StyledComponents.scss";

//Import Needed SVG
import { ReactComponent as Dashboardlogo } from "../../Assets/dashboard.svg";
import { ReactComponent as Searchquotelogo } from "../../Assets/searchquote.svg";
import { ReactComponent as Optionchainslogo } from "../../Assets/optionchains.svg";
import { ReactComponent as Marketnewslogo } from "../../Assets/marketnews.svg";

import { ReactComponent as Settinglogo } from "../../Assets/setting.svg";
import { ReactComponent as Logoutlogo } from "../../Assets/logout.svg";

import { ReactComponent as Doubleleftarrowlogo } from "../../Assets/doubleleftarrow.svg";
import { ReactComponent as Doublerightarrowlogo } from "../../Assets/doublerightarrow.svg";

//Import UserContext
import UserContext from "../../Context/UserContext";

//Import Custom Util Components
import Divider from "./Divider";
import Dialog from "./Dialog";

//Import Axios for API calling
import axios from "axios";
//Import clsx
import clsx from "clsx";

export default function SidePanel() {
    const [collapsed, setCollapsed] = React.useState(false);

    const [open, setOpen] = React.useState(false);

    const { userInfo, setUserInfo, nav, setNav } =
        React.useContext(UserContext);
    const icons = [
        <Dashboardlogo className="NavItemIcon" />,
        <Searchquotelogo className="NavItemIcon" />,
        <Optionchainslogo className="NavItemIcon" />,
        <Marketnewslogo className="NavItemIcon" />,
        <Settinglogo className="NavItemIcon" />,
        <Logoutlogo className="NavItemIcon" />,
    ];

    function toggleSnackbar(status, msg) {
        var snack = document.getElementsByClassName("Snackbar")[0];

        snack.className = `Snackbar ${status} Show`;
        snack.textContent = msg;

        setTimeout(function () {
            snack.className = "Snackbar";
        }, 1900);
    }

    function resetAccount(e) {
        e.preventDefault();
        const token = localStorage.getItem("Auth Token");
        let axiosConfig = {
            headers: {
                Authorization: token,
            },
        };
        const resetOrder = async () => {
            const res = await axios.post(
                "https://www.plutusbackend.com/api/order/reset",
                {
                    userID: userInfo.userID,
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
                    reset: (userInfo.reset += 1),
                });
            }
        };
        resetOrder();
    }

    return (
        <div className={clsx({ SidePanel: true, Collapsed: collapsed })}>
            <Dialog open={open} setOpen={setOpen}>
                <div className="UserName" text="User Name">
                    {userInfo.userName}
                </div>
                <div className="JoinDate" text="Date Joined">
                    {new Date(userInfo.joinDate).toLocaleDateString()}
                </div>
                <button
                    className="ResetButton"
                    onClick={(e) => (setOpen(false), resetAccount(e))}
                >
                    Reset Balance!
                </button>
            </Dialog>
            <div className="TitleLogo">
                <span className={clsx({ Collapsed: collapsed })}>Plutus</span>
            </div>
            <ul className="NavItems">
                {[
                    "Dashboard",
                    "Search Quote",
                    "Option Chains",
                    "Market News",
                ].map((item, idx) => (
                    <React.Fragment key={idx}>
                        <div
                            className={clsx({
                                NavItem: true,
                                Collapsed: collapsed,
                                Selected: nav.currentPage === item,
                            })}
                            content=""
                            tooltip={item}
                            onClick={() =>
                                nav.currentPage !== item &&
                                setNav({ ...nav, currentPage: item })
                            }
                            onTouch={() =>
                                nav.currentPage !== item &&
                                setNav({ ...nav, currentPage: item })
                            }
                        >
                            <div>{icons[idx]}</div>
                            <span className="NavItemText">{item}</span>
                        </div>
                    </React.Fragment>
                ))}
                <Divider style={{ marginTop: "auto" }} />

                <div
                    className={clsx({
                        NavItem: true,

                        Collapsed: collapsed,
                    })}
                    content=""
                    tooltip={"Setting"}
                    onClick={() => setOpen(true)}
                >
                    <div>
                        <Settinglogo className="NavItemIcon" />
                    </div>
                    <span className="NavItemText">Setting</span>
                </div>

                <div
                    className={clsx({
                        NavItem: true,
                        Collapsed: collapsed,
                    })}
                    tooltip="Log Out"
                    onClick={() => {
                        setUserInfo(null);
                        localStorage.removeItem("Auth Token");
                    }}
                >
                    <div>
                        {" "}
                        <Logoutlogo className="NavItemIcon" />
                    </div>

                    <span className="NavItemText">Log Out</span>
                </div>

                <div
                    className="NavItem"
                    id="CollapsedBtn"
                    onClick={() => setCollapsed(!collapsed)}
                >
                    <div>
                        {collapsed ? (
                            <Doublerightarrowlogo className="NavItemIcon" />
                        ) : (
                            <Doubleleftarrowlogo className="NavItemIcon" />
                        )}
                    </div>
                </div>
            </ul>
        </div>
    );
}
