import React from "react";

//Import scss
import "./SearchQuote.scss";
//Import d3 time format
import { timeFormat } from "d3";
//Import Needed SVG
import { ReactComponent as Websitelogo } from "../../Assets/website.svg";

export default function StockInfo({ stockInfo }) {
    const format = timeFormat("%b %d %Y %I:%M %p");
    return (
        <div className="StockInfo">
            <div className="Header">
                <div className="CompanyName">
                    <h1>{stockInfo.name}</h1>
                    {stockInfo.website && (
                        <a
                            target="_blank"
                            rel="noreferrer"
                            href={stockInfo.website}
                        >
                            <Websitelogo className="webLogo" />
                        </a>
                    )}
                </div>
                <div className="SymbolTags">
                    <h4>
                        {stockInfo.symbol} : {stockInfo.exchangeName}
                    </h4>
                    <div>
                        {stockInfo.sector && <div>#{stockInfo.sector}</div>}
                        {stockInfo.industry && <div>#{stockInfo.industry}</div>}
                    </div>
                </div>
            </div>

            {stockInfo.lastPrice && (
                <>
                    <h1 className="Price" currency={stockInfo.currency}>
                        {stockInfo.lastPrice}
                    </h1>
                    <div className="PriceChange">
                        <h2 style={{ color: stockInfo.color }}>
                            {stockInfo.priceChange} (
                            {stockInfo.priceChangePercent})
                        </h2>
                        <h5>Updated At {format(new Date())}</h5>
                    </div>
                </>
            )}
        </div>
    );
}
