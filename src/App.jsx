import React, { useEffect, useRef, useState, useCallback } from "react";
import io from "socket.io-client";

import "./App.css";

const CONNECTION_URL = "wss://api.dev.stories.studio/";
const SOCKET_PATH = "/interview-test";
const SOCKET_TRANSPORTS = ["websocket"];

const connectSocket = () => {
  const socket = io(CONNECTION_URL, {
    transport: SOCKET_TRANSPORTS,
    path: SOCKET_PATH,
  });
  return socket;
};

function App() {
  const [messages, setMessages] = useState([]);
  const [chatAutoScroll, setChatAutoScroll] = useState(true);
  const [scrollAlertHover, setScrollAlertHover] = useState(false);
  const localSocket = useRef(null);
  const messagesEndRef = useRef(null);
  const chatRef = useRef(null);
  const lastScrollTop = useRef(0);

  useEffect(() => {
    const socket = connectSocket();
    if (localSocket) {
      localSocket.current = socket;
    }
    socket.on("new-message", (arg) => {
      addNewMessage(arg);
    });

    return () => {
      socket.close();
    };
  }, []);

  const scrollToBottom = useCallback(() => {
    if (!chatAutoScroll) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatAutoScroll]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  function handleScroll(event) {
    if (chatRef.current) {
      const currentScrollTop = event.target.scrollTop;

      if (currentScrollTop > lastScrollTop.current) {
        setChatAutoScroll(true);
      } else {
        setChatAutoScroll(false);
      }
      lastScrollTop.current = currentScrollTop;
      console.log(chatAutoScroll);
    }
  }

  function addNewMessage(newMessage) {
    setMessages((messages) => [...messages, newMessage]);
  }

  function handleSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);

    const formJson = Object.fromEntries(formData.entries());

    let newMessageObject = {
      type: "text",
      text: formJson.textMessage,
      user: {
        username: "user",
        color: "red",
      },
    };
    localSocket.current.emit("send-message", newMessageObject);
    form.reset();
  }

  return (
    <div className="app-container">
      <div className="chat-header">
        <p>Chat du stream</p>
      </div>

      <div className="chat-box">
        <div style={{ position: "relative" }}>
          <div ref={chatRef} onScroll={handleScroll} className="chat-messages">
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

        <div>
          <form method="post" onSubmit={handleSubmit} className="chat-form">
            <div className="chat-input-container">
              <input
                name="textMessage"
                placeholder="Envoyer un message"
                className="chat-input"
              />
            </div>
            <button type="submit" className="chat-button">
              Chat
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
