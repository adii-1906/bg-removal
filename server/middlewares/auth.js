import jwt from 'jsonwebtoken';

const authUser = async (req, res, next) => {
  try {
    const { token } = req.headers;
    if (!token) {
      return res.json({ success: false, message: 'Not Authorized. Login Again' });
    }

    const token_decode = jwt.decode(token);
    const clerkId = token_decode?.sub;

    if (!clerkId) {
      return res.json({ success: false, message: 'Invalid token: Clerk ID not found' });
    }

    req.clerkId = clerkId; // ✅ Save to request directly, not req.body

    next();
  } catch (error) {
    console.log("Auth Middleware Error:", error.message);
    res.json({ success: false, message: error.message });
  }
};

export default authUser;
