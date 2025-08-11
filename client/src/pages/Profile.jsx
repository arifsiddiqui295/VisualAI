import React, { useEffect, useState } from "react";
import useAxiosPrivate from "../api/axiosPrivate";
import { useAuth } from '../context/AuthContext'
import { useParams } from 'react-router-dom';

import NProgress from 'nprogress';

// import SearchBar from '../components/SearchBar';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const Profile = () => {
    const axiosPrivate = useAxiosPrivate();
    const { user, setUser } = useAuth();
    const { username } = useParams();
    const [userPosts, setUserPosts] = useState('');
    const [generatedPosts, setGeneratedPosts] = useState([]);
    const [modifiedPosts, setModifiedPosts] = useState([]);
    const [filter, setFilter] = useState('generated'); // 'generated' or 'modified'

    useEffect(() => {
        const fetchProfile = async () => {
            // console.log(user)
            try {
                const res = await axiosPrivate.get(`/users/${username}`);
                // console.log("res = ", res)
                setUser(res.data);
            } catch (err) {
                console.error("Failed to fetch profile:", err);
            } finally {
                NProgress.done(); // ✅ Stop loader after fetch
            }
        };

        fetchProfile();
    }, []);

    useEffect(() => {
        const getPosts = async () => {
            try {
                const generatedRes = await axiosPrivate.get('/images/getUserPost');
                setGeneratedPosts(generatedRes.data.data);

                const modifiedRes = await axiosPrivate.get('/images/getUserModifedImage');
                setModifiedPosts(modifiedRes.data.data);
            } catch (err) {
                console.error("Error fetching posts:", err);
            }
        };
        getPosts();
    }, []);

    // Like/Unlike a post
    const toggleLiked = async (postId) => {
        const isGenerated = filter === "generated";
        const listToUpdate = isGenerated ? generatedPosts : modifiedPosts;
        const setList = isGenerated ? setGeneratedPosts : setModifiedPosts;
        const endpoint = isGenerated ? "/images/toggleLiked" : "/images/toggleModifiedLiked";

        const updatedPosts = listToUpdate.map((post) => {
            if (post._id === postId) {
                const alreadyLiked = post.like.includes(user.username);
                return {
                    ...post,
                    like: alreadyLiked
                        ? post.like.filter((u) => u !== user.username)
                        : [...post.like, user.username],
                };
            }
            return post;
        });

        // Optimistic update
        setList(updatedPosts);

        try {
            await axiosPrivate.post(endpoint, {
                postId,
                profileUser: user.username,
            });
        } catch (err) {
            toast.error("Failed to toggle like. Please try again.");

            // Revert changes if request fails
            const revertedPosts = listToUpdate.map((post) => {
                if (post._id === postId) {
                    const alreadyLiked = post.like.includes(user.username);
                    return {
                        ...post,
                        like: alreadyLiked
                            ? [...post.like, user.username]
                            : post.like.filter((u) => u !== user.username),
                    };
                }
                return post;
            });
            setList(revertedPosts);
        }
    };

    const displayedPosts = filter === 'generated' ? generatedPosts : modifiedPosts;
    return (
        <div >
            <ToastContainer />
            <div className=" px-6 md:px-8 py-8  bg-gray-900 dark:bg-gray-900 flex flex-col items-center gap-5">
                <div className="flex  gap-4 mb-6">
                    <button
                        className={`px-4 py-2 rounded-full ${filter === 'generated' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'
                            }`}
                        onClick={() => setFilter('generated')}
                    >
                        Generated
                    </button>
                    <button
                        className={`px-4 py-2 rounded-full ${filter === 'modified' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'
                            }`}
                        onClick={() => setFilter('modified')}
                    >
                        Modified
                    </button>
                </div>
                <div className="grid justify-center items-center gap-8 xl:grid-cols-3 sm:grid-cols-2">


                    {displayedPosts && displayedPosts.map((element) => (
                        <article
                            key={element._id}
                            className="relative isolate flex flex-col justify-end overflow-hidden rounded-2xl pb-8 pt-36 sm:pt-40 md:pt-44 lg:pt-48 xl:pt-52 w-80 sm:w-96 mx-auto mt-8 sm:mt-14 mb-0 transition duration-300 transform hover:scale-105"
                        >
                            <div className="flex flex-col items-center justify-center absolute top-0 right-0 z-10 m-4">
                                {element.like.includes(user.username) ? (
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

export default Profile;
