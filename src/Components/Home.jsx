import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function randomCode(length = 6) {
  return Math.random()
    .toString(36)
    .substring(2, 2 + length)
    .toUpperCase();
}

export default function Home() {
  const [joinCode, setJoinCode] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();

  function createRoom() {
    if (name.trim() === "") {
      alert("Please enter your name");
      return;
    }
    const newCode = randomCode();
    navigate(`/room/${newCode}?name=${encodeURIComponent(name.trim())}`);
  }

  function joinRoom() {
    if (joinCode.trim().length !== 6) {
      alert("Enter valid 6 character room code");
      return;
    }
    if (name.trim() === "") {
      alert("Please enter your name");
      return;
    }
    navigate(
      `/room/${joinCode.toUpperCase()}?name=${encodeURIComponent(name.trim())}`
    );
  }

  return (
    <div className="home-container">
      <h1>Music Room</h1>
      <input
        type="text"
        placeholder="Enter your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button onClick={createRoom}>Create Room</button>
      <div>
        <input
          type="text"
          placeholder="Enter Room Code"
          value={joinCode}
          maxLength={6}
          onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
        />
        <button onClick={joinRoom}>Join Room</button>
      </div>
    </div>
  );
}
