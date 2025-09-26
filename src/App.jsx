import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

import './App.css';

const CONNECTION_URL = 'wss://api.dev.stories.studio/';
const SOCKET_PATH = '/interview-test';
const SOCKET_TRANSPORTS = ['websocket'];

const connectSocket = () => {
  const socket = io(CONNECTION_URL, {
    transport: SOCKET_TRANSPORTS,
    path: SOCKET_PATH,
  });
  return socket;
};

function App() {
  const [messages, setMessages] = useState([]);
  const localSocket = useRef(null);
  const messagesEndRef = useRef(null)

  
  
  useEffect(() => {
    const socket = connectSocket();
    if (localSocket) {
      localSocket.current = socket;
      console.log(localSocket.current);
    }
    socket.on('new-message', (arg) => {
      addNewMessage(arg);
    });
    return () => {
      socket.close();
    };
  }, []);
  
  useEffect(() => {
    scrollToBottom()
  }, [messages]);
  
  function addNewMessage(newMessage) {
    setMessages((messages) => [...messages, newMessage])
  }
  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }
  
  function handleSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);

    const formJson = Object.fromEntries(formData.entries());

    let newMessageObject = {
      type: 'text',
      text: formJson.textMessage,
      user: {
        username: 'user',
        color: 'blue',
      },
    };
    localSocket.current.emit('send-message', newMessageObject);
  }

  return (
    <div>
      <div
        style={{
          height: '50px',
          overflow: 'scroll',
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
