import { useEffect, useState, useRef } from "react";
import "./App.css";

const API_URL = "http://localhost:5000/api/chat";

function App() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    async function loadHistory() {
      try {
        const response = await fetch(`${API_URL}/history`);

        if (!response.ok) {
          // return
          throw new Error("Couldn't fetch the history");
        }

        const data = await response.json();
        setMessages(data.History || []);
      } catch (error) {
        // console.log(error)
        console.error(error);
        setError("Couldn't load history");
      }
    }
    loadHistory();
  }, []);


  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);


  async function handleSubmit(event) {
    event.preventDefault();

    const text = question.trim();
    
    if (!text || loading) return;

    setError("");
    setQuestion("");

    setMessages((previous) => [
      ...previous,
      { role: "user", text }
    ]);

    setLoading(true);
  
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text })
      })

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Soemthing went wrong");
      }

      setMessages((previous) => [
        ...previous,
        { role: "assistant", text: data.answer }
      ]);
    
    } catch (err) {
      console.error(err);
      setError(err.message || "Couldn't connect to Healthify");
    } finally {
      setLoading(false);
    }
  }

  function clearDisplay() {
    setMessages([]);
    setError("");
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand-icon">+</div>

          <div>
            <h1>Healthify</h1>
            <p>Your AI health information assistant </p>
          </div>
      </header>
      
      <main className="layout">
        <aside className="sidebar">
          <h2>Welcome to Healthify</h2>
          <p>Ask questions about nutrition, exercise, sleep,
          wellness, and general health.</p>
          
          <div className="notice">
            <strong>Important health notice</strong>
            <p>Healthify provides general information, not medical
              diagnoses. Consult a qualified healthcare professional
              for personal medical advice.</p>
          </div>

          <button
            type="button"
            className="clear-button"
            onClick={clearDisplay}>
            Clear chat display
          </button>
        </aside>

        <section className="chat-panel">
          <div className="chat-header">
            <h1>AI Health Assistant</h1>
            <p>Ask a question and get an AI-generated response.</p>
          </div>

          <div className="messages">
            {messages.length === 0 && (
              <div className="welcome">
                <div className="welcome-icon">♥</div>
                <h3>How can I help you today?</h3>
                <p>Start by asking Healthify a general health question.</p>
              </div>
            )}
            {messages.map((item, index) => (
              <div
                key={`${index}-${item.role}`}
                className={`message-row ${item.role}`}>
                
                <div className="message">
                  <strong>
                    {item.role === "user" ? "you" : "Healthify AI"}
                  </strong>
                  <p>{item.text}</p>
                </div>
              </div>
            ))}
              
            {loading && (
              <div className="message-row assistant">
                <div className="message loading-message">
                  <strong>Healthify AI</strong>
                  <p>Thinking...</p>
                </div>
              </div>
            )}
            
            <div ref = {bottomRef}></div>
          </div>

          {error && (
            <p className="error-message" role="alert">
              {error}
            </p>
          )}

          <form className="chat-form" onSubmit={handleSubmit}>
            <label htmlFor="question">Your Question</label>

            <textarea
              id="question"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Ask about health, nutrition, sleep..."
              rows={3}
              maxLength={5000}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  !event.shiftKey &&
                  !event.nativeEvent.isComposing
                ) {
                  event.preventDefault();
                  event.currentTarget.form.requestSubmit();
                }
            }}>
            </textarea>

            <div className="form-footer">
              <span>Enter to send • Shift + Enter for a new line</span>
              
              <button
                type="submit"
                className="send-button"
                disabled={loading || !question.trim()}>
                
                {loading ? "Thiking..." : "Send question"}

              </button>
            </div>
          </form>
        </section>
      </main>

      <footer className="app-footer">
      Healthify AI · For general health information only
      </footer>
  </div>

);
}

export default App;
