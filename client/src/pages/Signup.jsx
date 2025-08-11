import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CircularProgress from '@mui/material/CircularProgress';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useAuth } from '../context/AuthContext.jsx';
import Loader from '../components/Loader';
import axios from '../api/axios';
import { useEffect } from 'react';
import NProgress from 'nprogress';
const Signup = () => {
    const navigate = useNavigate();
    const { setAccessToken, setUser } = useAuth();

    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(true);

    const generateError = (error) => toast.error(error);

    const registerHandler = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const response = await axios.post(
                '/users/register',
                { username, email, password },
                { withCredentials: true }
            );

            const { accessToken, user } = response.data;

            setAccessToken(accessToken);
            setUser(user);

            setLoading(false);
            navigate('/');
        } catch (error) {
            generateError(error?.response?.data?.error || "Something went wrong");
            setLoading(false);
            NProgress.done();
        }
    };
    useEffect(() => {
        // Stop NProgress if it was started on route change
        const stopLoader = setTimeout(() => {
            NProgress.done();
        }, 300); // Small delay to allow transition

        return () => clearTimeout(stopLoader);
    }, []);
    return (
        <div className="dark:bg-gray-900">
            <ToastContainer />
            <>
                {loading && <Loader />}
                <section className="min-h-screen flex items-stretch text-white">
                    <div
                        className="lg:flex w-1/2 hidden bg-no-repeat bg-cover relative items-center"
                        style={{
                            backgroundImage:
                                "url(https://images.unsplash.com/photo-1577495508048-b635879837f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=675&q=80)"
                        }}
                    >
                        <div className="absolute bg-black opacity-60 inset-0 z-0" />
                        <div className="w-full px-24 z-10">
                            <h1 className="text-5xl font-bold text-left tracking-wide">
                                Keep it special
                            </h1>
                            <p className="text-3xl mb-40 my-4">
                                Capture your personal memory in unique way, anywhere.
                            </p>
                        </div>
                    </div>
                    <div className="lg:w-1/2 w-full flex items-start mt-10 justify-center text-center md:px-16 px-0 z-0">
                        <div className="w-full py-6 flex justify-center items-center flex-col z-20">
                            <h1 className='text-6xl'>GenAI</h1>
                            <p
                                onClick={() => { navigate('/login') }}
                                className="text-gray-100 mt-3 text-xl">
                                Already have an account? <span className='text-[#007aff] cursor-pointer underline'>Login</span>
                            </p>
                            <form className="mt-10 sm:w-2/3 w-full px-4 lg:px-0 mx-auto">
                                <div className="pb-2 pt-4">
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="Username"
                                        className="block w-full p-4 text-lg rounded-xl bg-black"
                                    />
                                </div>
                                <div className="pb-2 pt-4">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Email"
                                        className="block w-full p-4 text-lg rounded-xl bg-black"
                                    />
                                </div>
                                <div className="pb-2 pt-4 flex relative">
                                    <input
                                        type={showPassword ? 'password' : 'text'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Password"
                                        className="block w-full p-4 pr-12 text-lg rounded-xl bg-black"
                                    />
                                    {
                                        showPassword ? (
                                            <VisibilityIcon
                                                onClick={() => setShowPassword(false)}
                                                className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer"
                                            />
                                        ) : (
                                            <VisibilityOffIcon
                                                onClick={() => setShowPassword(true)}
                                                className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer"
                                            />
                                        )
                                    }
                                </div>
                                <div className="px-4 pb-2 pt-4">
                                    <button
                                        onClick={registerHandler}
                                        className="uppercase block w-full p-4 text-lg rounded-xl bg-indigo-500 hover:bg-indigo-600 focus:outline-none"
                                    >
                                        {
                                            loading ? (
                                                <CircularProgress
                                                    style={{ color: "inherit", width: "20px", height: "20px" }}
                                                />
                                            ) : 'Sign Up'
                                        }
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </section>
            </>
        </div>
    );
};

export default Signup;
