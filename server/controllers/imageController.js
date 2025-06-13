import axios from "axios";
import fs from 'fs'
import FormData from 'form-data'
import userModel from "../models/userModels.js";

// Controller function to remove bg from image
const removeBgImage =  async (req,res) => {

    try {
        
        const clerkId = req.clerkId; // ✅ Updated from req.body
        const userData = await userModel.findOne({ clerkId });

    if (!userData) {
      return res.json({ success: false, message: 'User not found' });
    }

    if(userData.creditBalance === 0){
        return res.json({success: false,message:"No Credit Balance", creditBalance:userData.creditBalance})
    }

    const imagePath = req.file.path;

    // Reading the image file
    const imageFile = fs.createReadStream(imagePath)
    const formData = new FormData()
    formData.append('image_file',imageFile)

    const {data} = await axios.post('https://clipdrop-api.co/remove-background/v1', formData, {headers:{
        'x-api-key':process.env.CLIPDROP_API
    },
    responseType: 'arraybuffer'
    })

    const base64Image = Buffer.from(data, 'binary').toString('base64')

    const resultImage = `data:${req.file.mimetype};base64,${base64Image}`

    await userModel.findByIdAndUpdate(userData.id,{creditBalance:userData.creditBalance - 1})

    res.json({success:true, resultImage, creditBalance: userData.creditBalance - 1, message:'Background removed'})

    } catch (error) {
        console.log(error.message);
        res.json({sucess:false,message:error.message})
    }
}

export {removeBgImage}