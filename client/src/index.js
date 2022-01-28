import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import firebase from "firebase/app";
import "firebase/analytics";

// const firebaseConfig = {
//     apiKey: process.env.REACT_APP_firebase_apiKey,
//     authDomain: process.env.REACT_APP_firebase_authDomain,
//     projectId: process.env.REACT_APP_firebase_projectId,
//     storageBucket: process.env.REACT_APP_firebase_storageBucket,
//     messagingSenderId: process.env.REACT_APP_firebase_messagingSenderId,
//     appId: process.env.REACT_APP_firebase_appId,
//     measurementId: process.env.REACT_APP_firebase_measurementId,
// };
// firebase.initializeApp(firebaseConfig);

// function sendAnalytics() {
//     firebase.analytics();
//     //firebase.analytics().setCurrentScreen(window.location.pathname);
//     firebase.analytics().logEvent("screen_view");
// }

ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals(sendAnalytics);
