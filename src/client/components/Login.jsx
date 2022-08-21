import { Button } from '@material-ui/core'
import React, { useEffect, useState } from 'react'
import { popOpAuth } from '../../server/fireBase';
import { getAuth , signInWithPopup , GoogleAuthProvider } from "firebase/auth";
import { useGlobalContext } from '../../useGlobalContext';
import {actionTypes} from "../../reducer"
import { collection, getDoc , setDoc, onSnapshot , doc, getDocs } from '@firebase/firestore';
import db from '../../server/fireBase';
import { dbDatabase } from '../../server/fireBase';
import { getDatabase, ref, onValue ,set} from "firebase/database";

/** ---------------- */

function Login() {
const [state , dispatch] = useGlobalContext();
const [permission , setPermission] = useState(false)
const [data , setData] = useState({})

const signInGoogle = async() => {
    signInWithPopup(getAuth() , new GoogleAuthProvider())
    .then((res)=>{dispatch({
        type : actionTypes.SET_USER ,
        user : res.user ,
        image : res.user.photoURL ,
        email : res.user.email ,
        displayName : res.user.displayName ,
        id : res.user.uid,
        permission : permission
    })})
    
    .catch((err)=>(false)) ;
}

useEffect(()=>{
    if(state.id && state.permission === false){
        checkUser();
    }
},[state.id])

const checkUser = async () => {
    const docSnap = await getDoc(doc(db, "users" , state.id));
    if (docSnap.exists()) {
      dispatch({
          ...state ,
          permission : true
        });
    } else {
        setDoc(doc(db, "users" , state.id), {
            user_lastSeen: "",
            user_rooms: ["public"],
            user_email : state.email ,
            user_id : state.id,
          });
          dispatch({
              ...state ,
              permission : true
          })
    }
}

    return (
        <div className="login__container d-flex flex-column align-items-center">
            <p className="login__topTitle">Login To APP</p>
            <div className="login__main-box d-flex w-100 justify-content-center align-items-center">
                <Button onClick={signInGoogle} className="login__googleButton">
                    sign in with google
                </Button>
            </div>
        </div>
    )
}

export default Login
