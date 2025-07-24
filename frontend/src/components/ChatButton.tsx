import React, { useState } from "react";
import ChatModal from "./ChatModal";

const ChatButton: React.FC<{ section: string }> = ({ section }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 1000,
          borderRadius: "50%",
          width: 56,
          height: 56,
          background: "#222",
          color: "#fff",
          fontSize: 28,
          border: "none",
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          cursor: "pointer",
        }}
        onClick={() => setOpen(true)}
        aria-label="Abrir chat IA"
      >
        💬
      </button>
      {open && <ChatModal section={section} onClose={() => setOpen(false)} />}
    </>
  );
};

export default ChatButton; 