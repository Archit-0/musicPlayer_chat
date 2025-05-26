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
  const navigate = useNavigate();

  function createRoom() {
    const newCode = randomCode();
    navigate(`/room/${newCode}`);
  }

  function joinRoom() {
    if (joinCode.trim().length === 6) {
      navigate(`/room/${joinCode.toUpperCase()}`);
    } else {
      alert("Enter valid 6 character room code");
    }
  }

  return (
    <div className="home-container">
      <h1>Music Room</h1>
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
