import { useState } from "react";
import ChatModal from "./ChatModal";
import { ChatIcon } from "../icons";

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
          background: "var(--color-primary-600)",
          color: "#fff",
          fontSize: 28,
          border: "none",
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background 0.2s"
        }}
        onMouseOver={e => (e.currentTarget.style.background = "var(--color-primary-700)")}
        onMouseOut={e => (e.currentTarget.style.background = "var(--color-primary-600)")}
        onClick={() => setOpen(true)}
        aria-label="Abrir chat IA"
      >
        <ChatIcon style={{ width: 32, height: 32, color: "#fff" }} />
      </button>
      {open && <ChatModal section={section} onClose={() => setOpen(false)} />}
    </>
  );
};

export default ChatButton; 