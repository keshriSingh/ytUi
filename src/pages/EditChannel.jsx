import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import axiosClient from "../utils/axiosClient";
import Navbar from "./Navbar";

function EditChannel() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("profile");

  // Channel data
  const [channelData, setChannelData] = useState({
    fullName: "",
    userName: "",
    email: "",
    avatar: "",
    coverImage: "",
  });

  // Video management
  const [videos, setVideos] = useState([]);
  const [editingVideo, setEditingVideo] = useState(null);
  const [videoFormData, setVideoFormData] = useState({
    title: "",
    description: "",
    thumbnail: null,
  });

  useEffect(() => {
    fetchChannelData();
  }, []);

  const fetchChannelData = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get(`/user/getChannel/${user._id}`);
      const channel = response.data.data;

      setChannelData({
        fullName: channel.fullName || "",
        userName: channel.userName || "",
        email: channel.email || "",
        avatar: channel.avatar || "",
        coverImage: channel.coverImage || "",
      });
      setVideos(response.data.data.videos || []);
    } catch (err) {
      setError("Failed to load channel data");
      console.error("Failed to fetch channel:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setChannelData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = async (e, fileType) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    if (fileType === "avatar" || fileType === "coverImage") {
      const validImageTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];
      if (!validImageTypes.includes(file.type)) {
        setError("Please select a valid image file (JPEG, PNG, or WebP)");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB");
        return;
      }

      try {
        setSaving(true);
        const formData = new FormData();

        if (fileType === "avatar") {
          formData.append("avatar", file);
        } else if (fileType === "coverImage") {
          formData.append("coverImage", file);
        }

        const endpoint =
          fileType === "avatar" ? "/user/editAvatar" : "/user/editCoverImage";

        const response = await axiosClient.patch(endpoint, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        setChannelData((prev) => ({
          ...prev,
          [fileType]:
            response.data.data.avatar || response.data.data.coverImage,
        }));

        setSuccess(
          `${
            fileType === "avatar" ? "Profile picture" : "Cover image"
          } updated successfully!`
        );
      } catch (err) {
        setError(`Failed to update ${fileType}`);
        console.error("Upload error:", err);
      } finally {
        setSaving(false);
      }
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      await axiosClient.patch("/user/editProfile", {
        fullName: channelData.fullName,
        userName: channelData.userName,
      });

      setSuccess("Profile updated successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const startEditingVideo = (video) => {
    setEditingVideo(video._id);
    setVideoFormData({
      title: video.title,
      description: video.description || "",
      thumbnail: null,
    });
  };

  const cancelEditingVideo = () => {
    setEditingVideo(null);
    setVideoFormData({
      title: "",
      description: "",
      thumbnail: null,
    });
  };

  const handleVideoInputChange = (e) => {
    const { name, value } = e.target;
    setVideoFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleVideoThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFormData((prev) => ({ ...prev, thumbnail: file }));
    }
  };

  const handleUpdateVideo = async (videoId) => {
    try {
      setSaving(true);
      setError("");

      const formData = new FormData();
      formData.append("title", videoFormData.title);
      formData.append("description", videoFormData.description);

      if (videoFormData.thumbnail) {
        formData.append("thumbnail", videoFormData.thumbnail);
      }

      const response = await axiosClient.patch(`/video/${videoId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setVideos((prev) =>
        prev.map((video) =>
          video._id === videoId ? response.data.data : video
        )
      );

      setSuccess("Video updated successfully!");
      cancelEditingVideo();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update video");
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async (videoId) => {
    try {
      setSaving(true);
      const response = await axiosClient.patch(`/video/toggle/${videoId}`);

      setVideos((prev) =>
        prev.map((video) =>
          video._id === videoId ? response.data.data : video
        )
      );

      setSuccess("Video status updated successfully!");
    } catch (err) {
      setError("Failed to update video status"+err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteVideo = async (videoId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this video? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setSaving(true);
      await axiosClient.delete(`/video/${videoId}`);

      setVideos((prev) => prev.filter((video) => video._id !== videoId));
      setSuccess("Video deleted successfully!");
    } catch (err) {
      setError("Failed to delete video"+err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-900 to-black">
        <div className="max-w-6xl mx-auto p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1">
                <div className="h-48 bg-gray-700 rounded-lg"></div>
              </div>
              <div className="lg:col-span-3">
                <div className="h-96 bg-gray-700 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 to-black">
      <Navbar showSidebarToggle={false} />

      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Channel Settings</h1>
            <p className="text-gray-400">Manage your channel and content</p>
          </div>
          <button
            onClick={() => navigate(`/channel/${user._id}`)}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-full font-semibold transition-all cursor-pointer"
          >
            View Channel
          </button>
        </div>

        {/* Error and Success Messages */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2 text-red-400">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2 text-green-400">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              <span>{success}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/80 backdrop-blur-lg rounded-xl border border-gray-700/50 p-4">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all cursor-pointer ${
                    activeTab === "profile"
                      ? "bg-red-600 text-white"
                      : "text-gray-300 hover:bg-gray-700/70 hover:text-white"
                  }`}
                >
                  Profile Settings
                </button>
                <button
                  onClick={() => setActiveTab("videos")}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all cursor-pointer ${
                    activeTab === "videos"
                      ? "bg-red-600 text-white"
                      : "text-gray-300 hover:bg-gray-700/70 hover:text-white"
                  }`}
                >
                  Video Management
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Settings Tab */}
            {activeTab === "profile" && (
              <div className="bg-gray-800/80 backdrop-blur-lg rounded-xl border border-gray-700/50 p-6">
                <h2 className="text-2xl font-bold text-white mb-6">
                  Profile Settings
                </h2>

                <form onSubmit={handleSaveProfile} className="space-y-6">
                  {/* Avatar Upload */}
                  <div>
                    <label className="block text-white font-semibold mb-3">
                      Profile Picture
                    </label>
                    <div className="flex items-center space-x-6">
                      <div className="relative">
                        <img
                          src={channelData.avatar || "/default-avatar.png"}
                          alt="Profile"
                          className="w-24 h-24 rounded-full object-cover border-4 border-gray-600"
                        />
                        <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-white text-sm font-semibold">
                            Change
                          </span>
                        </div>
                      </div>
                      <div>
                        <input
                          type="file"
                          id="avatar"
                          onChange={(e) => handleFileChange(e, "avatar")}
                          accept="image/*"
                          className="hidden"
                        />
                        <label
                          htmlFor="avatar"
                          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-all cursor-pointer inline-block"
                        >
                          Upload New Photo
                        </label>
                        <p className="text-gray-400 text-sm mt-2">
                          Recommended: 500x500 pixels, Max 5MB
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Cover Image Upload */}
                  <div>
                    <label className="block text-white font-semibold mb-3">
                      Cover Image
                    </label>
                    <div className="space-y-4">
                      <div className="relative rounded-lg overflow-hidden">
                        <img
                          src={channelData.coverImage || "/default-cover.jpg"}
                          alt="Cover"
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-white font-semibold">
                            Change Cover Image
                          </span>
                        </div>
                      </div>
                      <input
                        type="file"
                        id="coverImage"
                        onChange={(e) => handleFileChange(e, "coverImage")}
                        accept="image/*"
                        className="hidden"
                      />
                      <label
                        htmlFor="coverImage"
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-all cursor-pointer inline-block"
                      >
                        Upload Cover Image
                      </label>
                      <p className="text-gray-400 text-sm">
                        Recommended: 1920x1080 pixels, Max 5MB
                      </p>
                    </div>
                  </div>

                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="fullName"
                        className="block text-white font-semibold mb-2"
                      >
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={channelData.fullName}
                        onChange={handleInputChange}
                        className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="userName"
                        className="block text-white font-semibold mb-2"
                      >
                        Username *
                      </label>
                      <input
                        type="text"
                        id="userName"
                        name="userName"
                        value={channelData.userName}
                        onChange={handleInputChange}
                        className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-white font-semibold mb-2"
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={channelData.email}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      disabled
                    />
                    <p className="text-gray-400 text-sm mt-1">
                      Email cannot be changed
                    </p>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-gray-700/50">
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-8 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all cursor-pointer flex items-center space-x-2"
                    >
                      {saving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <span>Save Changes</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Video Management Tab */}
            {activeTab === "videos" && (
              <div className="bg-gray-800/80 backdrop-blur-lg rounded-xl border border-gray-700/50 p-6">
                <h2 className="text-2xl font-bold text-white mb-6">
                  Video Management
                </h2>

                {videos.length === 0 ? (
                  <div className="text-center py-12">
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
                          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      No videos uploaded yet
                    </h3>
                    <p className="text-gray-400 mb-6">
                      Start sharing your content with the world!
                    </p>
                    <button
                      onClick={() => navigate("/upload")}
                      className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all cursor-pointer"
                    >
                      Upload Your First Video
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {videos.map((video) => (
                      <div
                        key={video._id}
                        className="bg-gray-700/50 rounded-lg p-4 border border-gray-600/50"
                      >
                        {editingVideo === video._id ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-white font-semibold mb-2">
                                  Title
                                </label>
                                <input
                                  type="text"
                                  name="title"
                                  value={videoFormData.title}
                                  onChange={handleVideoInputChange}
                                  className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                />
                              </div>
                              <div>
                                <label className="block text-white font-semibold mb-2">
                                  Thumbnail
                                </label>
                                <input
                                  type="file"
                                  onChange={handleVideoThumbnailChange}
                                  accept="image/*"
                                  className="w-full text-white text-sm"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-white font-semibold mb-2">
                                Description
                              </label>
                              <textarea
                                name="description"
                                value={videoFormData.description}
                                onChange={handleVideoInputChange}
                                rows="3"
                                className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                              />
                            </div>
                            <div className="flex space-x-3">
                              <button
                                onClick={() => handleUpdateVideo(video._id)}
                                disabled={saving}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded text-sm font-semibold transition-all cursor-pointer"
                              >
                                {saving ? "Saving..." : "Save Changes"}
                              </button>
                              <button
                                onClick={cancelEditingVideo}
                                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm font-semibold transition-all cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex space-x-4">
                            <img
                              src={video.thumbnail}
                              alt={video.title}
                              className="w-32 h-20 object-cover rounded-lg flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <h3 className="text-white font-semibold truncate">
                                {video.title}
                              </h3>
                              <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                                {video.description || "No description"}
                              </p>
                              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                                <span>{video.views || 0} views</span>
                                <span>
                                  {new Date(
                                    video.createdAt
                                  ).toLocaleDateString()}
                                </span>
                                <span
                                  className={
                                    video.isPublished
                                      ? "text-green-400"
                                      : "text-yellow-400"
                                  }
                                >
                                  {video.isPublished ? "Public" : "Private"}
                                </span>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => startEditingVideo(video)}
                                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-semibold transition-all cursor-pointer"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleTogglePublish(video._id)}
                                className={`px-3 py-1 rounded text-sm font-semibold transition-all cursor-pointer ${
                                  video.isPublished
                                    ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                                    : "bg-green-600 hover:bg-green-700 text-white"
                                }`}
                              >
                                {video.isPublished ? "Unpublish" : "Publish"}
                              </button>
                              <button
                                onClick={() => handleDeleteVideo(video._id)}
                                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-semibold transition-all cursor-pointer"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditChannel;
