import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ref, onValue, set, push, remove } from "firebase/database";
import { db } from "../firebase";
import Chat from "./Chat";
import MusicPlayer from "./MusicPlayer";

export default function Room() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [roomExists, setRoomExists] = useState(true);

  useEffect(() => {
    // Check if room exists in db, if not create empty
    const roomRef = ref(db, `rooms/${roomId}`);
    onValue(roomRef, (snapshot) => {
      if (!snapshot.exists()) {
        // Create room entry
        set(roomRef, { createdAt: Date.now(), currentSong: null });
      }
      setRoomExists(true);
    });

    return () => {
      // Optional: remove room data if empty (not implemented here)
    };
  }, [roomId]);

  if (!roomExists) return <h2>Room not found</h2>;

  return (
    <div className="room-container">
      <h2>Room: {roomId}</h2>
      <MusicPlayer roomId={roomId} />
      <Chat roomId={roomId} />
      <button onClick={() => navigate("/")}>Exit Room</button>
    </div>
  );
}
