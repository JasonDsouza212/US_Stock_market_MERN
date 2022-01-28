import React from "react";

//Import Scss
import "./StyledComponents.scss";

//Import clsx
import clsx from "clsx";

export default function Card(props) {
    return (
        <div
            className={clsx({ Card: true, H100: props.H100 })}
            onClick={(e) => e.stopPropagation()}
            id={props.id}
        >
            {props.children}
        </div>
    );
}
