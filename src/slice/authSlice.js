import {
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";
import axiosClient from "../utils/axiosClient";

export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
        const response = await axiosClient.post('/user/register',userData);
        return response.data?.data
    } catch (error) {
      return rejectWithValue({
        message: error.message,
        status: error.response?.status
      });
    }
  }
);

export const loginUser = createAsyncThunk("/auth/login",async(userData,{ rejectWithValue })=>{
    try {
        const response = await axiosClient.post('/user/login',userData);
        return response.data?.data
    } catch (error) {
         return rejectWithValue({
        message: error.message,
        status: error.response?.status
      });
    }
})

export const logoutUser = createAsyncThunk("/auth/logout",async(userData,{ rejectWithValue })=>{
    try {
        const response = await axiosClient.get("/user/logout",userData);
        return response.data?.data
    } catch (error) {
         return rejectWithValue({
        message: error.message,
        status: error.response?.status
      });
    }
})

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase();
  },
});

export default authSlice.reducer;
