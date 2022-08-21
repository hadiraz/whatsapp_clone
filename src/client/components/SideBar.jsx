import React, { useContext, useEffect, useState } from 'react'
import {FiSettings , FiMoreVertical , FiSearch} from "react-icons/fi";
import {BsChatLeftTextFill , BsChat} from "react-icons/bs";
import {AiOutlineMenuFold} from "react-icons/ai";
import {IoPersonCircleOutline} from "react-icons/io5";
import { IconButton } from '@material-ui/core';
import {ChatListItem} from "./index"
import { getDoc , getDocs , collection , onSnapshot , doc , query , where } from "firebase/firestore";
import {onValue , ref} from "firebase/database"
import db from "../../server/fireBase";
import {dbDatabase} from "../../server/fireBase"
import {Link , useParams} from "react-router-dom";
import {useGlobalContext} from "../../useGlobalContext"
import {appContext} from "../App";

function SideBarHeader(){
    const [{user , image , email , displayName , id} , dispatch] = useGlobalContext();
    const { showSide , setShowSide} = useContext(appContext)
    return(
        <div className="app__sidebar-header-container d-flex w-100 justify-content-between align-items-center">
            <div className="app__sidebar-header-left">
                <img src={image ? `${image}` : IoPersonCircleOutline} alt=""/>
            </div>
            <div className="app__sidebar-header-right d-flex">
                <IconButton>
                    <FiSettings className="app__header-icons" />
                </IconButton>
                <IconButton>
                    <BsChatLeftTextFill className="app__header-icons" />
                </IconButton>
                <IconButton>
                    <FiMoreVertical className="app__header-icons" />
                </IconButton>
                <IconButton onClick={()=>setShowSide(false)}className="humber-menu">
                    <AiOutlineMenuFold className="humber-menu" />
                </IconButton>
            </div>
        </div>
    )
}

function SearchChats(){
    const [searchInput , setSearchInput] = useState("")
    const changeInputValue = () => {
        
    }
    return(
        <div className="app__sidebar-searchbox-container d-flex justify-content-center align-items-center w-100 px-3 py-2 ">
            <span className="app__sidebar-searchbox-inputbox d-flex w-100 h-100 px-4 py-1 position-relative">
                <FiSearch className="app__searchbox-icon" />
                <input className="app__input app__searchbox-input" type="text" onChange={e=>setSearchInput(e.target.value)} value={searchInput} placeholder="search..."/>
            </span>
        </div>
    )
}

function SideBar({addRoomModule}) {
    const [{user , image , email , displayName , id} , dispatch] = useGlobalContext();
    const {addRoom , setAddRoom} = addRoomModule ;
    const [rooms , setRooms] = useState([]);
    const [roomsDB , setRoomsDB] = useState([]);
    const {reloadChatSideValue , showSide , setShowSide , setReloadChatSideFunc} = useContext(appContext)
    
    const checkUserRooms = () => {
        const getUserRooms = onSnapshot(doc(db ,`users/${id}`),(snapshot)=>{
            const userRooms =  snapshot.data().user_rooms;
            setRoomsDB([...userRooms]) 
        })
        
    }

    const roomsData = async () =>{
            const q = query(collection(db , "rooms"));
            let roomsArr = [];
            const getRoomsData =await getDocs(q)
            
             getRoomsData.docs.forEach((value,index)=>{
                    // if(roomsDB.indexOf(value.id) !== -1){
                       roomsArr.push({
                            roomId : value.data().id ,
                        roomData : {
                            roomName : value.data().name ,
                            roomLastMessage : value.data().lastMessage
                        }
                       })

                })
                setRooms(roomsArr)
                setReloadChatSideFunc(false)
    }


    useEffect(()=>{
        checkUserRooms();
    },[])

    useEffect(()=>{
        roomsData();
    },[roomsDB])

    useEffect(()=>{
        if(reloadChatSideValue){
            roomsData();
        }
    },[reloadChatSideValue])

    useEffect(()=>{
        const tag = document.querySelector(".app__sidebar-container")
        if(!showSide){
            tag.classList.add("deActiveSide")
        }else{
            tag.classList.remove("deActiveSide")
        }
    },[showSide])

    return (
        
        <section className="app__sidebar-container d-flex flex-column align-items-center position-relative">
            <SideBarHeader/>
            <SearchChats/>
            <section className="app__sidebar-chatlist-container d-flex flex-column w-100">
                {
                    rooms.map(({roomId,roomData},index)=>{
                        const {roomLastMessage} = roomData
                        return (
                            <Link key={roomId} to={`/rooms/${roomId}`}>
                                <ChatListItem key={index} roomId={roomId} roomData={roomData}/>
                            </Link>
                            )
                    })
                }
                <button className="app__sidebar-addChat d-flex justify-content-center align-items-center p-3" onClick={()=>setAddRoom(!addRoom)}>
                    <BsChat/>
                </button>
            </section>
        </section>
    )
}


export default SideBar
