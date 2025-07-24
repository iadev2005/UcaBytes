import React, { useState, useRef, useEffect } from "react";

interface ChatModalProps {
  section: string;
  onClose: () => void;
}

interface Message {
  sender: "user" | "ia";
  text: string;
}

const ChatModal: React.FC<ChatModalProps> = ({ section, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { sender: "user", text: input };
    setMessages((msgs) => [...msgs, userMsg]);
    setLoading(true);

    try {
      // Llama a tu backend, ajusta la URL según tu configuración
      const res = await fetch("http://localhost:3001/api/ia-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: input,
          section,
        }),
      });
      const data = await res.json();
      setMessages((msgs) => [
        ...msgs,
        { sender: "ia" as const, text: data.answer || "Sin respuesta de la IA." },
      ]);
    } catch (e) {
      setMessages((msgs) => [
        ...msgs,
        { sender: "ia" as const, text: "Error al conectar con la IA." },
      ]);
    }
    setInput("");
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 90,
        right: 24,
        width: 400,
        maxHeight: 500,
        background: "var(--color-background)",
        borderRadius: 16,
        boxShadow: "0 4px 24px rgba(62,146,238,0.12)",
        zIndex: 1001,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        fontFamily: "var(--font-syne)",
        border: "1.5px solid var(--color-primary-100)",
      }}
    >
      <div
        style={{
          padding: "14px 20px",
          background: "var(--color-primary-600)",
          color: "#fff",
          fontWeight: 700,
          fontFamily: "var(--font-syne)",
          fontSize: 18,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        Chat IA
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "#fff",
            fontSize: 22,
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          ×
        </button>
      </div>
      <div
        style={{
          flex: 1,
          padding: 18,
          overflowY: "auto",
          background: "var(--color-primary-50)",
        }}
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              marginBottom: 14,
              textAlign: msg.sender === "user" ? "right" : "left",
            }}
          >
            <span
              style={{
                display: "inline-block",
                background: msg.sender === "user" ? "var(--color-primary-400)" : "#fff",
                color: msg.sender === "user" ? "#fff" : "var(--color-text)",
                borderRadius: 10,
                padding: "10px 14px",
                maxWidth: "80%",
                wordBreak: "break-word",
                fontFamily: "var(--font-syne)",
                fontSize: 20,
                boxShadow: msg.sender === "user" ? "0 1px 4px rgba(62,146,238,0.10)" : "0 1px 4px rgba(0,0,0,0.04)",
              }}
            >
              {msg.text}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div style={{ padding: 14, borderTop: "1px solid var(--color-primary-100)", background: "#fff" }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
          placeholder="Escribe tu pregunta..."
          style={{
            width: "100%",
            borderRadius: 8,
            border: "1.5px solid var(--color-primary-200)",
            padding: 10,
            resize: "none",
            fontSize: 15,
            fontFamily: "var(--font-syne)",
            background: "var(--color-primary-50)",
            color: "var(--color-text)",
            outline: "none",
          }}
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          style={{
            marginTop: 10,
            width: "100%",
            background: "var(--color-primary-600)",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "10px 0",
            fontWeight: 700,
            fontFamily: "var(--font-syne)",
            fontSize: 16,
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow: "0 1px 4px rgba(62,146,238,0.10)",
            transition: "background 0.2s",
            opacity: loading || !input.trim() ? 0.7 : 1,
          }}
        >
          {loading ? "Enviando..." : "Enviar"}
        </button>
      </div>
    </div>
  );
};

export default ChatModal; 