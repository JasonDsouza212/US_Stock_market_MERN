import React from "react";

//Import Scss
import "./StyledComponents.scss";

//Import clsx
import clsx from "clsx";

export default function Snackbar(props) {
    return (
        <div
            className={clsx({
                Snackbar: true,
                Error: props.Error,
                Warning: props.Warning,
                Info: props.Info,
                Success: props.Success,
            })}
        >
            {props.Message}
        </div>
    );
}
