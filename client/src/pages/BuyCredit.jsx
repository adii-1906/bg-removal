import React from 'react'
import { assets, plans } from '../assets/assets'
import { useContext } from 'react'
import { AppContext } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import { toast } from 'react-toastify'
import axios from 'axios'

const BuyCredit = () => {

  const { backendUrl, loadCreditsData } = useContext(AppContext)
  const navigate = useNavigate()
  const { getToken } = useAuth()

  const initPay = async (order) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID, // ✅ Fixed env var
      amount: order.amount,
      currency: order.currency,
      name: 'Credit Purchase',
      description: 'Buying credits',
      order_id: order.id,
      handler: function (response) {
        console.log('Payment successful:', response);
        toast.success("Payment successful!");
      },
      prefill: {
        name: "Aditi Priya",
        email: "aditipriya460@gmail.com@example.com"
      },
      theme: {
        color: "#6366f1"
      }
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Error opening Razorpay:", err);
      toast.error("Failed to open Razorpay popup.");
    }
  };

  const paymentRazorpay = async (planId) => {
    try {
      const token = await getToken();
      const { data } = await axios.post(
        `${backendUrl}/api/user/pay-razor`,
        { planId },
        { headers: { token } }
      );

      if (data.success) {
        console.log("Order from backend:", data.order);
        initPay(data.order);
      } else {
        toast.error("Payment failed: " + data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Error in payment: " + err.message);
    }
  };



  return (
    <div className='min-h-[80vh] text-center pt-14 mb-10'>
      <h1 className='text-3xl font-semibold mb-6'>Choose a Plan</h1>
      <div className='flex flex-wrap justify-center gap-6 text-left'>
        {plans.map((item, index) => (
          <div key={index} className='bg-white p-6 rounded shadow hover:scale-105 transition'>
            <img width={40} src={assets.logo_icon} alt="Plan" />
            <h2 className='font-semibold mt-2'>{item.id}</h2>
            <p className='text-sm'>{item.desc}</p>
            <p className='mt-4'>
              <span className='text-2xl font-bold'>${item.price}</span> / {item.credits} credits
            </p>
            <button
              className='mt-4 bg-black text-white px-4 py-2 rounded w-full'
              onClick={() => paymentRazorpay(item.id)}
            >
              Purchase
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BuyCredit
