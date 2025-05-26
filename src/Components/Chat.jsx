import React, { useEffect, useState, useRef } from "react";
import { ref, push, onChildAdded } from "firebase/database";
import { db } from "../firebase";

export default function Chat({ roomId, username }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const messagesRef = ref(db, `rooms/${roomId}/chat`);
    setMessages([]);

    const unsubscribe = onChildAdded(messagesRef, (snapshot) => {
      const msg = snapshot.val();
      setMessages((prev) => [...prev, msg]);
      scrollToBottom();
    });

    return () => {
      // No explicit unsubscribe needed for onChildAdded,
      // but could use off() if wanted
    };
  }, [roomId]);

  function sendMessage() {
    if (input.trim() === "") return;
    const messagesRef = ref(db, `rooms/${roomId}/chat`);
    push(messagesRef, {
      text: input,
      username, // Save username with message
      timestamp: Date.now(),
    });
    setInput("");
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className="message">
            <strong>{msg.username || "Guest"}: </strong>
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <input
        type="text"
        placeholder="Say something..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}
