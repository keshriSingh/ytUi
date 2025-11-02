import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router";
import axiosClient from "../utils/axiosClient";
import { logoutUser } from "../slice/authSlice";

function Home() {
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [uploadMenuOpen, setUploadMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState("home");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userMenuRef = useRef(null);
  const uploadMenuRef = useRef(null);
  const [subscribedChannel,setSubscribedChannel] = useState([])

  const { user } = useSelector((state) => state.auth);

  const sidebarItems = [
    { icon: "🏠", label: "Home", section: "home" },
    { icon: "🔥", label: "Trending", section: "trending" },
    { icon: "⏰", label: "Watch History", section: "history" },
    { icon: "👍", label: "Liked Videos", section: "liked" },
    { icon: "⏱️", label: "Watch Later", section: "watch-later" },
    { icon: "📚", label: "Library", section: "library" },
    { icon: "🎵", label: "Music", section: "music" },
    { icon: "🎮", label: "Gaming", section: "gaming" },
    { icon: "🏆", label: "Sports", section: "sports" },
  ];

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
      if (uploadMenuRef.current && !uploadMenuRef.current.contains(event.target)) {
        setUploadMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function formatTimeAgo(createdAt) {
    const createdDate = new Date(createdAt);
    const currentDate = new Date();
    const timeDifference = currentDate - createdDate;

    const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  }

  function secondsToMinutes(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  const handleUploadVideo = () => {
    navigate('/upload');
    setUploadMenuOpen(false);
  };

  const handleGoLive = () => {
    navigate('/go-live');
    setUploadMenuOpen(false);
  };

  const handleCreatePost = () => {
    navigate('/create-post');
    setUploadMenuOpen(false);
  };

  const handleSectionClick = (section) => {
    setActiveSection(section);
    filterVideosBySection(section);
  };

  const filterVideosBySection = async(section) => {
    switch (section) {
      case "trending":
        setFilteredVideos(videos.filter(video => video.views > 1000));
        break;
      case "history":{
        const response = await axiosClient.get('/user/watchHistory');
        setFilteredVideos(response.data.data)
        break;
      }
      case "liked":{
        const response = await axiosClient.get('/like/all');
        setFilteredVideos(response.data.data)
        break;
      }
      case "watch-later":
        // Mock watch later - replace with actual API call
        setFilteredVideos(videos.slice(1, 5));
        break;
      case "music":
        setFilteredVideos(videos.filter(video => 
          video.title.toLowerCase().includes('music') || 
          video.description.toLowerCase().includes('music')
        ));
        break;
      case "gaming":
        setFilteredVideos(videos.filter(video => 
          video.title.toLowerCase().includes('game') || 
          video.description.toLowerCase().includes('game')
        ));
        break;
      case "sports":
        setFilteredVideos(videos.filter(video => 
          video.title.toLowerCase().includes('sport') || 
          video.description.toLowerCase().includes('sport')
        ));
        break;
      default:
        setFilteredVideos(videos);
    }
  };

  const getSectionTitle = () => {
    const section = sidebarItems.find(item => item.section === activeSection);
    return section ? section.label : "Recommended Videos";
  };

  const getSectionDescription = () => {
    switch (activeSection) {
      case "home":
        return "Discover amazing videos from creators worldwide";
      case "trending":
        return "The most popular videos right now";
      case "history":
        return "Continue watching from where you left off";
      case "liked":
        return "Videos you've liked and enjoyed";
      case "watch-later":
        return "Videos you've saved to watch later";
      case "music":
        return "The best music videos and tracks";
      case "gaming":
        return "Top gaming content and streams";
      case "sports":
        return "Latest sports highlights and events";
      default:
        return "Explore amazing content";
    }
  };

  const fetchedSubscribedChannel = async()=>{
    try {
      const response = await axiosClient.get('/subscription/subscribedChannels');
      setSubscribedChannel(response?.data?.data)
    } catch (error) {
      console.error("Error fetching channel"+error)
    }
  }

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        const responses = await axiosClient.get("/video/all");
        const videosData = responses?.data?.data || [];
        setVideos(videosData);
        setFilteredVideos(videosData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching videos:", error);
        setLoading(false);
      }
    };

    fetchVideos();
    fetchedSubscribedChannel()
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 bg-gray-800/80 backdrop-blur-lg transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? "translate-x-0 w-64" : "-translate-x-full"
      }`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
            <Link to="/" className="flex items-center space-x-3 cursor-pointer">
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                </svg>
              </div>
              <span className="text-xl font-bold text-white">StreamHub</span>
            </Link>
          </div>

          {/* Sidebar Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <div className="space-y-1 px-3">
              {sidebarItems.map((item) => (
                <button
                  key={item.section}
                  onClick={() => handleSectionClick(item.section)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 w-full text-left cursor-pointer ${
                    activeSection === item.section
                      ? "bg-red-600 text-white"
                      : "text-gray-300 hover:bg-gray-700/70 hover:text-white"
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </div>

            {/* Subscriptions Section */}
            <div className="border-t border-gray-700/50 my-4"></div>
            <div className="px-6 py-2">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Subscriptions
              </h3>
            </div>
            <div className="space-y-1 px-3">
              {subscribedChannel && subscribedChannel.map((channel) => (
                <button
                  key={channel.channel._id}
                  onClick={() => navigate('/channel/'+channel.channel._id)}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700/70 hover:text-white transition-all duration-200 w-full text-left cursor-pointer"
                >
                  <img
                    src={channel.channel.avatar}
                    alt={channel.channel.fullName}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="font-medium text-sm">{channel.channel.fullName}</span>
                </button>
              ))}
            </div>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-0"}`}>
        {/* Header */}
        <header className="bg-gray-800/80 backdrop-blur-lg border-b border-gray-700/50 sticky top-0 z-40 shadow-sm">
          <div className="flex items-center justify-between p-4">
            {/* Left Section */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-700/70 rounded-full transition-colors cursor-pointer"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <Link to="/" className="flex items-center space-x-3 group cursor-pointer">
                <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                  </svg>
                </div>
                <span className="text-2xl font-bold text-white hidden md:block">
                  StreamHub
                </span>
              </Link>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search videos..."
                  className="w-full bg-gray-700/70 border border-gray-600 rounded-full py-3 px-5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 hover:border-gray-500"
                />
                <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-red-600 hover:bg-red-700 rounded-full p-3 transition-all shadow-md cursor-pointer">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              {/* Upload Button with Dropdown */}
              <div className="relative" ref={uploadMenuRef}>
                <button 
                  onClick={() => setUploadMenuOpen(!uploadMenuOpen)}
                  className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-full transition-all shadow-md hover:shadow-lg hover:scale-105 group relative cursor-pointer"
                  title="Create Content"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Create
                  </span>
                </button>

                {/* Upload Dropdown Menu */}
                {uploadMenuOpen && (
                  <div className="absolute right-0 top-14 w-48 bg-gray-800/80 backdrop-blur-lg border border-gray-700/50 rounded-xl shadow-xl py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-700/50">
                      <p className="text-white font-semibold text-sm">Create Content</p>
                    </div>

                    <div className="py-2">
                      <button
                        onClick={handleUploadVideo}
                        className="flex items-center space-x-3 px-4 py-2.5 text-gray-300 hover:bg-red-600 hover:text-white transition-all w-full text-left cursor-pointer group"
                      >
                        <svg className="w-4 h-4 text-gray-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <div>
                          <span className="font-medium block">Upload Video</span>
                          <span className="text-gray-500 text-xs group-hover:text-gray-300">Share your video</span>
                        </div>
                      </button>

                      <button
                        onClick={handleGoLive}
                        className="flex items-center space-x-3 px-4 py-2.5 text-gray-300 hover:bg-red-600 hover:text-white transition-all w-full text-left cursor-pointer group"
                      >
                        <svg className="w-4 h-4 text-gray-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                        </svg>
                        <div>
                          <span className="font-medium block">Go Live</span>
                          <span className="text-gray-500 text-xs group-hover:text-gray-300">Start streaming</span>
                        </div>
                      </button>

                      <button
                        onClick={handleCreatePost}
                        className="flex items-center space-x-3 px-4 py-2.5 text-gray-300 hover:bg-red-600 hover:text-white transition-all w-full text-left cursor-pointer group"
                      >
                        <svg className="w-4 h-4 text-gray-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <div>
                          <span className="font-medium block">Create Post</span>
                          <span className="text-gray-500 text-xs group-hover:text-gray-300">Share your thoughts</span>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* User Avatar with Dropdown */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-700/70 transition-all border-2 border-transparent hover:border-gray-600 cursor-pointer"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-red-500 rounded-full flex items-center justify-center text-white font-semibold shadow-md overflow-hidden">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt="User Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-sm">{user?.fullName?.charAt(0)?.toUpperCase() || "U"}</span>
                    )}
                  </div>
                </button>

                {/* User Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 top-14 w-56 bg-gray-800/80 backdrop-blur-lg border border-gray-700/50 rounded-xl shadow-xl py-2 z-50">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-700/50">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-red-500 rounded-full flex items-center justify-center text-white font-semibold overflow-hidden">
                          {user?.avatar ? (
                            <img
                              src={user.avatar}
                              alt="User Avatar"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-sm">{user?.fullName?.charAt(0)?.toUpperCase() || "U"}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold truncate text-sm">
                            {user?.fullName || "User"}
                          </p>
                          <p className="text-gray-400 text-xs truncate">
                            {user?.email || ""}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <Link
                        to={'/channel/'+user._id}
                        className="flex items-center space-x-3 px-4 py-2.5 text-gray-300 hover:bg-red-600 hover:text-white transition-all cursor-pointer group"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <svg className="w-4 h-4 text-gray-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="font-medium">Your Channel</span>
                      </Link>

                      <Link
                        to="/your-videos"
                        className="flex items-center space-x-3 px-4 py-2.5 text-gray-300 hover:bg-red-600 hover:text-white transition-all cursor-pointer group"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <svg className="w-4 h-4 text-gray-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span className="font-medium">Your Videos</span>
                      </Link>

                      <Link
                        to="/settings"
                        className="flex items-center space-x-3 px-4 py-2.5 text-gray-300 hover:bg-red-600 hover:text-white transition-all cursor-pointer group"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <svg className="w-4 h-4 text-gray-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="font-medium">Settings</span>
                      </Link>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-700/50 my-1"></div>

                    {/* Logout */}
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 px-4 py-2.5 text-red-400 hover:bg-red-600 hover:text-white transition-all w-full cursor-pointer group"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-6">
          {/* Dynamic Section Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              {getSectionTitle()}
            </h1>
            <p className="text-gray-400 text-lg">
              {getSectionDescription()}
            </p>
          </div>

          {/* Videos Grid - Only this section changes */}
          <section>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="bg-gray-700/70 rounded-lg aspect-video mb-4"></div>
                    <div className="flex space-x-3">
                      <div className="w-10 h-10 bg-gray-700/70 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-700/70 rounded mb-2"></div>
                        <div className="h-3 bg-gray-700/70 rounded w-3/4"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredVideos.map((video) => (
                  <Link
                    key={video._id}
                    to={`/watch/${video._id}`}
                    className="group cursor-pointer transform hover:scale-105 transition-all duration-300"
                  >
                    <div className="relative rounded-lg overflow-hidden mb-4 shadow-lg group-hover:shadow-xl transition-shadow">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full aspect-video object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute bottom-2 right-2 bg-black/90 text-white text-xs px-2 py-1 rounded font-medium">
                        {secondsToMinutes(video.duration)}
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>

                    <div className="flex space-x-3">
                      <img
                        src={video.owner.avatar}
                        alt={video.owner.fullName}
                        className="w-10 h-10 rounded-full flex-shrink-0 shadow-md"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white line-clamp-2 group-hover:text-red-400 transition-colors mb-1 leading-tight">
                          {video.title}
                        </h3>
                        <p className="text-gray-300 text-sm mb-1 font-medium">
                          {video.owner.fullName}
                        </p>
                        <p className="text-gray-400 text-xs">
                          {video.views} views • {formatTimeAgo(video.createdAt)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && filteredVideos.length === 0 && (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No videos found</h3>
                <p className="text-gray-400 max-w-md mx-auto">
                  {activeSection === "home" 
                    ? "It looks like there are no videos to display right now. Check back later for new content!"
                    : `No videos found in ${getSectionTitle().toLowerCase()}. Try a different section.`
                  }
                </p>
              </div>
            )}
          </section>
        </main>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden cursor-pointer"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}

export default Home;