import React from "react";

//Import Scss
import "./StyledComponents.scss";
//Import Axios for API calling
import axios from "axios";
//Import clsx
import clsx from "clsx";

//NAV
//Import UserContext
import UserContext from "../../Context/UserContext";

export default function SearchInput(props) {
    const [error, setError] = React.useState(false);
    const { nav, setNav } = React.useContext(UserContext);

    async function check(symbol) {
        return axios
            .get(
                `https://www.plutusbackend.com/api/checkSymbol?symbol=${symbol}`
            )
            .then((res) => {
                return res.data.valid;
            });
    }
    function toggleSnackbar(status, msg) {
        var snack = document.getElementsByClassName("Snackbar")[0];

        snack.className = `Snackbar ${status} Show`;
        snack.textContent = msg;

        setTimeout(function () {
            snack.className = "Snackbar";
        }, 1900);
    }

    function enter(e) {
        if (e.target.value.toUpperCase() !== nav.symbol) {
            let valid = check(e.target.value.toUpperCase());

            if (props.setNews !== undefined) {
                props.setNews([]);
            }

            valid.then(function (v) {
                if (v) {
                    setNav({ ...nav, symbol: e.target.value.toUpperCase() });
                } else {
                    toggleSnackbar("Error", "Error ! Symbol Not Found !");
                }

                setError(!v);
            });
        }
    }
    return (
        <>
            <div className="SearchInput">
                <input
                    className={clsx({ Inputarea: true, Error: error })}
                    type="search"
                    placeholder={nav.symbol}
                    onKeyDown={(e) => {
                        e.key === "Enter" && enter(e);
                    }}
                />
            </div>
        </>
    );
}
