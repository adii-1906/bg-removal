import pkg from "svix";
const { Webhook } = pkg; // Note: lowercase 'h' in 'Webhook'
import userModel from "../models/userModels.js";
import razorpay from "razorpay";
import transactionModel from "../models/transactionModel.js";

// API Controller Function to manage Clerk User with database
// http://localhost:4000/api/user/webhooks
const clerkWebHooks = async (req, res) => {
  try {
    // Create a Svix instance with clerk webhook secret
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    await whook.verify(JSON.stringify(req.body), {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    });

    const { data, type } = req.body;

    switch (type) {
      case "user.created": {
        const userData = {
          clerkId: data.id,
          email: data.email_addresses[0].email_address,
          firstName: data.first_name,
          lastName: data.last_name,
          photo: data.image_url,
        };

        await userModel.create(userData);
        res.json({});

        break;
      }

      case "user.updated": {
        const userData = {
          email: data.email_addresses[0].email_address,
          firstName: data.first_name,
          lastName: data.last_name,
          photo: data.image_url,
        };

        await userModel.findOneAndUpdate({ clerkId: data.id }, userData);
        res.json({});

        break;
      }

      case "user.deleted": {
        await userModel.findOneAndDelete({ clerkId: data.id });
        res.json({});

        break;
      }

      default:
        break;
    }
  } catch (error) {
    console.log(error.message);
    res.json({ sucess: false, message: error.message });
  }
};

// API controller function to get user available credits data
const userCredits = async (req, res) => {
  try {
    const clerkId = req.clerkId; // ✅ Updated from req.body
    const userData = await userModel.findOne({ clerkId });

    if (!userData) {
      return res.json({ success: false, message: "User not found" });
    }

    res.json({ success: true, credits: userData.creditBalance });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Gateway Initialize
const razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// API to make payment for credits

const paymentRazorpay = async (req, res) => {
  try {
    const clerkId = req.clerkId; // ✅ Taken from auth middleware
    const { planId } = req.body;
    const userData = await userModel.findOne({ clerkId });

    if (!userData || !planId) {
      return res.json({
        success: false,
        message: "Invalid credentials or plan",
      });
    }

    let credits, amount;
    switch (planId) {
      case 'Basic':
        credits = 100;
        amount = 100; // in rupees
        break;
      case 'Advanced':
        credits = 500;
        amount = 500;
        break;
      case 'Business':
        credits = 5000;
        amount = 2500;
        break;
      default:
        return res.json({ success: false, message: 'Invalid plan ID' });
    }

    const transaction = await transactionModel.create({
      clerkId,
      plan: planId,
      credits,
      amount,
      date: Date.now(),
    });

    const order = await razorpayInstance.orders.create({
      amount: amount * 100, // Razorpay uses paise
      currency: process.env.CURRENCY || 'INR',
      receipt: String(transaction._id),
    });

    res.json({ success: true, order });
  } catch (err) {
    console.error("Payment Error:", err.message);
    res.json({ success: false, message: err.message });
  }
};

export { clerkWebHooks, userCredits, paymentRazorpay };
