import React, { useState } from 'react';
import { CreateRounded, AutoAwesome } from '@mui/icons-material';
import CircularProgress from '@mui/material/CircularProgress';
import useAxiosPrivate from '../api/axiosPrivate';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../context/AuthContext'
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { useNavigate } from 'react-router-dom';
const GenerateImage = () => {
    const navigate = useNavigate();
    const axiosPrivate = useAxiosPrivate();
    const [src, setSrc] = useState(null);
    const [loading, setLoading] = useState(false);
    const [prompt, setPrompt] = useState('');
    const { user } = useAuth();
    const generateImage = async (e) => {
        e.preventDefault(); // Prevent page reload
        if (!prompt.trim()) {
            toast.warning("Prompt is empty!");
            return;
        }

        setLoading(true);
        setSrc(null);

        try {
            const res = await axiosPrivate.post('/images/createImage', { prompt });
            const data = res.data;
            console.log('res = ', res)
            if (data.image) {
                setSrc(data.image); // base64 image URL
            } else {
                toast.error("Failed to generate image.");
            }
        } catch (err) {
            console.error("Error:", err);
            toast.error(err.response.data.reason);
        } finally {
            setLoading(false);
        }
    };
    const postImage = async (e) => {
        console.log(src)
        try {
            NProgress.start();
            const res = await axiosPrivate.post('/images/imagePost', { src, user, prompt });
            navigate(`/profile/${user.username}`)
        } catch (error) {
            console.log(error)
        } finally {
            NProgress.done(); // Stop progress bar when done
        }
    }
    return (
        <div className='flex flex-col sm:flex-row gap-4 sm:gap-44'>
            <ToastContainer />
            <div className='flex flex-col w-full sm:w-full'>
                <div className='flex text-center justify-center flex-col mb-10'>
                    <h1 className='text-4xl text-white mb-3'>Generate Image using Prompt</h1>
                </div>

                <form className="max-w-md mx-auto">
                    <div className="mb-6">
                        <label htmlFor="prompt" className="block text-gray-400 font-bold mb-2">Prompt</label>
                        <textarea
                            id="prompt"
                            style={{
                                background: "#15171e",
                                outline: "none",
                                border: "1px solid #606265",
                                color: "#919296"
                            }}
                            placeholder='Enter the prompt to generate the Image...'
                            name="prompt"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="rounded py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-52 w-full sm:w-96 md:w-96 resize-none"
                        />
                    </div>

                    <div className='flex flex-col sm:flex-row gap-6'>
                        <button
                            onClick={generateImage}
                            type="submit"
                            className="flex gap-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded focus:outline-none focus:shadow-outline"
                        >
                            <AutoAwesome />
                            Generate Image
                        </button>
                        <button
                            onClick={postImage}
                            type="button"
                            className="flex gap-2 bg-purple-500 text-white font-bold py-2 px-5 rounded focus:outline-none focus:shadow-outline hover:bg-purple-700 brightness-100"
                        >
                            <CreateRounded />
                            Post Image
                        </button>
                    </div>
                </form>
            </div>

            <div className='w-full sm:w-full'>
                <div style={{ width: "100%", height: "500px" }} className="md:ml-5 border-dotted flex items-center justify-center rounded-lg border-2 mt-6 border-yellow-500">
                    {loading && (
                        <div className='flex flex-col items-center justify-center gap-4 text-gray-300'>
                            <CircularProgress style={{ color: "inherit", width: "44px", height: "44px" }} />
                            <h1>Generating Your Image . . .</h1>
                        </div>
                    )}
                    {!loading && src && (
                        <img className='object-cover bg-center w-full h-full' src={src} alt="Generated" />
                    )}
                    {!loading && !src && (
                        <div className='text-gray-400'>Write a prompt to generate image</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GenerateImage;
