import React, { useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router";
import { logoutUser } from "../slice/authSlice";

function Navbar({ sidebarOpen, setSidebarOpen }) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [uploadMenuOpen, setUploadMenuOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userMenuRef = useRef(null);
  const uploadMenuRef = useRef(null);

  const { user } = useSelector((state) => state.auth);

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


  // Close menus when clicking outside
  React.useEffect(() => {
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

  return (
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
              <div className="w-10 h-10 bg-linear-to-br from-purple-500 to-red-500 rounded-full flex items-center justify-center text-white font-semibold shadow-md overflow-hidden">
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
                    <div className="w-10 h-10 bg-linear-to-br from-purple-500 to-red-500 rounded-full flex items-center justify-center text-white font-semibold overflow-hidden">
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
  );
}

export default Navbar;