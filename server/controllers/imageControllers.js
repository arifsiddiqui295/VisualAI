const cloudinary = require("../config/cloudinary");
const Post = require("../models/post");
const User = require("../models/users");
const { GoogleGenAI, Modality } = require("@google/genai");
const fs = require("fs");
const path = require("path");

const ModifiedPost = require('../models/modifiedPosts');
const createImage = async (req, res, next) => {
  const { prompt } = req.body;
  // console.log("prompt = ", prompt);
  if (!prompt) return res.status(400).json({ error: "Prompt is required" });
  const ai = new GoogleGenAI(process.env.GEMINI_API_KEY);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-preview-image-generation",
      contents: prompt,
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE],
      },
    });
    // console.log("response  = ", response.candidates[0].content.parts);
    const parts = response.candidates?.[0]?.content?.parts;
    // console.log("parts", parts);
    const textPart = parts?.find((part) => part.text);
    const imagePart = parts?.find((part) => part.inlineData);
    if (textPart && !imagePart) {
      // Model returned only text — likely a refusal or limitation
      const refusalMessage = textPart.text.trim();

      return res.status(400).json({
        error: "Image generation refused",
        reason: refusalMessage,
      });
    }
    for (const part of response.candidates[0].content.parts) {
      // Based on the part type, either show the text or save the image
      if (part.text) {
        // console.log("part", part.text);
      } else if (part.inlineData) {
        // const imageData = part.inlineData.data;
        // const buffer = Buffer.from(imageData, "base64");
        // fs.writeFileSync("gemini-native-image.png", buffer);
        // console.log("Image saved as gemini-native-image.png");
        return res.status(200).json({
          image: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`,
        });
      }
    }
  } catch (error) {
    console.error(
      "Error while making the request:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Image generation failed" });
  }
};

const uploadImageAndCreatePost = async (req, res) => {
  try {
    const { user, prompt, src } = req.body;
    // Upload image to Cloudinary
    const photoUrl = await cloudinary.uploader.upload(src);
    // console.log("Uploaded Photo URL:", photoUrl.url);

    // Create new post
    const newPost = new Post({
      name: user.username,
      prompt: prompt,
      photo: photoUrl.url,
    });

    await newPost.save();

    // Associate post with user
    const foundUser = await User.findOne({ username: user.username });
    if (!foundUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    foundUser.post.push(newPost._id);
    await foundUser.save();

    res.status(201).json({ success: true, data: newPost });
  } catch (error) {
    console.error("Error uploading image or saving post:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getUserPosts = async (req, res) => {
  //   const { profileUser } = req.body;
  const profileUser = req.user.username;
  //   console.log("profileUser", profileUser);
  try {
    const posts = await Post.find({ name: profileUser });
    // console.log("User posts:", posts);
    res.status(200).json({ success: true, data: posts });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ success: false, message: "Failed to fetch posts" });
  }
};

const getAllPosts = async (req, res) => {
  //   console.log("heh");
  try {
    const posts = await Post.find({});
    // console.log("All feed posts:", posts);
    res.status(200).json({ success: true, data: posts });
  } catch (error) {
    console.error("Error fetching feed posts:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch feed posts" });
  }
};

const togglePostLike = async (req, res) => {
  try {
    const { postId, profileUser } = req.body;
    console.log(profileUser, postId);
    if (!profileUser) {
      return res.json({ success: false, message: "Unauthorized" });
    }

    const findLikedUser = await User.findOne({ username: profileUser });
    if (!findLikedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const findPost = await Post.findById(postId);
    if (!findPost) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    const findLikedUserName = findLikedUser.username;
    const index = findPost.like.indexOf(findLikedUserName);

    if (index === -1) {
      findPost.like.push(findLikedUserName);
      console.log(`${findLikedUserName} liked this post.`);
    } else {
      findPost.like.splice(index, 1);
      console.log(`${findLikedUserName} unliked this post.`);
    }

    await findPost.save();
    res.status(200).json(findPost);
  } catch (error) {
    console.error("Error toggling like:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const modifyImage = async (req, res, next) => {
  try {
    if (!req.file || !req.body.prompt) {
      return res.status(400).json({ error: "Image and prompt are required." });
    }

    const prompt = req.body.prompt;
    const imagePath = req.file.path;
    const imageData = fs.readFileSync(imagePath);
    const base64Image = imageData.toString("base64");

    const ai = new GoogleGenAI(process.env.GEMINI_API_KEY);

    const contents = [
      { text: prompt },
      {
        inlineData: {
          mimeType: req.file.mimetype,
          data: base64Image,
        },
      },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-preview-image-generation",
      contents,
      config: { responseModalities: [Modality.TEXT, Modality.IMAGE] },
    });

    // Delete the uploaded temp image right away
    fs.unlink(imagePath, (err) => {
      if (err) console.error("Failed to delete temp file:", err);
    });

    // Find image in API response
    let generatedImageBase64 = null;
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        generatedImageBase64 = part.inlineData.data;
      }
    }

    if (!generatedImageBase64) {
      return res.status(500).json({ error: "No image generated" });
    }

    return res.status(200).json({
      message: "Image modified successfully",
      image: `data:${req.file.mimetype};base64,${generatedImageBase64}`
    });

  } catch (err) {
    console.error("Error in modifyImage controller:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
const uploadModifiedImage = async (req, res) => {
  try {
    const { user, prompt, src } = req.body;

    if (!user || !prompt || !src) {
      return res.status(400).json({
        success: false,
        message: "User, prompt, and image source are required"
      });
    }

    // Upload image to Cloudinary
    const uploadedPhoto = await cloudinary.uploader.upload(src);
    console.log("Uploaded Modified Photo URL:", uploadedPhoto.url);

    // Create new modified post
    const newModifiedPost = new ModifiedPost({
      name: user.username,
      prompt,
      photo: uploadedPhoto.url,
    });

    await newModifiedPost.save();

    // Associate modified post with the user
    const foundUser = await User.findOne({ username: user.username });
    if (!foundUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Assuming your User schema has a separate field for modified posts
    if (!foundUser.modifiedPosts) {
      foundUser.modifiedPosts = [];
    }
    foundUser.modifiedPosts.push(newModifiedPost._id);
    await foundUser.save();

    res.status(201).json({
      success: true,
      data: newModifiedPost
    });

  } catch (error) {
    console.error("Error uploading modified image or saving post:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
const getModfiedImage = async (req, res, next) => {
  try {
    const modifiedPosts = await ModifiedPost.find({});
    console.log("All feed posts:", modifiedPosts);
    res.status(200).json({ success: true, data: modifiedPosts });
  } catch (error) {
    console.error("Error fetching feed posts:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch feed posts" });
  }
}

const getUserModifiedImage = async (req, res) => {
  //   const { profileUser } = req.body;
  const profileUser = req.user.username;
  console.log("profileUser", req.user);
  try {
    const modifiedPosts = await ModifiedPost.find({ name: profileUser });
    // console.log("User posts:", posts);
    res.status(200).json({ success: true, data: modifiedPosts });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ success: false, message: "Failed to fetch posts" });
  }
};

const toggleModifiedPostLike = async (req, res) => {
  try {
    const { postId, profileUser } = req.body;
    if (!profileUser) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await User.findOne({ username: profileUser });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const post = await ModifiedPost.findById(postId);
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });

    const index = post.like.indexOf(user.username);

    if (index === -1) {
      post.like.push(user.username);
    } else {
      post.like.splice(index, 1);
    }

    await post.save();
    res.status(200).json(post);
  } catch (error) {
    console.error("Error toggling like:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  createImage,
  uploadImageAndCreatePost,
  getUserPosts,
  getAllPosts,
  togglePostLike,
  modifyImage,
  uploadModifiedImage,
  getModfiedImage,
  getUserModifiedImage,
  toggleModifiedPostLike
};
