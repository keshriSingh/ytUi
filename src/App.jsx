import React, { useEffect } from "react"
import { Route, Routes, Navigate } from "react-router"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import { useDispatch, useSelector } from 'react-redux'
import { checkAuth } from "./slice/authSlice"
import VideoPage from "./pages/VideoPage"
import Channel from "./pages/Channel"
import UploadVideo from "./pages/UploadVideo"
import EditChannel from "./pages/EditChannel"

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state)=>state.auth)

  useEffect(()=>{
    dispatch(checkAuth())
  },[])
  return (
    <Routes>
      <Route path="/" element={isAuthenticated?<Home/>:<Navigate to={'/login'}/>}/>
      <Route path="/login" element={isAuthenticated?<Navigate to={'/'}/>:<Login/>}/>
      <Route path="/signup" element={isAuthenticated?<Navigate to={'/'}/>:<Signup/>}/>
      <Route path="/watch/:videoId" element={isAuthenticated?<VideoPage/>:''}/>
      <Route path="/channel/:channelId" element={isAuthenticated?<Channel/>:''}/>
      <Route path="/upload" element={isAuthenticated?<UploadVideo/>:''} />
      <Route path="/edit/channel" element={isAuthenticated?<EditChannel/>:''} />
    </Routes>
  )
}

export default App