import React from "react";

//Import Custom Util Components
import Card from "../StyledComponents/Card";

export default function NewsCard({ data }) {
    return (
        <Card H100={true}>
            <div className="NewsCard">
                <a
                    className="ThumbnailPic"
                    href={data.newsLink}
                    target="_blank"
                    rel="noreferrer"
                >
                    <img alt="thumbnailPic" src={data.newsThumbnail} />
                </a>
                <b className="Title">{data.newsTitle}</b>
                <div className="NewsFooter">
                    <i>{data.newsSource}</i>
                    <span>{data.sourceTime} </span>
                </div>
            </div>
        </Card>
    );
}
