import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import axiosClient from "../utils/axiosClient";
import Navbar from "./Navbar";

function Home() {
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState("home");
  const navigate = useNavigate();
  const [subscribedChannel, setSubscribedChannel] = useState([]);


  const sidebarItems = [
    { icon: "🏠", label: "Home", section: "home" },
    { icon: "⏰", label: "Watch History", section: "history" },
    { icon: "👍", label: "Liked Videos", section: "liked" },
  ];

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

  const handleSectionClick = (section) => {
    setActiveSection(section);
    filterVideosBySection(section);
  };

  const filterVideosBySection = async (section) => {
    switch (section) {
      case "trending":
        setFilteredVideos(videos.filter((video) => video.views > 1000));
        break;
      case "history": {
        const response = await axiosClient.get("/user/watchHistory");
        setFilteredVideos(response.data.data);
        break;
      }
      case "liked": {
        const response = await axiosClient.get("/like/all");
        setFilteredVideos(response.data.data);
        break;
      }
      case "watch-later":
        // Mock watch later - replace with actual API call
        setFilteredVideos(videos.slice(1, 5));
        break;
      case "music":
        setFilteredVideos(
          videos.filter(
            (video) =>
              video.title.toLowerCase().includes("music") ||
              video.description.toLowerCase().includes("music")
          )
        );
        break;
      case "gaming":
        setFilteredVideos(
          videos.filter(
            (video) =>
              video.title.toLowerCase().includes("game") ||
              video.description.toLowerCase().includes("game")
          )
        );
        break;
      case "sports":
        setFilteredVideos(
          videos.filter(
            (video) =>
              video.title.toLowerCase().includes("sport") ||
              video.description.toLowerCase().includes("sport")
          )
        );
        break;
      default:
        setFilteredVideos(videos);
    }
  };

  const getSectionTitle = () => {
    const section = sidebarItems.find((item) => item.section === activeSection);
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

  const fetchedSubscribedChannel = async () => {
    try {
      const response = await axiosClient.get(
        "/subscription/subscribedChannels"
      );
      setSubscribedChannel(response?.data?.data);
    } catch (error) {
      console.error("Error fetching channel" + error);
    }
  };

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
    fetchedSubscribedChannel();
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 to-black flex">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 bg-gray-800/80 backdrop-blur-lg transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0 w-64" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
            <Link to="/" className="flex items-center space-x-3 cursor-pointer">
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
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
              {subscribedChannel &&
                subscribedChannel.map((channel) => (
                  <button
                    key={channel.channel._id}
                    onClick={() => navigate("/channel/" + channel.channel._id)}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700/70 hover:text-white transition-all duration-200 w-full text-left cursor-pointer"
                  >
                    <img
                      src={channel.channel.avatar}
                      alt={channel.channel.fullName}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="font-medium text-sm">
                      {channel.channel.fullName}
                    </span>
                  </button>
                ))}
            </div>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        {/* Navbar */}
        <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Main Content Area */}
        <main className="p-6">
          {/* Dynamic Section Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              {getSectionTitle()}
            </h1>
            <p className="text-gray-400 text-lg">{getSectionDescription()}</p>
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
                      <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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
                  <svg
                    className="w-10 h-10 text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  No videos found
                </h3>
                <p className="text-gray-400 max-w-md mx-auto">
                  {activeSection === "home"
                    ? "It looks like there are no videos to display right now. Check back later for new content!"
                    : `No videos found in ${getSectionTitle().toLowerCase()}. Try a different section.`}
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
