import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { useSelector } from "react-redux";
import axiosClient from "../utils/axiosClient";
import Navbar from "./Navbar";

function VideoPage() {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const { user } = useSelector((state) => state.auth);

  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [totalLike, setTotalLike] = useState(0);
  const [liked, setLiked] = useState(false);
  const [totalSubscriber, setTotalSubscriber] = useState(0);
  const [subscribed, setSubscribed] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");

  useEffect(() => {
    fetchVideo();
    fetchRelatedVideos();
    fetchComments();
  }, [videoId]);

  const fetchVideo = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get(`/video/${videoId}`);
      setSubscribed(response.data.isSubscribed);
      setTotalSubscriber(response.data.totalSubscribers);
      setLiked(response.data.isLiked);
      setTotalLike(response.data.totalLikes);
      setVideo(response.data.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to load video" + err);
      setLoading(false);
    }
  };

  const fetchRelatedVideos = async () => {
    try {
      const response = await axiosClient.get("/video/all");
      setRelatedVideos(response.data.data.slice(0, 6));
    } catch (err) {
      console.error("Failed to fetch related videos" + err);
    }
  };

  // Comment functions
  const fetchComments = async () => {
    try {
      const response = await axiosClient.get(`/comment/${videoId}`);
      setComments(response.data.data || []);
    } catch (err) {
      console.error("Failed to fetch comments" + err);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      setCommentLoading(true);
      const response = await axiosClient.post("/comment/" + videoId, {
        content: newComment,
      });
      setComments((prev) => [response.data.data, ...prev]);
      setNewComment("");
    } catch (err) {
      console.error("Failed to add comment" + err);
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await axiosClient.delete(`/comment/${commentId}`);
      setComments((prev) =>
        prev.filter((comment) => comment._id !== commentId)
      );
    } catch (err) {
      console.error("Failed to delete comment" + err);
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      const response = await axiosClient.post(`/like/comment/${commentId}`);
      setComments((prev) =>
        prev.map((comment) => {
          if (comment._id === commentId) {
            return {
              ...comment,
              isLiked: response.data.data.isLiked,
              likeCount: response.data.data.isLiked
                ? parseInt(comment.likeCount) + 1
                : parseInt(comment.likeCount) - 1,
            };
          }
          return comment;
        })
      );
    } catch (err) {
      console.error("Failed to like comment" + err);
    }
  };

  const handleUpdateComment = async (commentId) => {
    if (!editCommentText.trim()) return;

    try {
      const response = await axiosClient.patch(`/comment/${commentId}`, {
        content: editCommentText,
      });

      setComments((prev) =>
        prev.map((comment) =>
          comment._id === commentId ? response.data.data : comment
        )
      );
      setEditingCommentId(null);
      setEditCommentText("");
    } catch (err) {
      console.error("Failed to update comment" + err);
    }
  };

  const startEditing = (comment) => {
    setEditingCommentId(comment._id);
    setEditCommentText(comment.content);
  };

  const cancelEditing = () => {
    setEditingCommentId(null);
    setEditCommentText("");
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    if (videoRef.current) {
      videoRef.current.currentTime = percent * duration;
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSubscribe = async () => {
    const response = await axiosClient.post("/subscription/" + video.owner._id);
    if (subscribed) {
      setTotalSubscriber((prev) => prev - 1);
    } else {
      setTotalSubscriber((prev) => prev + 1);
    }
    if (response) {
      setSubscribed((prev) => !prev);
    }
  };

  const handleLike = async () => {
    const response = await axiosClient.post("/like/video/" + videoId);
    if (liked) {
      setTotalLike((prev) => prev - 1);
    } else {
      setTotalLike((prev) => prev + 1);
    }
    if (response) {
      setLiked((prev) => !prev);
    }
  };

  const displayedComments = showAllComments ? comments : comments.slice(0, 3);

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading video...</p>
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

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Video Section */}
          <div className="lg:col-span-3">
            {/* Video Player */}
            <div
              className="relative rounded-lg overflow-hidden bg-black shadow-2xl mb-6 group cursor-pointer"
              onMouseEnter={() => setShowControls(true)}
              onMouseLeave={() => setShowControls(false)}
            >
              <video
                ref={videoRef}
                src={video?.videoFile}
                className="w-full aspect-video"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleTimeUpdate}
                onClick={togglePlay}
              />

              {/* Custom Controls */}
              {showControls && (
                <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent p-4 transition-opacity duration-300">
                  {/* Progress Bar */}
                  <div
                    className="w-full h-2 bg-white/30 rounded-full mb-4 cursor-pointer"
                    onClick={handleSeek}
                  >
                    <div
                      className="h-full bg-red-600 rounded-full transition-all"
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                  </div>

                  {/* Control Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={togglePlay}
                        className="text-white hover:text-red-400 transition-colors cursor-pointer"
                      >
                        {isPlaying ? (
                          <svg
                            className="w-6 h-6"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
                          </svg>
                        ) : (
                          <svg
                            className="w-6 h-6"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        )}
                      </button>

                      <button
                        onClick={toggleMute}
                        className="text-white hover:text-red-400 transition-colors cursor-pointer"
                      >
                        {isMuted || volume === 0 ? (
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                          </svg>
                        ) : (
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                          </svg>
                        )}
                      </button>

                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="w-20 accent-red-600 cursor-pointer"
                      />

                      <span className="text-white text-sm">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                    </div>

                    <button className="text-white hover:text-red-400 transition-colors cursor-pointer">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 15.5A3.5 3.5 0 018.5 12 3.5 3.5 0 0112 8.5a3.5 3.5 0 013.5 3.5 3.5 3.5 0 01-3.5 3.5m7.43-2.53c.04.32.07.64.07.97 0 5.5-4.5 10-10 10S2 17.5 2 12 6.5 2 12 2c4.32 0 8 2.75 9.43 6.97z" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Video Info */}
            <div className="bg-gray-800/80 backdrop-blur-lg rounded-lg p-6 border border-gray-700/50 mb-6">
              <h1 className="text-2xl font-bold text-white mb-4">
                {video?.title}
              </h1>

              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div onClick={()=>navigate('/channel/'+video.owner._id)} className="flex items-center space-x-3 cursor-pointer">
                    <img
                      src={video?.owner?.avatar}
                      alt={video?.owner?.fullName}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <h3 className="text-white font-semibold">
                        {video?.owner?.fullName}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {totalSubscriber} subscribers
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleSubscribe}
                    className={`px-6 py-2 rounded-full font-semibold transition-all cursor-pointer ${
                      subscribed
                        ? "bg-gray-600 text-white"
                        : "bg-red-600 hover:bg-red-700 text-white"
                    }`}
                  >
                    {subscribed ? "Subscribed" : "Subscribe"}
                  </button>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleLike}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all cursor-pointer ${
                      liked
                        ? "bg-red-600 text-white"
                        : "bg-gray-700/70 text-white hover:bg-gray-600"
                    }`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" />
                    </svg>
                    <span>{totalLike}</span>
                  </button>

                  <button className="flex items-center space-x-2 px-4 py-2 bg-gray-700/70 text-white rounded-full hover:bg-gray-600 transition-all cursor-pointer">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" />
                    </svg>
                    <span>Share</span>
                  </button>
                </div>
              </div>

              {/* Video Description */}
              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center space-x-4 mb-3">
                  <span className="text-white font-semibold">
                    {video?.views || 0} views
                  </span>
                  <span className="text-gray-400">
                    {new Date(video?.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  {video?.description ||
                    "No description available for this video."}
                </p>
              </div>
            </div>

            {/* Comment Section */}
            <div className="bg-gray-800/80 backdrop-blur-lg rounded-lg p-6 border border-gray-700/50">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">
                  Comments • {comments.length}
                </h3>
              </div>

              {/* Add Comment */}
              {user && (
                <div className="flex space-x-4 mb-6">
                  <div className="flex-shrink-0">
                    <img
                      src={user.avatar}
                      alt={user.fullName}
                      className="w-10 h-10 rounded-full"
                    />
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                      rows="3"
                    />
                    <div className="flex justify-end mt-2">
                      <button
                        onClick={handleAddComment}
                        disabled={!newComment.trim() || commentLoading}
                        className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-full font-semibold transition-all cursor-pointer"
                      >
                        {commentLoading ? "Posting..." : "Comment"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Comments List */}
              <div className="space-y-4">
                {displayedComments.length === 0 ? (
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
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                    </div>
                    <p className="text-gray-400">
                      No comments yet. Be the first to comment!
                    </p>
                  </div>
                ) : (
                  <>
                    {displayedComments.map((comment) => (
                      <div key={comment._id} className="flex space-x-4 group">
                        <div className="flex-shrink-0">
                          <img
                            src={comment.owner?.avatar}
                            alt={comment.owner?.fullName}
                            className="w-10 h-10 rounded-full"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="text-white font-semibold text-sm">
                              {comment.owner?.fullName}
                            </h4>
                            <span className="text-gray-400 text-xs">
                              {formatTimeAgo(comment.createdAt)}
                            </span>
                          </div>

                          {/* Comment Content - Edit Mode */}
                          {editingCommentId === comment._id ? (
                            <div className="space-y-3">
                              <textarea
                                value={editCommentText}
                                onChange={(e) =>
                                  setEditCommentText(e.target.value)
                                }
                                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none text-sm"
                                rows="3"
                              />
                              <div className="flex space-x-2">
                                <button
                                  onClick={() =>
                                    handleUpdateComment(comment._id)
                                  }
                                  disabled={!editCommentText.trim()}
                                  className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-1 rounded text-sm font-medium transition-all cursor-pointer"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={cancelEditing}
                                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-1 rounded text-sm font-medium transition-all cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <p className="text-gray-300 text-sm leading-relaxed">
                                {comment.content}
                              </p>

                              {/* Comment Actions */}
                              <div className="flex items-center space-x-4 mt-2">
                                <button
                                  onClick={() => handleLikeComment(comment._id)}
                                  className={`text-xs flex items-center space-x-1 cursor-pointer transition-all ${
                                    comment.isLiked
                                      ? "text-red-500 hover:text-red-400"
                                      : "text-gray-400 hover:text-white"
                                  }`}
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill={
                                      comment.isLiked ? "currentColor" : "none"
                                    }
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                                    />
                                  </svg>
                                  <span>{comment.likeCount}</span>
                                </button>

                                {user && user._id === comment.owner?._id && (
                                  <>
                                    <button
                                      onClick={() => startEditing(comment)}
                                      className="text-gray-400 hover:text-blue-400 text-xs flex items-center space-x-1 cursor-pointer"
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
                                      <span>Edit</span>
                                    </button>

                                    <button
                                      onClick={() =>
                                        handleDeleteComment(comment._id)
                                      }
                                      className="text-red-400 hover:text-red-300 text-xs flex items-center space-x-1 cursor-pointer"
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
                                      <span>Delete</span>
                                    </button>
                                  </>
                                )}

                                {user &&
                                  user._id === video?.owner?._id &&
                                  user._id !== comment.owner?._id && (
                                    <button
                                      onClick={() =>
                                        handleDeleteComment(comment._id)
                                      }
                                      className="text-red-400 hover:text-red-300 text-xs flex items-center space-x-1 cursor-pointer"
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
                                      <span>Delete</span>
                                    </button>
                                  )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Show More/Less Comments */}
                    {comments.length > 3 && (
                      <div className="text-center pt-4">
                        <button
                          onClick={() => setShowAllComments(!showAllComments)}
                          className="text-red-400 hover:text-red-300 font-semibold text-sm cursor-pointer"
                        >
                          {showAllComments
                            ? "Show Less"
                            : `Show All ${comments.length} Comments`}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Related Videos */}
          <div className="lg:col-span-1">
            <h3 className="text-white font-semibold text-lg mb-4">Up Next</h3>
            <div className="space-y-4">
              {relatedVideos.map((relatedVideo) =>{
              if(videoId.toString()!==relatedVideo._id.toString()){
                  return <Link
                  key={relatedVideo._id}
                  to={`/watch/${relatedVideo._id}`}
                  className="block group cursor-pointer"
                >
                  <div className="flex space-x-3">
                    <div className="relative flex-shrink-0">
                      <img
                        src={relatedVideo.thumbnail}
                        alt={relatedVideo.title}
                        className="w-40 h-24 object-cover rounded-lg group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 py-0.5 rounded">
                        {formatTime(relatedVideo.duration)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium line-clamp-2 group-hover:text-red-400 transition-colors text-sm leading-tight mb-1">
                        {relatedVideo.title}
                      </h4>
                      <p className="text-gray-400 text-xs mb-1">
                        {relatedVideo.owner?.fullName}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {relatedVideo.views} views •{" "}
                        {formatTimeAgo(relatedVideo.createdAt)}
                      </p>
                    </div>
                  </div>
                </Link>
                }
})}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Helper function for time ago
  function formatTimeAgo(date) {
    const now = new Date();
    const diffInMs = now - new Date(date);
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  }
}

export default VideoPage;