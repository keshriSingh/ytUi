import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosClient from "../utils/axiosClient";

export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post("/user/register", userData);
      return response.data?.data;
    } catch (error) {
      return rejectWithValue({
        message: error.message,
        status: error.response?.status,
      });
    }
  }
);

export const loginUser = createAsyncThunk(
  "/auth/login",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post("/user/login", userData);
      return response.data?.data;
    } catch (error) {
      return rejectWithValue({
        message: error.message,
        status: error.response?.status,
      });
    }
  }
);

export const checkAuth = createAsyncThunk(
  "/auth/check",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get("/user/check");
      return response.data?.data;
    } catch (error) {
      return rejectWithValue({
        message: error.message,
        status: error.response?.status,
      });
    }
  }
);

export const logoutUser = createAsyncThunk(
  "/auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get("/user/logout");
      return response.data?.data;
    } catch (error) {
      return rejectWithValue({
        message: error.message,
        status: error.response?.status,
      });
    }
  }
);

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
    builder
      //registerUser
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = !!action.payload;
        state.user = action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Something went wrong";
        (state.isAuthenticated = false), (state.user = null);
      })

      //loginUser
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        (state.loading = false), (state.user = action.payload);
        state.isAuthenticated = !!action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Something went wrong";
        state.isAuthenticated = false;
        state.user = null;
      })

      //logoutUser
      .addCase(logoutUser.pending, (state) => {
        (state.loading = true), (state.error = null);
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.error = action.payload?.message || "Something went wrong";
        state.isAuthenticated = false;
      })

      //checkAuth
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
        state.isAuthenticated = !!action.payload;
      })
      .addCase(checkAuth.rejected, (state) => {
        // state.error = action.payload?.message || "Something went wrong";
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
      });
  },
});

export default authSlice.reducer;
