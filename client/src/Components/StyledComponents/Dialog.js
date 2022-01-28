import React from "react";

//Import Scss
import "./StyledComponents.scss";
//Import Card
import Card from "./Card";

export default function Dialog(props) {
    return (
        <div
            className="Dialog"
            onClick={() => props.setOpen(false)}
            style={{ display: props.open ? "flex" : "none" }}
        >
            <Card H100={true}>{props.children}</Card>
        </div>
    );
}
