import React, { useEffect, useState } from 'react';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from '../api/axios';
import NProgress from 'nprogress';
import useAxiosPrivate from '../api/axiosPrivate';
import { useAuth } from '../context/AuthContext';

const Home = () => {
    const [item, setItem] = useState('');
    const { user } = useAuth()
    const axiosPrivate = useAxiosPrivate();
    useEffect(() => {
        const getFeedPost = async () => {
            try {
                const response = await axios.get('/images/getFeedPost');
                // console.log("Response = ", response.data.data);
                const arr = response.data.data
                arr.reverse()
                setItem(arr); // if you want the response body
            } catch (error) {
                console.error('Error occurred while fetching feed posts:', error);
                toast.error(error.message);
            } finally {
                NProgress.done(); // ✅ Stop loader after fetch
            }
        };
        getFeedPost();
    }, []);
    const toggleLiked = async (postId) => {
        const updatedPosts = item.map(post => {
            if (post._id === postId) {
                const alreadyLiked = post.like.includes(user?.username);
                return {
                    ...post,
                    like: alreadyLiked
                        ? post.like.filter(u => u !== user?.username)
                        : [...post.like, user?.username]
                };
            }
            return post;
        });

        //  Optimistically update UI
        setItem(updatedPosts);

        try {
            const res = await axiosPrivate.post('/images/toggleLiked', {
                postId,
                profileUser: user.username
            });
            // console.log("Toggle success:", res.data);
        } catch (err) {
            //  Revert UI on error
            toast.error("Only logged in users can like the posts");

            const revertedPosts = item.map(post => {
                if (post._id === postId) {
                    const alreadyLiked = post.like.includes(user?.username);
                    return {
                        ...post,
                        like: alreadyLiked
                            ? [...post.like, user.username]
                            : post.like.filter(u => u !== user?.username)
                    };
                }
                return post;
            });

            setItem(revertedPosts);
        }
    };
    return (
        <div>
            <div className="h-full px-6 md:px-8 py-8 pb-16 bg-white dark:bg-gray-900 flex flex-col items-center gap-5">

                <ToastContainer className="sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 fixed top-10 right-10 p-2" />
                {/* <Loader /> */}

                <div className="text-[34px] font-semibold text-gray-900 dark:text-white flex flex-col items-center">
                    Explore popular posts in the Community
                    <div className="text-[30px] font-extrabold text-pink-600">
                        ⦿ Genereted With AI ⦿
                    </div>
                </div>

                {/* <SearchBar /> */}

                <div className="grid justify-center items-center gap-8 xl:grid-cols-3 sm:grid-cols-2">
                    {item && item.map((element) => (
                        <article
                            key={element._id}
                            className="relative isolate flex flex-col justify-end overflow-hidden rounded-2xl pb-8 pt-36 sm:pt-40 md:pt-44 lg:pt-48 xl:pt-52 w-80 sm:w-96 mx-auto mt-8 sm:mt-14 mb-8 sm:mb-10 transition duration-300 transform hover:scale-105"
                        >
                            <div className="flex flex-col items-center justify-center absolute top-0 right-0 z-10 m-4">
                                {element.like.includes(user?.username) ? (
                                    <FavoriteIcon
                                        style={{ color: '#ff1075', fontSize: '40px' }}
                                        onClick={() => toggleLiked(element._id)}
                                    />
                                ) : (
                                    <FavoriteBorderIcon
                                        style={{ color: 'white', fontSize: '40px' }}
                                        onClick={() => toggleLiked(element._id)}
                                    />
                                )}
                                <p className="z-20 text-white">{element.like.length}</p>
                            </div>

                            <img
                                src={element.photo}
                                alt="AI generated"
                                className="absolute inset-0 h-full w-full object-cover"
                            />

                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40" />

                            <h3 className="p-2 z-10 mt-3 text-xl text-white">{element.prompt}</h3>
                            <div className="p-2 z-10 overflow-hidden text-sm leading-6 text-gray-300">
                                {element.name}
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </div>

    );
};

export default Home;
