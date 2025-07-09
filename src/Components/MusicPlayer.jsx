import React, { useEffect, useRef, useState } from "react";
import { ref, set, onValue } from "firebase/database";
import { db } from "../firebase";

const API_KEY = "AIzaSyDEZtFHGx4RgQdXMwlb0W_irbysMScEePk";

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
}

export default function MusicPlayer({ roomId }) {
  const playerRef = useRef(null);
  const [currentVideoId, setCurrentVideoId] = useState(null);
  const [currentTitle, setCurrentTitle] = useState("");
  const [input, setInput] = useState("");
  const [results, setResults] = useState([]);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

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

  // Track progress and duration
  useEffect(() => {
    let interval;
    if (playerRef.current) {
      interval = setInterval(() => {
        const currentTime = playerRef.current.getCurrentTime?.() || 0;
        const totalDuration = playerRef.current.getDuration?.() || 0;
        setProgress(currentTime);
        setDuration(totalDuration);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentVideoId]);

  function onPlayerStateChange(event) {
    // Optional: handle buffering/play/pause if needed
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

  function handleSeekClick(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const percent = clickX / width;
    const seekTime = percent * duration;
    playerRef.current.seekTo(seekTime, true);
    setProgress(seekTime);
  }

  return (
    <div className="music-player" style={{ padding: "16px", maxWidth: "400px", margin: "0 auto" }}>
      <div id="player"></div>

      <input
        type="text"
        placeholder="Search YouTube song..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && searchYouTube()}
        style={{ width: "100%", padding: "8px", marginBottom: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
      />
      <button onClick={searchYouTube} style={{ padding: "8px 12px", marginBottom: "12px" }}>Search</button>

      {currentVideoId && (
        <>
          <div style={{ marginTop: "10px", fontWeight: "bold" }}>
            Now Playing: {currentTitle}
          </div>

          {duration > 0 && (
            <div
              style={{ marginTop: "10px", width: "100%", cursor: "pointer" }}
              onClick={handleSeekClick}
            >
              <div
                style={{
                  height: "8px",
                  background: "#ddd",
                  borderRadius: "4px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${(progress / duration) * 100}%`,
                    height: "100%",
                    background: "#4caf50",
                    transition: "width 0.25s linear",
                  }}
                ></div>
              </div>
              <div style={{ fontSize: "12px", marginTop: "4px", textAlign: "center" }}>
                {formatTime(progress)} / {formatTime(duration)}
              </div>
            </div>
          )}
        </>
      )}

      {results.length > 0 && (
        <div style={{ marginTop: "12px" }}>
          <h4>Search Results:</h4>
          {results.map((item) => (
            <div key={item.id.videoId} style={{ marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "14px" }}>{item.snippet.title}</span>
              <button
                onClick={() => playVideo(item.id.videoId, item.snippet.title)}
                style={{ padding: "4px 8px", fontSize: "12px" }}
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
