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
  const localSocket = useRef(null);
  const messagesEndRef = useRef(null);
  const chatRef = useRef(null);

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

  function handleScroll() {
    if (chatRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatRef.current;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight;

      if (isNearBottom) {
        setChatAutoScroll(true);
      } else {
        setChatAutoScroll(false);
      }
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
        color: "blue",
      },
    };
    localSocket.current.emit("send-message", newMessageObject);
  }

  return (
    <div>
      <div
        ref={chatRef}
        onScroll={handleScroll}
        style={{
          height: "150px",
          overflow: "scroll",
        }}
      >
        {messages.map((message) => {
          return (
            <div>
              <span
                style={{
                  color: message.user.color,
                }}
              >
                {message.user.username}:
              </span>
              <span>{message.text}</span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <div>
        <form method="post" onSubmit={handleSubmit}>
          <label>
            New message:
            <input name="textMessage" defaultValue="Some initial value" />
          </label>
          <button type="submit">Submit form</button>
        </form>
      </div>
    </div>
  );
}

export default App;
