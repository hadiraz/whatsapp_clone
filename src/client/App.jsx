import React,  {createRef, useEffect, useState} from 'react'
import "./assets/App.css"
import {SideBar , ChatSide} from "./components";
import { getFirestore , collection , onSnapshot , doc , addDoc , setDoc , getDocs , query , where ,updateDoc} from "firebase/firestore";
import { getDatabase, ref, onValue , set , push} from "firebase/database";
import db, { dbDatabase } from "../server/fireBase"
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import {Login} from "./components/index"
import { useGlobalContext } from '../useGlobalContext';
// import { AddBusinessRounded } from '@mui/icons-material';
const appContext = React.createContext();

function App() {
    useEffect(()=>{
        alert("!! please turn on your VPN !!.")
    },[])
    const [addRoom , setAddRoom] = useState(false);
    const [addRoomMode , setAddRoomMode] = useState(0);
    const [error , setError] = useState({text:"" , mode:""})
    const [{user , image , email , displayName , id , permission} , dispatch] = useGlobalContext();
    
    // const addUser = async () => {
    //     await setDoc(doc(db , "users" , id), {
    //         rooms : ["public"] ,
    //         lastSeen : ""
    //     })
    // }

    // const userChecker = async () => {
    //     if(id !== null && id !== ""){
    //     let signedUser = false ;
    //     onSnapshot(collection(db , "users" ) , (snapshot)=>{
    //         const users = snapshot.docs.map((value)=>{
    //             if(id === value.id){
    //                 signedUser = true ;
    //             }
    //             return ({ id:value.id , data : value.data()})
    //         })
    //         if(!signedUser){
    //             <Login/>
    //         }
    //     })
    //     }
    // }
    
    // useEffect(()=>{
    //    userChecker() 
    // },[user])

const addRoomChecker = async (mode) => {
    const inputRoomName = document.getElementById("module__addRoom-input-room");
    const inputEmail = document.getElementById("module__addRoom-input-email");
    
    if(mode){
        if(!inputEmail.value || !inputRoomName){
            setError({text:"please fill all fields" , mode:"danger"})
        }else{
        if(addRoomMode === 0){

            let data = null ;
            const q = query(collection(db, "users"), where("user_email", "==", `${inputEmail.value}`));
            const querySnapshot = await getDocs(q);

            if(querySnapshot.docs[0] != null){
                data = querySnapshot.docs[0].data()
                if(data.user_rooms.indexOf(inputRoomName.value) === -1){
                const roomId = await createRoom(inputRoomName.value);

                updateDoc(doc(db,`users/${data.user_id}`),
                {"user_rooms":[...data.user_rooms ,`${roomId}`]
                })

                updateDoc(doc(db,`users/${id}`),
                {"user_rooms":[...data.user_rooms ,`${roomId}`]
                })

                setError({text:"room created successfully" , mode:"success"});
                }
            }else{
                setError({text:"user not found!" , mode:"danger"})
                }
            }
        }
    }else{
    inputRoomName.value = ""
    inputEmail.value = ""
    setAddRoom(false)
    setError({text:"" , mode:""})
    } 
}

const createRoom = async(name) => {
    const createCollection = await addDoc(collection(db , "rooms"), {
        name : name
    })
    const setId = await setDoc(doc(db , `rooms/${createCollection.id}`), {
        name : name ,
        id : createCollection.id ,
        lastMessage : {
            messageData : {} ,
            messageId : ""
        }
    })
    const roomId = createCollection.id ;
    return roomId
}

const AddRoomModule = () => {

    return(
        <section className="module__background d-flex justify-content-center align-items-center w-75 h-100">
            <div className="module__addRoom d-flex flex-column align-items-center justify-content-between p-2">
                <div className="module__header d-flex w-100 h-25">
                    {/* <span className={`module__header-btn justify-content-center w-50 d-flex p-2 ${addRoomMode === 1 ? "active" : ""}`} onClick={()=>setAddRoomMode(1)}>
                        Public Room
                    </span> */}
                    <span className={`module__header-btn justify-content-center w-100 d-flex p-2 active`} onClick={()=>setAddRoomMode(0)}>
                        Create Private Room
                    </span>
                </div>

                <div className="module__details-box d-flex flex-column align-items-center justify-content-center  w-100 h-50 p-3">

                    <label htmlFor="module__addRoom-input-room">
                        Enter the room's name
                        </label>
                    <input id="module__addRoom-input-room"  className="module__addRoomInput" />
                        <label htmlFor="module__addRoom-input-email" className="text-center">
                        Enter your friend's email <br/> (you can enter your email to test this feature)
                        </label>
                        <input id="module__addRoom-input-email"  className="module__addRoomInput" />
                        {
                            error.mode ? <div class={`error-box alert alert-${error.mode} d-flex w-100 p-1`}>
                                {
                                    error.text
                                }
                            </div> : ""
                            
                        }

                        
                </div>
                
                <div className="module__button-box d-flex align-items-center w-100 h-25">
                    <button onClick={()=>addRoomChecker(false)} className="module__button mx-2 module__button-red">
                        Cancel
                    </button>
                    <button onClick={()=>addRoomChecker(true)} className="module__button mx-2 module__button-green">
                        Add
                    </button>
                </div>
            </div>
        </section>
    )   
}
  const [reloadChatSide , setReloadChatSide] = useState(false)  
    const [showSideBar , setShowSideBar] = useState(true)
    return (
        permission ? (
            <main className="app__main-body d-flex">
                <appContext.Provider value={{reloadChatSideValue:reloadChatSide , setReloadChatSideFunc : setReloadChatSide,
                showSide : showSideBar ,
                setShowSide : setShowSideBar
                }}>
                <Router>
                        <SideBar addRoomModule={{addRoom,setAddRoom}} />
                        {
                            addRoom ? <AddRoomModule/> : ""
                        }
                    <Switch>
                        <Route path="/rooms/:roomId" component="">
                            <ChatSide/>
                        </Route>
                    </Switch>
                </Router>
                </appContext.Provider>
            </main>

        ) : (<Login/>)
    )
}

export default App
export {appContext}