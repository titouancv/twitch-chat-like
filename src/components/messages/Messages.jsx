import React, { useEffect, useRef, useState, useCallback } from "react";

import "./Messages.css";

function Messages({ messages }) {
  const [chatAutoScroll, setChatAutoScroll] = useState(true);
  const [scrollAlertHover, setScrollAlertHover] = useState(false);
  const messagesEndRef = useRef(null);
  const lastScrollTop = useRef(0);

  const scrollToBottom = useCallback(() => {
    if (!chatAutoScroll) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatAutoScroll]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  function handleScroll(event) {
    const currentScrollTop = event.target.scrollTop;

    if (currentScrollTop > lastScrollTop.current) {
      setChatAutoScroll(true);
    } else {
      setChatAutoScroll(false);
    }
    lastScrollTop.current = currentScrollTop;
  }

  return (
    <div style={{ position: "relative" }}>
      <div onScroll={handleScroll} className="chat-messages">
        {messages.map((message) => (
          <div key={message.id} className="chat-message">
            <p>
              <span
                className="chat-message-username"
                style={{ color: message.user.color }}
              >
                {message.user.username + ": "}
              </span>
              <span>{message.text}</span>
            </p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {!chatAutoScroll && (
        <div
          className="scroll-alert"
          onClick={() => {
            setChatAutoScroll(true);
            setScrollAlertHover(false);
          }}
          onMouseEnter={() => setScrollAlertHover(true)}
          onMouseLeave={() => setScrollAlertHover(false)}
        >
          {scrollAlertHover
            ? "Reprendre le défilement"
            : "Chat mis en pause à cause du défilement"}
        </div>
      )}
    </div>
  );
}

export default Messages;
