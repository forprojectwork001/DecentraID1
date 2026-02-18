import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

export default function FaceAuth() {
  const API = "https://decentraid-10.onrender.com";

  const videoRef = useRef(null);
  const [name, setName] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  // Load models
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = "/models";

        await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);

        await startVideo();
        setLoaded(true);
      } catch (err) {
        console.error("Model loading error:", err);
        alert("Error loading face models");
      }
    };

    loadModels();
  }, []);

  // Start camera
  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setCameraReady(true);
    } catch (err) {
      console.error("Camera error:", err);
      alert("Camera access denied");
    }
  };

  // Detect face function (used by register & login)
  const detectFace = async () => {
    if (!videoRef.current) return null;

    const detection = await faceapi
      .detectSingleFace(videoRef.current)
      .withFaceLandmarks()
      .withFaceDescriptor();

    return detection;
  };

  // Register
  const register = async () => {
    if (!name) {
      alert("Enter your name");
      return;
    }

    const detection = await detectFace();

    if (!detection) {
      alert("Face not detected. Move closer & ensure good lighting.");
      return;
    }

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

  // Login
  const login = async () => {
    const detection = await detectFace();

    if (!detection) {
      alert("Face not detected. Move closer & ensure good lighting.");
      return;
    }

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
    <div style={{ textAlign: "center", padding: 20,backgroundColor:"orange" }}>
      <h2>Face Register & Login</h2>

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        width="400"
        height="300"
        style={{ borderRadius: "10px", border: "2px solid #333" }}
      />

      <br /><br />

      <input
        placeholder="Enter Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ padding: 8 }}
      />

      <br /><br />

      <button onClick={register} style={{backgroundColor:"white"}} disabled={!loaded || !cameraReady}>
        Register
      </button>

      <button onClick={login} style={{backgroundColor:"white"}} disabled={!loaded || !cameraReady}>
        Login
      </button>
    </div>
  );
}
