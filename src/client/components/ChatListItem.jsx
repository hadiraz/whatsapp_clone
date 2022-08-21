import React, { useContext, useEffect, useState } from 'react'
import {AiFillAudio , AiFillFileImage} from "react-icons/ai";
import {appContext} from "../App"
function ChatListItem({roomId,roomData}) {
    const {roomName , roomLastMessage} = roomData ;
    const {sender_name} = roomLastMessage.messageData;
    const [showingSenderName , setShowingSenderName] = useState("")
    const [showingText , setShowingText] = useState("")
    const {showSide , setShowSide} = useContext(appContext)
    
    useEffect(()=>{
            if(sender_name.split("").length > 15){
                setShowingSenderName(`${sender_name.substr(0,15)} ...`);
            }else{
                setShowingSenderName(sender_name.substr(0,15));
            }
            if(roomLastMessage.messageData.text && roomLastMessage.messageData.text.split("").length > 20){
                setShowingText(`${roomLastMessage.messageData.text.substr(0,12)} ...`)
            }
    },[sender_name])

    return (
                <div className="app__sidebar-chatlist-item d-flex w-100 align-items-center py-2">
                    <div className="app__sidebar-chatlist-item-left d-flex h-100 justify-content-center align-items-center">
                        <img className="app__profile-icon" src={`https://avatars.dicebear.com/api/human/${roomId}.svg`} alt={roomName}/>
                    </div>
                    <div className="app__sidebar-chatlist-item-center d-flex flex-column h-100 justify-content-center">
                        <p className="app__sidebar-chatlist-item-name m-0 mb-1">
                            {roomName}
                        </p>
                        <p className="app__sidebar-chatlist-item-summary m-0 position-relative">
                            {
                                roomLastMessage.messageId ? `${showingSenderName} : ` : ""
                            }
                            {
                                roomLastMessage.messageData.text ? `${showingText} ` : ""
                            }
                            {
                                roomLastMessage.messageData.media && roomLastMessage.messageData.mediaType === "audio" ? <><AiFillAudio className="summary-icon"/>Audio</> : ""
                            }
                            {
                                roomLastMessage.messageData.media && roomLastMessage.messageData.mediaType === "image" ? <><AiFillFileImage className="summary-icon"/>Image</> : ""
                            }
                        </p>
                    </div>
                    <div className="app__sidebar-chatlist-item-right d-flex flex-column h-100 justify-content-center align-items-end">
                        <p className="app__sidebar-chatlist-item-right-time">
                            11:33 pm
                        </p>
                        {/* <p className="app__sidebar-chatlist-item-right-counter m-0">1</p> */}
                    </div>
                </div>

    )
}

export default ChatListItem
