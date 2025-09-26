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
        color: "red",
      },
    };
    localSocket.current.emit("send-message", newMessageObject);
  }

  return (
    <div
      style={{
        height: "100%",
        alignItems: "center",
      }}
    >
      <div
        style={{
          textAlign: "center",
          backgroundColor: "#18181b",
          borderBottom: "1px solid #8f8f8fff",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <p
          style={{
            color: "white",
            fontWeight: "bold",
            marginBlock: "8px",
          }}
        >
          Chat du stream
        </p>
      </div>
      <div
        style={{
          width: "300px",
          height: "100%",
          backgroundColor: "#18181b",
          padding: "8px",
        }}
      >
        <div
          ref={chatRef}
          onScroll={handleScroll}
          style={{
            height: "600px",
            display: "flex",
            paddingInline: "8px",
            flexDirection: "column",
            alignItems: "start",
            overflow: "scroll",
          }}
        >
          {messages.map((message) => {
            return (
              <div
                key={message.id}
                style={{
                  textAlign: "left",
                }}
              >
                <p style={{ color: "white", marginBlock: "2px" }}>
                  <span
                    style={{
                      color: message.user.color,
                      fontWeight: "bold",
                    }}
                  >
                    {message.user.username + ": "}
                  </span>
                  <span>{message.text}</span>
                </p>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
        <div>
          <form
            method="post"
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "end",
              gap: "8px",
            }}
          >
            <div
              style={{
                display: "flex",
                borderRadius: "4px",
                height: "32px",
                width: "100%",
              }}
            >
              <input
                name="textMessage"
                placeholder="Envoyer a message"
                style={{
                  backgroundColor: "transparent",
                  border: "1px solid #d4d4d9",
                  borderRadius: "4px",
                  width: "100%",
                }}
              />
            </div>
            <button
              type="submit"
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#9146ff",
                height: "32px",
              }}
            >
              Chat
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
