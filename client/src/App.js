import React, { useState, useEffect, useRef } from "react";
import "./App.css";

export default function App() {
    const [messages, setMessages] = useState(() => {
        const cachedMessages = localStorage.getItem("chatMessages");
        return cachedMessages ? JSON.parse(cachedMessages) : [];
    });
    const [input, setInput] = useState("");
    const messagesEndRef = useRef(null);
    const [isTyping, setIsTyping] = useState(false);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        localStorage.setItem("chatMessages", JSON.stringify(messages));
    }, [messages]);

    const formatMessage = (text) => {
        return text.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
                   .replace(/```(\w+)?\n([\s\S]+?)\n```/g, (match, lang, code) => 
                       `<pre class='code-block'><code>${code}</code></pre> `
                   )
                   .replace(/`([^`]+)`/g, (match, code) => `<code>${code}</code> `)
                   .replace(/\n/g, "<br>");
    };

    const sendMessage = async () => {
        if (!input.trim()) return;
        const newMessages = [...messages, { text: input, sender: "user" }];
        setMessages(newMessages);
        setInput("");

        setIsTyping(true);

        setTimeout(async () => {
            try {
                const response = await fetch("http://localhost:5000/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ message: input }),
                });

                const data = await response.json();
                setMessages([...newMessages, { text: formatMessage(data.response), sender: "bot" }]);
            } catch (error) {
                console.error(error);
                setMessages([...newMessages, { text: "Error: Could not fetch response", sender: "bot" }]);
            } finally {
                setIsTyping(false);
            }
        }, 1000);
    };

    const clearChat = () => {
        setMessages([]);
        localStorage.removeItem("chatMessages");
    };

    return (
        <div className="chat-container" style={{ backgroundColor: "#1e1e2e", color: "#ffffff", maxWidth: "600px", margin: "auto", borderRadius: "10px", padding: "15px", overflow: "hidden" }}>
            <h1 className="chat-title" style={{ textAlign: "center", color: "#ff9800" }}>💬 Chat with CHAT-AI</h1>
            
            <div className="chat-box" style={{ height: "400px", overflowY: "auto", padding: "10px", backgroundColor: "#282a36", borderRadius: "8px" }}>
                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.sender}`} style={{ backgroundColor: msg.sender === "user" ? "#4caf50" : "#3f51b5", color: "#fff", padding: "8px", borderRadius: "5px", marginBottom: "5px", wordWrap: "break-word" }} dangerouslySetInnerHTML={{ __html: msg.text }} />
                ))}
                {isTyping && (
                    <div className="message bot typing" style={{ backgroundColor: "#3f51b5", color: "#fff", padding: "8px", borderRadius: "5px", marginBottom: "5px" }}>
                        <span>.</span><span>.</span><span>.</span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-container" style={{ display: "flex", marginTop: "10px" }}>
                <input
                    type="text"
                    className="chat-input"
                    placeholder="Type a message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    style={{ flex: "1", padding: "10px", borderRadius: "5px", border: "none", backgroundColor: "#3a3f4b", color: "#fff" }}
                />
                <button className="send-btn" onClick={sendMessage} style={{ marginLeft: "10px", padding: "10px 15px", borderRadius: "5px", border: "none", backgroundColor: "#ff9800", color: "#fff", cursor: "pointer" }}>Send➤</button>
                <button className="clear-btn" onClick={clearChat} style={{ marginLeft: "10px", padding: "10px 15px", borderRadius: "5px", border: "none", backgroundColor: "#d32f2f", color: "#fff", cursor: "pointer" }}>🗑️ Clear Chat</button>
            </div>
        </div>
    );
}