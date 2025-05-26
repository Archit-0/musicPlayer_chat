import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ref, onValue, set } from "firebase/database";
import { db } from "../firebase";
import Chat from "./Chat";
import MusicPlayer from "./MusicPlayer";

export default function Room() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [roomExists, setRoomExists] = useState(true);

  // Get username from URL query ?name=...
  const username = new URLSearchParams(location.search).get("name") || "Guest";

  useEffect(() => {
    const roomRef = ref(db, `rooms/${roomId}`);

    onValue(roomRef, (snapshot) => {
      if (!snapshot.exists()) {
        set(roomRef, { createdAt: Date.now(), currentSong: null });
      }
      setRoomExists(true);
    });
  }, [roomId]);

  if (!roomExists) return <h2>Room not found</h2>;

  return (
    <div className="room-container">
      <h2>Room: {roomId}</h2>
      <MusicPlayer roomId={roomId} />
      <Chat roomId={roomId} username={username} />
      <button onClick={() => navigate("/")}>Exit Room</button>
    </div>
  );
}
