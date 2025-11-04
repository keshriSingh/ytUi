import React, { useState, useRef } from "react";
import { useNavigate } from "react-router";
import axiosClient from "../utils/axiosClient";
import Navbar from "./Navbar";

function UploadVideo() {
  const navigate = useNavigate();
  
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form states
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    videoFile: null,
    thumbnail: null,
    isPublic: true
  });

  const fileInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);


  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate video file
    if (fileType === 'video') {
      const validVideoTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/mkv', 'video/webm'];
      if (!validVideoTypes.includes(file.type)) {
        setError("Please select a valid video file (MP4, MOV, AVI, MKV, or WebM)");
        return;
      }
      
      if (file.size > 500 * 1024 * 1024) { // 500MB limit
        setError("Video file size must be less than 500MB");
        return;
      }

      setFormData(prev => ({ ...prev, videoFile: file }));
      setError("");
    }

    // Validate thumbnail
    if (fileType === 'thumbnail') {
      const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validImageTypes.includes(file.type)) {
        setError("Please select a valid image file (JPEG, PNG, or WebP)");
        return;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError("Thumbnail image size must be less than 5MB");
        return;
      }

      setFormData(prev => ({ ...prev, thumbnail: file }));
      setError("");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, fileType) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const event = {
        target: {
          files: [file]
        }
      };
      handleFileChange(event, fileType);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.videoFile) {
      setError("Please select a video file to upload");
      return;
    }

    if (!formData.title.trim()) {
      setError("Please enter a title for your video");
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");

    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('videoFile', formData.videoFile);
      submitData.append('thumbnail', formData.thumbnail);
      submitData.append('isPublic', formData.isPublic);

      const response = await axiosClient.post('/video/publishVideo', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });

      setSuccess("Video uploaded successfully!");
      
      // Redirect to the video page after successful upload
      setTimeout(() => {
        navigate(`/watch/${response.data.data._id}`);
      }, 2000);

    } catch (err) {
      console.error("Upload error:", err);
      setError(err.response?.data?.message || "Failed to upload video. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      videoFile: null,
      thumbnail: null,
      isPublic: true
    });
    setUploadProgress(0);
    setError("");
    setSuccess("");
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 to-black">
      <Navbar showSidebarToggle={false} />
      
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Upload Video</h1>
          <p className="text-gray-400">Share your content with the world</p>
        </div>

        {/* Upload Form */}
        <div className="bg-gray-800/80 backdrop-blur-lg rounded-xl border border-gray-700/50 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Video File Upload */}
            <div>
              <label className="block text-white font-semibold mb-3">
                Video File *
              </label>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                  formData.videoFile
                    ? "border-green-500 bg-green-500/10"
                    : "border-gray-600 hover:border-red-500 hover:bg-red-500/5"
                }`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'video')}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => handleFileChange(e, 'video')}
                  accept="video/*"
                  className="hidden"
                />
                
                {formData.videoFile ? (
                  <div className="text-green-400">
                    <svg className="w-12 h-12 mx-auto mb-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                    </svg>
                    <p className="font-semibold">{formData.videoFile.name}</p>
                    <p className="text-sm text-gray-300 mt-1">
                      {(formData.videoFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFormData(prev => ({ ...prev, videoFile: null }));
                      }}
                      className="text-red-400 hover:text-red-300 text-sm mt-2"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="text-gray-400">
                    <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <p className="font-semibold">Drag and drop your video file here</p>
                    <p className="text-sm mt-1">or click to browse</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Supported formats: MP4, MOV, AVI, MKV, WebM (Max 500MB)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnail Upload */}
            <div>
              <label className="block text-white font-semibold mb-3">
                Thumbnail
              </label>
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
                  formData.thumbnail
                    ? "border-green-500 bg-green-500/10"
                    : "border-gray-600 hover:border-red-500 hover:bg-red-500/5"
                }`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'thumbnail')}
                onClick={() => thumbnailInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={thumbnailInputRef}
                  onChange={(e) => handleFileChange(e, 'thumbnail')}
                  accept="image/*"
                  className="hidden"
                />
                
                {formData.thumbnail ? (
                  <div className="flex items-center space-x-4">
                    <img
                      src={URL.createObjectURL(formData.thumbnail)}
                      alt="Thumbnail preview"
                      className="w-20 h-12 object-cover rounded"
                    />
                    <div className="text-left">
                      <p className="text-green-400 font-semibold">{formData.thumbnail.name}</p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData(prev => ({ ...prev, thumbnail: null }));
                        }}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-400">
                    <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm">Upload a custom thumbnail</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Recommended: 1280x720 pixels (Max 5MB)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-white font-semibold mb-2">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter a title that describes your video"
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                maxLength={100}
                required
              />
              <div className="text-right text-xs text-gray-400 mt-1">
                {formData.title.length}/100
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-white font-semibold mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Tell viewers about your video"
                rows="4"
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                maxLength={5000}
              />
              <div className="text-right text-xs text-gray-400 mt-1">
                {formData.description.length}/5000
              </div>
            </div>

            {/* Privacy Setting */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isPublic"
                name="isPublic"
                checked={formData.isPublic}
                onChange={handleInputChange}
                className="w-4 h-4 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-500 focus:ring-2 cursor-pointer"
              />
              <label htmlFor="isPublic" className="text-white cursor-pointer">
                Make this video public
              </label>
            </div>

            {/* Upload Progress */}
            {uploading && (
              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-semibold">Uploading...</span>
                  <span className="text-gray-300">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-red-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Error and Success Messages */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-red-400">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                  </svg>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {success && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-green-400">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <span>{success}</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-700/50">
              <button
                type="button"
                onClick={resetForm}
                disabled={uploading}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all cursor-pointer"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={uploading || !formData.videoFile || !formData.title.trim()}
                className="px-8 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all cursor-pointer flex items-center space-x-2"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <span>Upload Video</span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Upload Tips */}
        <div className="mt-8 bg-gray-800/50 rounded-lg p-6 border border-gray-700/50">
          <h3 className="text-white font-semibold mb-4">Upload Tips</h3>
          <ul className="text-gray-400 space-y-2 text-sm">
            <li className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
              </svg>
              <span>Use a clear, high-quality thumbnail that represents your video content</span>
            </li>
            <li className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
              </svg>
              <span>Write a compelling title that includes relevant keywords</span>
            </li>
            <li className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
              </svg>
              <span>Add a detailed description with timestamps and relevant links</span>
            </li>
            <li className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
              </svg>
              <span>Use relevant tags to help viewers discover your content</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default UploadVideo;