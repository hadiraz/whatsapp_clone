import React from "react";
import ReactDom from "react-dom";
import App from "./client/App";
import { ContextProvider } from "./useGlobalContext";
import { initialState , actionTypes } from './reducer';
import reducer from "./reducer"
//  
ReactDom.render(
    <React.StrictMode>
        <ContextProvider initialState={initialState} reducer={reducer}>
            <App/>
        </ContextProvider> 
    </React.StrictMode>,document.getElementById("root"))