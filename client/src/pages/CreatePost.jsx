import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GenerateImage from '../components/GenerateImage';
import NProgress from 'nprogress';
const CreatePost = () => {
    useEffect(() => {
        // Stop NProgress if it was started on route change
        const stopLoader = setTimeout(() => {
          NProgress.done();
        }, 300); // Small delay to allow transition
      
        return () => clearTimeout(stopLoader);
      }, []);
    return (

        <div className="min-h-screen px-6 md:px-8 py-8 bg-white dark:bg-gray-900 flex flex-col items-center gap-4">
            <div className="w-full flex justify-center flex-wrap gap-8">
                <GenerateImage />
            </div>
        </div>

    );
};

export default CreatePost;
