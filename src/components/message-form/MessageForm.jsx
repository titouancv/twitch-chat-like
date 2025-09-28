import "./MessageForm.css";

function MessageForm({ localSocket }) {
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
    <div>
      <form method="post" onSubmit={handleSubmit} className="message-form">
        <div className="message-input-container">
          <input
            name="textMessage"
            placeholder="Envoyer un message"
            className="message-input"
          />
        </div>
        <button type="submit" className="message-button">
          Chat
        </button>
      </form>
    </div>
  );
}

export default MessageForm;
