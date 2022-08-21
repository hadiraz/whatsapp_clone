import React , {createContext, useContext, useReducer}  from 'react';

const CreatContext = React.createContext();

export const ContextProvider = ({initialState = "" , reducer = '' , children}) => { 
    return(
        <CreatContext.Provider value={useReducer(reducer , initialState)}>
            {children}
        </CreatContext.Provider>
    )
}

export const useGlobalContext = () => {
    return useContext(CreatContext)
    
}