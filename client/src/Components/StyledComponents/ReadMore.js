import React from "react";

//Import Scss
import "./StyledComponents.scss";

export default function ReadMore({ readMore, setReadMore, children }) {
    const text = children;
    return (
        <p className="ReadMoreText">
            {text.length <= 1200 ? (
                text
            ) : (
                <>
                    {readMore ? text.slice(0, 1200) : text}
                    <span onClick={() => setReadMore(!readMore)}>
                        {readMore ? " ...Read More" : " Show Less"}
                    </span>
                </>
            )}
        </p>
    );
}
