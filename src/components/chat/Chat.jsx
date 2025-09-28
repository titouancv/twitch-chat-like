import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import MessageForm from "../message-form/MessageForm";
import Messages from "../messages/Messages";
import "./Chat.css";

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

function Chat() {
  const [messages, setMessages] = useState([]);
  const localSocket = useRef(null);

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

  function addNewMessage(newMessage) {
    setMessages((messages) => [...messages, newMessage]);
  }

  return (
    <>
      <div className="chat-header">
        <p>Chat du stream</p>
      </div>

      <div className="chat-box">
        <Messages messages={messages} />
        <MessageForm localSocket={localSocket} />
      </div>
    </>
  );
}

export default Chat;
