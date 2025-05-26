import React, { useEffect, useRef, useState } from "react";
import { ref, set, onValue } from "firebase/database";
import { db } from "../firebase";

const API_KEY = "AIzaSyDEZtFHGx4RgQdXMwlb0W_irbysMScEePk";

export default function MusicPlayer({ roomId }) {
  const playerRef = useRef(null);
  const [currentVideoId, setCurrentVideoId] = useState(null);
  const [currentTitle, setCurrentTitle] = useState("");
  const [input, setInput] = useState("");
  const [results, setResults] = useState([]);

  // Load YouTube iFrame API script
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    }
  }, []);

  // Initialize player after API ready
  useEffect(() => {
    function onYouTubeIframeAPIReady() {
      playerRef.current = new window.YT.Player("player", {
        height: "0",
        width: "0",
        playerVars: {
          autoplay: 1,
          controls: 0,
          modestbranding: 1,
        },
        events: {
          onReady: (event) => {
            if (currentVideoId) {
              event.target.loadVideoById(currentVideoId);
            }
          },
          onStateChange: onPlayerStateChange,
        },
      });
    }

    if (window.YT && !playerRef.current) {
      onYouTubeIframeAPIReady();
    } else {
      window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
    }
  }, [currentVideoId]);

  // Sync currentVideoId and title from Firebase
  useEffect(() => {
    const videoRef = ref(db, `rooms/${roomId}/currentSong`);
    onValue(videoRef, (snapshot) => {
      const data = snapshot.val();
      if (data?.videoId && data.videoId !== currentVideoId) {
        setCurrentVideoId(data.videoId);
        setCurrentTitle(data.title || "Unknown");
        if (playerRef.current) {
          playerRef.current.loadVideoById(data.videoId);
        }
      }
    });
  }, [roomId, currentVideoId]);

  function onPlayerStateChange(event) {
    // Optional: handle buffering/play/pause etc
  }

  async function searchYouTube() {
    if (!input.trim()) return;
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=5&q=${encodeURIComponent(
        input
      )}&key=${API_KEY}`
    );
    const data = await res.json();
    setResults(data.items || []);
  }

  function playVideo(videoId, title) {
    set(ref(db, `rooms/${roomId}/currentSong`), {
      videoId,
      title,
    });
    setResults([]);
    setInput("");
  }

  return (
    <div className="music-player">
      <div id="player"></div>

      <input
        type="text"
        placeholder="Search YouTube song..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && searchYouTube()}
      />
      <button onClick={searchYouTube}>Search</button>

      {currentVideoId && (
        <div style={{ marginTop: "10px" }}>
          <strong>Now Playing:</strong> {currentTitle}
        </div>
      )}

      {results.length > 0 && (
        <div style={{ marginTop: "10px" }}>
          <h4>Search Results:</h4>
          {results.map((item) => (
            <div key={item.id.videoId} style={{ marginBottom: "8px" }}>
              <span>{item.snippet.title}</span>
              <button
                onClick={() => playVideo(item.id.videoId, item.snippet.title)}
              >
                Play
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
