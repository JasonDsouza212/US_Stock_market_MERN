import React from "react";

//Import Scss
import "./Auth.scss";

//Import Needed SVG
import PlutusLogo from "../../Assets/Plutus Icon.svg";
import AccountLogo from "../../Assets/account.svg";

//Import Custom Util Components
import Snackbar from "../StyledComponents/Snackbar";

//Import UserContext
import UserContext from "../../Context/UserContext";

//Import Axios for API calling
import axios from "axios";

export default function Login() {
    const loginUsername = React.useRef();
    const loginPassword = React.useRef();
    const registerUsername = React.useRef();
    const registerPassword = React.useRef();

    const { setUserInfo } = React.useContext(UserContext);

    const url = "https://www.plutusbackend.com/api/auth/";

    function toggleFlip() {
        //Flip The Login Card & Register Card
        const form = document.querySelector(".Form");
        if (form.className === "Form") {
            form.className = "Form Flipped";
            loginUsername.current.value = null;
            loginPassword.current.value = null;
            registerUsername.current.focus();
        } else if (form.className === "Form Flipped") {
            form.className = "Form";
            registerUsername.current.value = null;
            registerPassword.current.value = null;
            loginUsername.current.focus();
        }
    }

    //toggleSnackbar
    function toggleSnackbar(status, msg) {
        var snack = document.getElementsByClassName("Snackbar")[0];

        snack.className = `Snackbar ${status} Show`;
        snack.textContent = msg;

        setTimeout(function () {
            snack.className = "Snackbar";
        }, 1900);
    }
    //log user in
    function login(e) {
        e.preventDefault();
        let user = loginUsername.current.value;
        let pw = loginPassword.current.value;
        const submit = async (user, pw) => {
            const res = await axios.post(url + "login", {
                username: user,
                password: pw,
            });
            if (res.data.status === "fail") {
                toggleSnackbar("Error", res.data.message);
                loginUsername.current.style.border = "3px solid red";
                loginPassword.current.style.border = "3px solid red";
            } else {
                toggleSnackbar("Success", res.data.message);
                localStorage.setItem("Auth Token", res.data.token);
                setUserInfo({
                    userName: res.data.username,
                    userID: res.data.userID,
                    joinDate: new Date(res.data.joinDate),

                    balance: res.data.balance,
                    portfolio: res.data.portfolio,
                    transaction: res.data.transaction,
                    unitPrice: res.data.unitPrice,
                    reset: 0,
                });
            }
        };
        submit(user, pw);
    }
    //Register New User
    function register(e) {
        e.preventDefault();
        let user = registerUsername.current.value;
        let pw = registerPassword.current.value;
        const submit = async (user, pw) => {
            const res = await axios.post(url + "register", {
                username: user,
                password: pw,
            });
            if (res.data.status === "fail") {
                toggleSnackbar("Error", res.data.message);
                registerUsername.current.style.border = "3px solid red";
                registerPassword.current.style.border = "3px solid red";
            } else {
                toggleSnackbar("Success", res.data.message);
                toggleFlip();
            }
        };
        submit(user, pw);
    }

    //Keyboard Shortcut;
    const hitEnter = (e) => {
        if (e.key === "Enter") {
            const form = document.querySelector(".Form");
            const ele = document.getElementById(
                form.className === "Form" ? "Login" : "Register"
            );
            ele.click();
        }
    };
    React.useEffect(() => {
        document.addEventListener("keydown", hitEnter);

        return () => {
            document.removeEventListener("keydown", hitEnter);
        };
    }, []);

    return (
        <>
            <div className="LoginPage" id="LP">
                <Snackbar />
                <div className="LogoName">
                    <img src={PlutusLogo} alt="logo" className="Logo" />
                    <div className="Name">
                        <h1>Plutus</h1>
                        <span>
                            Learn How To Invest and Analyze Stock Online
                        </span>
                    </div>
                </div>

                <div className="Login">
                    <div className="Form">
                        <div className="Face Front" id="Front">
                            <img
                                src={AccountLogo}
                                alt="account"
                                className="AccountLogo"
                            />
                            <input
                                ref={loginUsername}
                                placeholder="UserName"
                            ></input>
                            <input
                                ref={loginPassword}
                                type="password"
                                placeholder="Password"
                            ></input>
                            <span onClick={() => toggleFlip()}>
                                New Here? Create An Account!
                            </span>
                            <button
                                id="Login"
                                className="Ripple"
                                onClick={(e) => login(e)}
                            >
                                Login
                            </button>
                        </div>
                        <div className="Face Back" id="Back">
                            <img
                                src={AccountLogo}
                                alt="account"
                                className="AccountLogo"
                            />
                            <input
                                ref={registerUsername}
                                placeholder="UserName"
                            ></input>
                            <input
                                ref={registerPassword}
                                type="password"
                                placeholder="Password"
                            ></input>
                            <span onClick={() => toggleFlip()}>
                                Already Have An Account? Log In!
                            </span>
                            <button
                                id="Register"
                                className="Ripple"
                                onClick={(e) => register(e)}
                            >
                                Register
                            </button>
                        </div>
                    </div>
                </div>

                <div className="Footer">Kelvin Hui ©2021</div>
                <span className="BgCredit">
                    <a
                        target="_blank"
                        rel="noreferrer"
                        href={
                            "https://www.vecteezy.com/vector-art/570478-candle-stick-graph-chart-of-stock-market-investment-trading-bullish-point-bearish-point-trend-of-graph-vector-design"
                        }
                        alt="Bg Credit"
                    >
                        BG Credit
                    </a>
                </span>
            </div>
        </>
    );
}
