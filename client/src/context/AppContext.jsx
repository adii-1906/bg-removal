import { useAuth } from "@clerk/clerk-react";
import { createContext, useState } from "react";
import axios from 'axios'
import { toast } from 'react-toastify'

export const AppContext = createContext()

const AppContextProvider = (props) => {

    const [credit, setCredit] = useState(false)
    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const { getToken } = useAuth()

    const loadCreditsData = async () => {
  try {
    const token = await getToken();
console.log("Token:", token); // ✅ This part is correct

const { data } = await axios.get(`${backendUrl}/api/user/credits`, {
  headers: { token }
});


    console.log("API Response:", data);

    if (data.success) {
      setCredit(data.credits);
      console.log("Credits Set: ", data.credits);
    }

  } catch (error) {
    console.log("API Error: ", error);
    toast.error(error.message);
  }
};


    const value = {
        credit,setCredit,
        loadCreditsData,
        backendUrl
    }

    return(
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )

}

export default AppContextProvider