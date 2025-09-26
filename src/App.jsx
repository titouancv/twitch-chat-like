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
  // onAny subscribes to every events
  /*
  socket.onAny((...args) => {
    console.log(...args);
  });
   */
  return socket;
};

function App() {
  const [messages, setMessages] = useState([]);
  const localSocket = useRef(null);

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

  function addNewMessage(newMessage) {
    setMessages((messages) => [...messages, newMessage])
  }

  function handleSubmit(e) {
    // Prevent the browser from reloading the page
    e.preventDefault();

    // Read the form data
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

    console.log(newMessageObject);
    localSocket.current.emit('send-message', newMessageObject);
  }

  return (
    <div>
      <div
        style={{
          height: '250px',
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
