import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000",
});

export const registerFace = (data) => API.post("/register", data);
export const loginFace = (data) => API.post("/login", data);
