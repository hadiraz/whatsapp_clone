import { Button, IconButton } from '@material-ui/core'
import React, { createContext, useContext, useEffect, useState } from 'react'
import {AiOutlineMore, AiOutlineSearch , AiOutlineMenuUnfold} from "react-icons/ai"
import {IoIosAttach , IoMdSend , IoStopCircle} from "react-icons/io";
import {GrEmoji} from "react-icons/gr";
import {BsMic,BsKeyboard  ,BsFillRecordCircleFill , BsStopCircle} from "react-icons/bs";
import { useParams } from 'react-router';
import { query , getDocs , updateDoc , collection , onSnapshot , doc , addDoc , setDoc , serverTimestamp , orderBy} from "firebase/firestore";
import db from "../../server/fireBase"
import {Storage} from "../../server/fireBase"
import { useGlobalContext } from '../../useGlobalContext';
import { appContext } from '../App';
import { getDownloadURL, ref, uploadBytes, uploadBytesResumable, uploadString } from '@firebase/storage';

const chatContext = createContext();

function ChatSideHeader(){
    const {roomId} = useParams();
    const [roomName , setRoomName] = useState();
    const [state , dispatch] = useGlobalContext();
    const {roomMessages , lastMessage} = useContext(chatContext);
    const {showSide , setShowSide} = useContext(appContext)

    let date = new Date(lastMessage.messageData.timestamp?.toDate()).toString();
    if(lastMessage.messageData.timestamp){
        date = `last activity : ${date.split("GMT")[0]}`
    }else{
        date = "no activity"
    }

    useEffect(()=>{
        onSnapshot(doc(db , `rooms/${String(roomId)}` ),(snapshot)=>{
            const roomData = snapshot.data();
            setRoomName(roomData.name)
        })
    },[roomId])

   useEffect(()=>{
       
   },[showSide])

    return(
        <div className="app__chatside-header-container d-flex w-100 align-items-center p-2">
            <div className="app__chatside-header-leftside d-flex h-100 w-50 align-items-center">
                <IconButton className="mx-1 humber-menu" onClick={()=>setShowSide(true)}>
                    <AiOutlineMenuUnfold className="humber-menu" />
                </IconButton>
                <div className="app__chatside-header-leftside-left d-flex">
                    <img className="app__profile-icon" src={`https://avatars.dicebear.com/api/human/${roomId}.svg`} alt=""/>
                </div>
                <div className="app__chatside-header-leftside-center d-flex flex-column h-100 justify-content-center">
                    <p className="app__sidebar-header-leftside-center-name m-0 text-capitalize">
                        {roomName}
                    </p>
                    <p className="app__sidebar-header-leftside-center-lastseen m-0 text-capitalize">
                        {
                            `${date}`
                        }
                    </p>
                </div>
            </div>
            <div className="app__chatside-header-rightside d-flex w-50  align-items-center justify-content-end">

                <IconButton className="app__header-search-icon">
                    <AiOutlineSearch className="app__header-icons"/>
                </IconButton>

                <IconButton>
                    <IoIosAttach className="app__header-icons"/>
                </IconButton>

                <IconButton>
                    <AiOutlineMore className="app__header-icons"/>
                </IconButton>

            </div>
        </div>
    )
}

function ChatSideBody(){
    const [state , dispatch] = useGlobalContext();
    const {roomMessages , lastMessage} = useContext(chatContext)

    useEffect(()=>{
        
    },[lastMessage])

    return(
        <div className="chat__body-container d-flex flex-column p-3 ">
        {
            roomMessages.map(({id, data},key)=>{
                const {sender_name, text, timestamp , sender_id} = data;
                let date = new Date(timestamp?.toDate()).toString();
                date = date.split("GMT")[0]

                if(key === roomMessages.length - 1){

                }
                
                if(!data.media){
                    return ( 
                        <span key={id} id={id}  className={`chat__message-container chat__message-${sender_id === state.id ? "sender" : "receiver"} d-flex flex-column p-2 my-3`}>
                            <a className="chat__message-sender-name m-0 mb-1" href="./">
                                {sender_name.substr(0,30)}
                            </a>
                            <p className="chat__message-text m-0">
                                {text}
                            </p>
                            <p className="chat__message-time m-0 mt-2"> 
                                {
                                    date
                                }
                            </p>
                        </span>
    
                     )
                }else if(data.mediaType === "audio"){
                    return ( 
                        <span key={id} id={id}  className={`chat__message-container chat__message-${sender_id === state.id ? "sender" : "receiver"} d-flex flex-column p-2 my-3`}>
                            <a className="chat__message-sender-name m-0 mb-1" href="./">
                                {sender_name.substr(0,30)}
                            </a>
                            <audio controls src={data.mediaUrl} className="audio-player">

                            </audio>
                            <p className="chat__message-time m-0 mt-2"> 
                                {
                                    date
                                }
                            </p>
                        </span>
    
                     )
                }
            })
            
        }
        </div>
    )
}


function ChatSideFooter(){
    const [input , setInput] = useState("");
    const {roomId} = useParams();
    const [{displayName , id} , dispatch] = useGlobalContext()
    const {reloadChatSideValue , setReloadChatSideFunc} = useContext(appContext)
    const [micRecord , setMicRecord] = useState(false);
    const [recordObj , setRecordObj] = useState(null)
    const [audioChunk , setAudioChunk] = useState([])
    const [fileURL , setFileURL] = useState("")
    const [fileType , setFileType] = useState("")

    const formSubmit = async (e) => {
        e.preventDefault();
        if(!micRecord){
            addDoc(collection(db , `rooms/${roomId}/messages`),{
                sender_name : displayName ,
                timestamp : serverTimestamp() ,
                text : input ,
                sender_id : id ,
            })
            setInput("")
        }else{
            const messageId = await addDoc(collection(db , `rooms/${roomId}/messages`),{
                sender_name : displayName ,
                timestamp : serverTimestamp() ,
                sender_id : id ,
                media : ""
            })
            updateDoc(doc(db , `rooms/${roomId}/messages/${messageId.id}`), {
                "media" : messageId.id ,
                "mediaType" : "audio"
            })
            addFileStorage(messageId.id,roomId,"audio/ogg")
        }
        setReloadChatSideFunc(true)
    }

    const addFileStorage = async (fileId , room , type="") => {
        const typeDestructure = type.split("/");
        const fileRef = ref(Storage , `${room}/${fileId}.${typeDestructure[0]}`);
        const metadata = {
            contentType : type
        }
        if(fileURL !== ""){
            const blob = new Blob(audioChunk)
            const upload = uploadBytesResumable(fileRef , blob , metadata);
            upload.on("state_changed" , 
            snapshot =>
            {
            },(error)=>{
            },()=>{
                getDownloadURL(upload.snapshot.ref).then((downloadURL) => {
                    updateDoc(doc(db , `rooms/${room}/messages/${fileId}`), {
                        "mediaUrl" : downloadURL
                    })
                  })
                  setFileType("")
                  setAudioChunk([])
                  setFileURL("")
            })
        }

    }
    
    const changeInput = (e) => {
        const value = e.target.value;
        setInput(value)
    }

    const startRecordVoice = (e) => {
        const playerTag = document.getElementById("voice-play-back");
        navigator.mediaDevices.getUserMedia({audio : true , video: false})
        .then((stream) => {
            const mediaObj = new MediaRecorder(stream)
            setRecordObj(mediaObj);
            mediaObj.start();

            let chunks = [] ;
            mediaObj.addEventListener("dataavailable" , async(e)=>{
                await chunks.push(e.data)
                
            });

            setAudioChunk(chunks)

            mediaObj.addEventListener("stop" , (e)=>{
                const blobs = new Blob(chunks);
                const url = URL.createObjectURL(blobs);
                setFileURL(String(url))
                playerTag.src = `${url}`
                playerTag.play()
            });
        })
    }

    useEffect(()=>{
    },[audioChunk])

    const stopRecordVoice = (e) => {
        
        if( recordObj != null && recordObj.state !=="inactive"){
            recordObj.stop()
        }
    }


    useEffect(()=>{
        const typeBox = document.querySelector(".chat__input-text");
        const micBox = document.querySelector(".chat__mic-control-box");
        const micIcon = document.querySelector(".mic-icon");
        const typeIcon = document.querySelector(".keyboard-icon");
        if(micRecord){
            typeBox.style.transform = `translateY(-100%)`
            micBox.style.transform = `translateY(0%)`
            micIcon.style.transform = `rotateY(90deg)`
            typeIcon.style.transform = `rotateY(180deg)`
        }else{
            typeBox.style.transform = `translateY(0%)`
            micBox.style.transform = `translateY(100%)`
            micIcon.style.transform = `rotateY(0deg)`
            typeIcon.style.transform = `rotateY(90deg)`
        }
    },[micRecord])

    return(
        <div className="chat__footer-container d-flex w-100 py-1 px-2">
            <div className="chat__footer-left d-flex justify-content-center align-items-center h-100">
                <GrEmoji className="app__header-icons" />
            </div>
            <div className="chat__footer-center overflow-hidden d-flex justify-content-center align-items-center">
                <form className="chat__footer-sendMessageForm d-flex h-100 m-0 p-0 w-100 position-relative" onSubmit={(e)=>formSubmit(e)}> 
                    <div className="chat__footer-input-container d-flex justify-content-between position-relative">
                        <textarea className=" chat__input-text mx-2 " value={input} placeholder="type your message" onChange={(e)=>changeInput(e)}>
                        </textarea> 

                        <div className="chat__mic-control-box d-flex h-100 p-1 mx-2 justify-content-center align-items-center">

                            <div className="chat__mic-control-box-left d-flex h-100 w-25 justify-content-center">

                                    <BsFillRecordCircleFill className="record-btn-red" onClick={(e)=>startRecordVoice(e)}/>

                                    <BsStopCircle className="blue-stop-btn" onClick={(e)=>stopRecordVoice(e)}/>
                                    
                            </div>

                            <div className="chat__mic-control-box-right d-flex h-100 w-50">
                            <audio controls className="audio-player" id="voice-play-back"></audio>
                            
                            </div>

                        </div>

                         <button className="chat__send-button d-flex align-items-center justify-content-center" type="submit">
                            <IoMdSend className="chat__send-icon"/>
                        </button>
                    </div>
                        
                </form>
            </div>
            <div className="chat__footer-right d-flex h-100 align-items-center justify-content-center mx-1 position-relative">
                <BsMic className="mic-icon position-absolute" onClick={()=>setMicRecord(true)}/>
                <BsKeyboard className="keyboard-icon position-absolute" onClick={()=>setMicRecord(false)} />
            </div>
        </div>
    )
}


function ChatSide() {
    let {roomId} = useParams();
    const [roomMessages , setRoomMessages] = useState([]);
    const [lastMessage , setLastMessage] = useState({messageData : "" , messageId : ""});

    const {showSide , setShowSide} = useContext(appContext)

    useEffect(()=>{
        const tag = document.querySelector(".app__chatside-container")
        if(!showSide){
            tag.classList.add("activeChats")
        }else{
            tag.classList.remove("activeChats")
        }
    },[showSide])

    useEffect(()=>{

        setLastMessage({messageData : "" , messageId : ""})

        const getData = () => {

            const querySet = query(collection(db , `rooms/${roomId}/messages`) , orderBy("timestamp" , "asc"));
            const shotData = onSnapshot(querySet , (snap)=>{
                const dataArr = snap.docs.map((value, index)=>{

                    if(index === (snap.docs.length - 1)){
                        updateDoc(doc(db ,`rooms/${roomId}`),{
                            "lastMessage.messageId" : value.id ,
                            "lastMessage.messageData" : value.data()
                        })

                        setLastMessage({
                            ...lastMessage ,
                            messageId : value.id ,
                            messageData : value.data(), 
                        })
                    }
                    return ({
                        id:value.id ,
                        data:value.data()
                    })
                });
                setRoomMessages(dataArr)
            });
                
            }
            getData()
    },[roomId])

    return (
        <section className="app__chatside-container d-flex flex-column justify-content-between">
            <chatContext.Provider value={
                {
                    roomMessages : roomMessages ,
                    roomId : roomId ,
                    lastMessage : lastMessage
                }
                }>
                <ChatSideHeader/>
                    <ChatSideBody/>
                <ChatSideFooter/>
            </chatContext.Provider>
        </section>
    )
}

export default ChatSide
