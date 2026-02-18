import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";



export default function FaceAuth() {
const API = "https://face-auth-backend.onrender.com";

  const videoRef = useRef();
  const [name, setName] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/models";
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
      startVideo();
      setLoaded(true);
    };
    loadModels();
  }, []);

  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        videoRef.current.srcObject = stream;
      });
  };

  const register = async () => {
    const detection = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) return alert("Face not detected");

    await fetch(`${API}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        descriptor: Array.from(detection.descriptor)
      }),
    });

    alert("Face Registered Successfully");
  };

  const login = async () => {
    const detection = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) return alert("Face not detected");

    const res = await fetch(`${API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        descriptor: Array.from(detection.descriptor)
      }),
    });

    const data = await res.json();
    alert(data.msg);
  };

  return (
    <div style={{ textAlign: "center", padding: 20 }}>
      <h2>Face Register & Login</h2>

      <video ref={videoRef} autoPlay width="400" height="300" />

      <br />

      <input
        placeholder="Enter Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <br /><br />

      <button onClick={register} disabled={!loaded}>Register</button>
      <button onClick={login} disabled={!loaded}>Login</button>
    </div>
  );
}
