import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { useSelector } from "react-redux";
import axiosClient from "../utils/axiosClient";
import Navbar from "./Navbar";

function ChannelPage() {
  const { channelId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("videos");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [totalSubscribers, setTotalSubscribers] = useState(0);
  const [sortBy, setSortBy] = useState("latest");

  // Tweet states
  const [tweets, setTweets] = useState([]);
  const [newTweet, setNewTweet] = useState("");
  const [isCreatingTweet, setIsCreatingTweet] = useState(false);
  const [editingTweet, setEditingTweet] = useState(null);
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    fetchChannelData();
  }, [channelId, sortBy]);

  const fetchChannelData = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get(`/user/getChannel/${channelId}`);
      setChannel(response.data.data);
      setVideos(response.data.data.videos);
      setIsSubscribed(response.data.data.isSubscribed || false);
      setTotalSubscribers(response.data.data.subscribersCount);

      // Fetch tweets for this channel
      await fetchTweets();
    } catch (err) {
      setError("Failed to load channel data");
      console.error("Failed to fetch channel:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTweets = async () => {
    try {
      const response = await axiosClient.get(`/tweet/user/${channelId}`);
      if (response.data.data) {
        // For each tweet, check if current user has liked it
        const tweetsWithLikes = await Promise.all(
          response.data.data.map(async (tweet) => {
            try {
              const likeResponse = await axiosClient.get(
                `/like/check/tweet/${tweet._id}`
              );
              return {
                ...tweet,
                isLiked: likeResponse.data.isLiked || false,
                likesCount: likeResponse.data.likesCount || 0,
              };
            } catch (error) {
              console.error("Error fetching like status:", error);
              return {
                ...tweet,
                isLiked: false,
                likesCount: 0,
              };
            }
          })
        );
        setTweets(tweetsWithLikes);
      }
    } catch (err) {
      console.error("Failed to fetch tweets:", err);
      setTweets([]);
    }
  };

  const handleSubscribe = async () => {
    try {
      await axiosClient.post("/subscription/" + channelId);
      setIsSubscribed((prev) => !prev);
      setTotalSubscribers((prev) => (isSubscribed ? prev - 1 : prev + 1));
    } catch (err) {
      console.error("Failed to subscribe:", err);
    }
  };

  // Tweet functions
  const handleCreateTweet = async () => {
    if (!newTweet.trim()) return;

    try {
      setIsCreatingTweet(true);
      await axiosClient.post("/tweet/create", { content: newTweet });
      setNewTweet("");
      await fetchTweets(); // Refresh tweets
    } catch (err) {
      console.error("Failed to create tweet:", err);
    } finally {
      setIsCreatingTweet(false);
    }
  };

  const handleLikeTweet = async (tweetId) => {
    try {
      await axiosClient.post(`/like/tweet/${tweetId}`);
      await fetchTweets(); // Refresh to update like status and count
    } catch (err) {
      console.error("Failed to like tweet:", err);
    }
  };

  const handleUpdateTweet = async (tweetId) => {
    if (!editContent.trim()) return;

    try {
      await axiosClient.patch(`/tweet/${tweetId}`, {
        content: editContent,
      });
      setEditingTweet(null);
      setEditContent("");
      await fetchTweets();
    } catch (err) {
      console.error("Failed to update tweet:", err);
    }
  };

  const handleDeleteTweet = async (tweetId) => {
    try {
      await axiosClient.delete(`/tweet/delete/${tweetId}`);
      await fetchTweets();
    } catch (err) {
      console.error("Failed to delete tweet:", err);
    }
  };

  const startEditing = (tweet) => {
    setEditingTweet(tweet._id);
    setEditContent(tweet.content);
  };

  const cancelEditing = () => {
    setEditingTweet(null);
    setEditContent("");
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInMs = now - new Date(date);
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-900 to-black">
        <Navbar showSidebarToggle={false} />

        {/* Channel Header Skeleton */}
        <div className="relative">
          <div className="h-48 bg-gray-800 animate-pulse"></div>
          <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-10">
            <div className="flex items-end space-x-6">
              <div className="w-32 h-32 bg-gray-700 rounded-full border-4 border-gray-900 animate-pulse"></div>
              <div className="flex-1 pb-6">
                <div className="w-64 h-8 bg-gray-700 rounded mb-4 animate-pulse"></div>
                <div className="w-48 h-4 bg-gray-700 rounded mb-2 animate-pulse"></div>
                <div className="w-32 h-4 bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="max-w-7xl mx-auto p-6">
          <div className="w-64 h-8 bg-gray-700 rounded mb-6 animate-pulse"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-700 rounded-lg aspect-video mb-4"></div>
                <div className="flex space-x-3">
                  <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-700 rounded mb-2"></div>
                    <div className="h-3 bg-gray-700 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
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
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-white text-xl font-semibold mb-2">{error}</h2>
          <button
            onClick={() => navigate("/")}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors cursor-pointer"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 to-black">
      <Navbar showSidebarToggle={false} />

      {/* Channel Header */}
      <div className="relative">
        {/* Cover Image */}
        <div className="h-48 bg-linear-to-r from-purple-600 to-red-600">
          {channel?.coverImage ? (
            <img
              src={channel.coverImage}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-linear-to-r from-purple-600 to-red-600"></div>
          )}
        </div>

        {/* Channel Info - Adjusted positioning */}
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex items-start space-x-6 pt-10 pb-6">
            {/* Channel Avatar */}
            <div className="relative flex-shrink-0">
              <img
                src={channel?.avatar}
                alt={channel?.fullName}
                className="w-32 h-32 rounded-full border-4 border-gray-900 bg-gray-800 object-cover shadow-xl"
              />
              <div className="absolute -bottom-2 -right-2 bg-red-600 text-white p-1 rounded-full">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
            </div>

            {/* Channel Details - Adjusted layout */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <h1 className="text-3xl font-bold text-white">
                  {channel?.fullName}
                </h1>
                <div className="flex items-center space-x-4">
                  {user && user._id !== channel?._id && (
                    <button
                      onClick={handleSubscribe}
                      className={`px-6 py-2 rounded-full font-semibold transition-all cursor-pointer ${
                        isSubscribed
                          ? "bg-gray-600 text-white hover:bg-gray-700"
                          : "bg-red-600 hover:bg-red-700 text-white"
                      }`}
                    >
                      {isSubscribed ? "Subscribed" : "Subscribe"}
                    </button>
                  )}
                  {user && user._id === channel?._id && (
                    <Link
                      to={'/edit/channel'}
                      className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-full font-semibold transition-all cursor-pointer"
                    >
                      Customize Channel
                    </Link>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-gray-300 mb-3">
                <span className="font-semibold">@{channel?.username}</span>
                <span>{formatNumber(totalSubscribers)} subscribers</span>
                <span>{videos.length} videos</span>
              </div>

              {channel?.description && (
                <p className="text-gray-300 max-w-2xl leading-relaxed">
                  {channel.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Channel Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Navigation Tabs */}
        <div className="border-b border-gray-700/50 mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("videos")}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-all cursor-pointer ${
                activeTab === "videos"
                  ? "border-red-500 text-red-500"
                  : "border-transparent text-gray-400 hover:text-gray-300"
              }`}
            >
              Videos
            </button>
            <button
              onClick={() => setActiveTab("about")}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-all cursor-pointer ${
                activeTab === "about"
                  ? "border-red-500 text-red-500"
                  : "border-transparent text-gray-400 hover:text-gray-300"
              }`}
            >
              About
            </button>
            <button
              onClick={() => setActiveTab("community")}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-all cursor-pointer ${
                activeTab === "community"
                  ? "border-red-500 text-red-500"
                  : "border-transparent text-gray-400 hover:text-gray-300"
              }`}
            >
              Community
            </button>
          </nav>
        </div>

        {/* Sort Options */}
        {activeTab === "videos" && videos.length > 0 && (
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Uploads</h2>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
            >
              <option value="latest">Latest</option>
              <option value="popular">Most Popular</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === "videos" && (
          <div>
            {videos.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-12 h-12 text-gray-400"
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
                  No videos uploaded yet
                </h3>
                <p className="text-gray-400 max-w-md mx-auto">
                  This channel hasn't uploaded any videos. Check back later for
                  new content!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {videos.map((video) => (
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
                        {formatDuration(video.duration)}
                      </div>
                      <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>

                    <div className="flex space-x-3">
                      <img
                        src={channel.avatar}
                        alt={channel.fullName}
                        className="w-10 h-10 rounded-full flex-shrink-0 shadow-md"
                      />

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white line-clamp-2 group-hover:text-red-400 transition-colors mb-1 leading-tight">
                          {video.title}
                        </h3>
                        <p className="text-gray-300 text-sm mb-1 font-medium">
                          {channel.fullName}
                        </p>
                        <p className="text-gray-400 text-xs">
                          {formatNumber(video.views)} views •{" "}
                          {formatTimeAgo(video.createdAt)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "about" && (
          <div className="max-w-4xl">
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50">
              <h3 className="text-xl font-bold text-white mb-4">About</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">
                    {formatNumber(totalSubscribers)}
                  </div>
                  <div className="text-gray-400 text-sm">Subscribers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">
                    {videos.length}
                  </div>
                  <div className="text-gray-400 text-sm">Videos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">
                    {formatNumber(
                      videos.reduce(
                        (total, video) => total + (video.views || 0),
                        0
                      )
                    )}
                  </div>
                  <div className="text-gray-400 text-sm">Total Views</div>
                </div>
              </div>

              {channel?.description ? (
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">
                    Description
                  </h4>
                  <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                    {channel.description}
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-400">
                    No description available for this channel.
                  </p>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-gray-700/50">
                <h4 className="text-lg font-semibold text-white mb-3">
                  Details
                </h4>
                <div className="space-y-2 text-gray-300">
                  <div className="flex items-center space-x-2">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span>Joined {formatTimeAgo(channel?.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "community" && (
          <div className="max-w-2xl mx-auto">
            {/* Create Tweet Section - Only show for channel owner */}
            {user && user._id === channel?._id && (
              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50 mb-6">
                <h3 className="text-xl font-bold text-white mb-4">
                  Create Tweet
                </h3>
                <div className="space-y-4">
                  <textarea
                    value={newTweet}
                    onChange={(e) => setNewTweet(e.target.value)}
                    placeholder="Share something with your subscribers..."
                    className="w-full bg-gray-700/70 border border-gray-600 rounded-lg py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
                    rows="3"
                    maxLength="280"
                  />
                  <div className="flex justify-between items-center">
                    <span
                      className={`text-sm ${
                        newTweet.length > 250 ? "text-red-400" : "text-gray-400"
                      }`}
                    >
                      {newTweet.length}/280
                    </span>
                    <button
                      onClick={handleCreateTweet}
                      disabled={!newTweet.trim() || isCreatingTweet}
                      className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-full font-semibold transition-all cursor-pointer"
                    >
                      {isCreatingTweet ? "Posting..." : "Tweet"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tweets Feed */}
            <div className="space-y-4">
              {tweets.length === 0 ? (
                <div className="text-center py-16 bg-gray-800/50 rounded-lg border border-gray-700/50">
                  <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-12 h-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    No tweets yet
                  </h3>
                  <p className="text-gray-400">
                    {user && user._id === channel?._id
                      ? "Share your first tweet with your subscribers!"
                      : "This channel hasn't posted any tweets yet."}
                  </p>
                </div>
              ) : (
                tweets.map((tweet) => (
                  <div
                    key={tweet._id}
                    className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50 hover:border-gray-600 transition-all"
                  >
                    {/* Tweet Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={channel.avatar}
                          alt={channel.fullName}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <h4 className="font-semibold text-white">
                            {channel.fullName}
                          </h4>
                          <p className="text-gray-400 text-sm">
                            {formatTimeAgo(tweet.createdAt)}
                          </p>
                        </div>
                      </div>

                      {/* Edit/Delete Options - Only for channel owner */}
                      {user && user._id === channel?._id && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => startEditing(tweet)}
                            className="text-gray-400 hover:text-blue-400 transition-colors cursor-pointer"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteTweet(tweet._id)}
                            className="text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Tweet Content */}
                    {editingTweet === tweet._id ? (
                      <div className="space-y-4">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full bg-gray-700/70 border border-gray-600 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                          rows="3"
                        />
                        <div className="flex space-x-2 justify-end">
                          <button
                            onClick={cancelEditing}
                            className="px-4 py-2 text-gray-400 hover:text-white transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleUpdateTweet(tweet._id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors cursor-pointer"
                          >
                            Update
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-300 leading-relaxed mb-4 whitespace-pre-wrap">
                        {tweet.content}
                      </p>
                    )}

                    {/* Tweet Actions */}
                    <div className="flex items-center space-x-6 pt-4 border-t border-gray-700/50">
                      <button
                        onClick={() => handleLikeTweet(tweet._id)}
                        disabled={!user}
                        className={`flex items-center space-x-2 transition-all cursor-pointer ${
                          !user
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:text-red-400"
                        } ${tweet.isLiked ? "text-red-500" : "text-gray-400"}`}
                      >
                        <svg
                          className="w-5 h-5"
                          fill={tweet.isLiked ? "currentColor" : "none"}
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                          />
                        </svg>
                        <span>{formatNumber(tweet.likesCount)}</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChannelPage;