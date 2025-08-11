import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import ExploreIcon from '@mui/icons-material/Explore';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import axios from '../api/axios';
import EditIcon from '@mui/icons-material/Edit';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';

const Navbar = () => {
    const { user, setUser, setAccessToken } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname;

    const toggleMenu = () => setMenuOpen(prev => !prev);

    const logoutHandler = async () => {
        try {
            const resp = await axios.post('/users/logout', {}, { withCredentials: true });
            console.log("resp = ", resp)
            setAccessToken(null);
            setUser(null);
            navigate('/login');
        } catch (err) {
            console.error('Logout failed:', err?.response?.data || err.message);
        }
    };

    return (
        <nav className="bg-[#222] text-white px-6 py-4 flex justify-between items-center relative shadow-md z-50">
            {/* Logo */}
            <p onClick={() => navigate('/')} className="text-3xl font-semibold cursor-pointer">
                Visualize<span className="text-blue-400">AI</span>
            </p>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-6">
                {user ? (
                    <>
                        <div>
                            <p>Hello, {user.username}</p>
                        </div>
                        <p onClick={() => navigate(`/profile/${user.username}`)} className="cursor-pointer text-lg hover:underline">Profile</p>
                        <p onClick={logoutHandler} className="cursor-pointer text-lg hover:underline">Logout</p>
                        <div className='flex gap-3'>
                            <button
                                onClick={() => navigate('/modify')}
                                className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg flex items-center gap-1 text-sm"
                            >
                                <EditIcon fontSize="small" />
                                Modify Image
                            </button>

                            <button
                                onClick={() => navigate('/post')}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-1 text-sm"
                            >
                                <AddPhotoAlternateIcon fontSize="small" />
                                Create New Image
                            </button>
                        </div>

                    </>
                ) : (
                    <>
                        <p onClick={() => navigate('/login')} className="cursor-pointer text-lg hover:underline">Login</p>
                        <p onClick={() => navigate('/signup')} className="cursor-pointer text-lg hover:underline">Sign Up</p>
                        {currentPath === '/post' ? (
                            <button
                                onClick={() => navigate('/')}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-1 text-sm"
                            >
                                <ExploreIcon fontSize="small" />
                                Explore Post
                            </button>
                        ) : (
                            <div className='flex gap-3'>
                                <button
                                    onClick={() => navigate('/modify')}
                                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg flex items-center gap-1 text-sm"
                                >
                                    <EditIcon fontSize="small" />
                                    Modify Image
                                </button>

                                <button
                                    onClick={() => navigate('/post')}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-1 text-sm"
                                >
                                    <AddPhotoAlternateIcon fontSize="small" />
                                    Create New Image
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Mobile Menu Icon */}
            <div className="block md:hidden cursor-pointer" onClick={toggleMenu}>
                {menuOpen ? <CloseIcon /> : <MenuIcon />}
            </div>

            {/* Mobile Slide-Out Menu */}
            <div
                className={`fixed top-16 left-0 h-full w-[80%] bg-[#12141f] z-40 p-6 transition-transform duration-300 ease-in-out ${menuOpen ? 'translate-x-0' : '-translate-x-full'
                    } md:hidden`}
            >
                <ul className="flex flex-col gap-6 text-2xl">
                    {user ? (
                        <>
                            <li onClick={() => { navigate(`/profile/${user.username}`); toggleMenu(); }}>Profile</li>
                            <li
                                onClick={async () => {
                                    await logoutHandler(); // important to await
                                    toggleMenu();
                                }}
                            >
                                Logout
                            </li>
                            {currentPath === '/post' ? (
                                <li onClick={() => { navigate('/'); toggleMenu(); }} className="flex items-center gap-2 bg-blue-600 p-3 rounded-lg text-white text-xl">
                                    <ExploreIcon />
                                    Explore Post
                                </li>
                            ) : (
                                <div>
                                    <li
                                        onClick={() => { navigate('/modify'); toggleMenu(); }}
                                        className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 p-3 mb-2 rounded-lg text-white text-xl"
                                    >
                                        <EditIcon />
                                        dsv Image
                                    </li>

                                    <li
                                        onClick={() => { navigate('/post'); toggleMenu(); }}
                                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 p-3 rounded-lg text-white text-xl"
                                    >
                                        <AddPhotoAlternateIcon />
                                        Create New Image
                                    </li>

                                </div>

                            )}
                        </>
                    ) : (
                        <>
                            <li onClick={() => { navigate('/login'); toggleMenu(); }}>Login</li>
                            <li onClick={() => { navigate('/signup'); toggleMenu(); }}>Sign Up</li>
                            <li
                                onClick={() => { navigate('/modify'); toggleMenu(); }}
                                className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 p-3 rounded-lg text-white text-xl"
                            >
                                <EditIcon />
                                dsf Image
                            </li>

                            <li
                                onClick={() => { navigate('/post'); toggleMenu(); }}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 p-3 rounded-lg text-white text-xl"
                            >
                                <AddPhotoAlternateIcon />
                                Create New Image
                            </li>

                        </>
                    )}
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
