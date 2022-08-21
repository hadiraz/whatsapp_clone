import React from 'react';

export const initialState = {
    user : "" ,
    image : "" ,
    email : "" ,
    displayName : "" ,
    id : "" ,
    permission : false
} 

export const actionTypes = {
    SET_USER : "SET_USER" ,
}

const reducer = (type , state) => {
    
    switch (type){
        case actionTypes.SET_USER :
            return (
                {
                    ...state ,
                    user : state ,
                    image : state.image ,
                    email : state.email ,
                    displayName : state.displayName ,
                    id : state.id ,
                    permission : state.permission
                }
            )
        default : return state
    }
    
}

export default reducer ;