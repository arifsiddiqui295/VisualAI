const express = require("express");
const {
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
} = require("../controllers/imageControllers");
const requireAuth = require("../middlewares/requireAuth");
const upload = require("../middlewares/imageUpload");
const router = express.Router();


require("dotenv").config();

router.get("/getFeedPost", getAllPosts);

//protected routes with middlewares
router.post("/createImage", requireAuth, createImage);
router.post("/imagePost", requireAuth, uploadImageAndCreatePost);
router.get("/getUserPost", requireAuth, getUserPosts);
router.post("/toggleLiked", requireAuth, togglePostLike);
router.post("/modifyImage", requireAuth, upload.single("image"), modifyImage)
router.post("/uploadModifyImage", requireAuth, uploadModifiedImage);
router.get('/getModifedImage', getModfiedImage);
router.get('/getUserModifedImage', requireAuth, getUserModifiedImage);
router.post("/toggleModifiedLiked", requireAuth, toggleModifiedPostLike);

module.exports = router;

