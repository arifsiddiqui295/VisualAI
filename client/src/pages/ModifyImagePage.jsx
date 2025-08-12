import React, { useState, useEffect, useRef } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useAxiosPrivate from '../api/axiosPrivate';
import CircularProgress from '@mui/material/CircularProgress';
import { useAuth } from '../context/AuthContext';
import NProgress from "nprogress";
import "nprogress/nprogress.css";
export default function ModifyImagePage() {
  const axiosPrivate = useAxiosPrivate();
  const [uploadedImage, setUploadedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [prompt, setPrompt] = useState('');

  const [modifiedImage, setModifiedImage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleModifyImage = async () => {
    NProgress.start();
    if (!uploadedImage || !prompt) {
      toast.error("All fields are mandatory");
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('image', uploadedImage);
      formData.append('prompt', prompt);

      const res = await axiosPrivate.post('/images/modifyImage', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      setPreviewImage(res.data.image);
      setModifiedImage(true);
      console.log("res", res);

    } catch (error) {
      console.error("Error modifying image:", error);

      if (error.response) {
        // Server responded with a status other than 2xx
        toast.error(error.response.data?.error || "Failed to modify image");
      } else if (error.request) {
        toast.error("No response from server. Please try again later.");
      } else {
        toast.error("An unexpected error occurred.");
      }

    } finally {
      setIsLoading(false);
      NProgress.done();
    }
  };
  const postImage = async () => {
    if (!previewImage || !user || !prompt) {
      toast.error("Missing required data to post the image");
      return;
    }

    try {
      NProgress.start();
      const src = previewImage;
      console.log("Posting modified image:");

      const res = await axiosPrivate.post('/images/uploadModifyImage', { src, user, prompt });

      if (res.data?.success) {
        navigate(`/profile/${user.username}`)
        toast.success("Image posted successfully!");
      } else {
        toast.error(res.data?.message || "Failed to post image");
      }

    } catch (error) {
      console.error("Error posting modified image:", error);

      if (error.response) {
        toast.error(error.response.data?.message || `Error: ${error.response.status}`);
      } else if (error.request) {
        toast.error("No response from server. Please try again.");
      } else {
        toast.error("Unexpected error occurred");
      }
    } finally {
      NProgress.done();
    }
  };

  const uploadNewImage = async () => {
    setUploadedImage('');
    setPreviewImage('');
    setPrompt('');
    setModifiedImage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }
  useEffect(() => {
    // Stop NProgress if it was started on route change
    const stopLoader = setTimeout(() => {
      NProgress.done();
    }, 300); // Small delay to allow transition

    return () => clearTimeout(stopLoader);
  }, []);
  return (
    <div className="min-h-screen bg-gray-900 text-white py-10 px-4">
      <ToastContainer className="sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 fixed top-10 right-10 p-2" />

      <h1 className="text-3xl font-bold text-center mb-8">Modify Image Using Prompt</h1>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">

        {/* Left Side: Upload + Prompt */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <label className="block mb-4">
            <span className="text-lg font-medium">Upload Image</span>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="mt-2 block w-full text-sm text-white bg-gray-700 border border-gray-600 rounded cursor-pointer focus:outline-none"
            />
          </label>

          <label className="block mt-6">
            <span className="text-lg font-medium">Prompt</span>
            <textarea
              rows="4"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="mt-2 w-full p-3 bg-gray-700 border border-gray-600 rounded resize-none focus:outline-none"
              placeholder="Enter a prompt to modify the image..."
            />
          </label>
          {modifiedImage ?
            <div>
              <button
                onClick={postImage}
                disabled={isLoading}
                className="mt-6 w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 rounded transition duration-200 "
              >
                Post Image
              </button>
              <button
                onClick={uploadNewImage}
                disabled={isLoading}
                className="mt-6 w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 rounded transition duration-200 "
              >
                Upload new Image
              </button>
            </div> : <button
              onClick={handleModifyImage}
              disabled={isLoading}
              className="mt-6 w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 rounded transition duration-200 "
            >
              {isLoading ? 'Modifying...' : 'Modify Image'}
            </button>
          }
        </div>

        {/* Right Side: Image Preview */}
        <div className="flex flex-col items-center justify-center bg-gray-800 p-6 rounded-lg shadow-lg min-h-[400px]">
          {isLoading ? (
            <div className='flex flex-col items-center justify-center gap-4 text-gray-300'>
              <CircularProgress style={{ color: "inherit", width: "44px", height: "44px" }} />
              <h1>Modifying Your Image . . .</h1>
            </div>
          ) : (

            previewImage ? (
              <img src={previewImage} alt="Uploaded preview" className="max-h-96 rounded shadow" />
            ) : (
              <p className="text-gray-400 text-center">Upload an image and enter a prompt to preview here</p>
            )
          )}

        </div>
      </div>
    </div >
  );
}
