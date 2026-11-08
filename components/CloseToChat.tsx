"use client";

import { useEffect, useState } from "react";
import { closeToChat, inLineApp } from "@/app/liff";

// The way out of a page: closes the LIFF window back to the chat. Renders nothing outside LINE (there is no chat to return to).
export default function CloseToChat({ className = "btn-primary", children = "กลับไปที่แชท" }: { className?: string; children?: React.ReactNode }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    inLineApp().then(setShow);
  }, []);
  if (!show) return null;
  return (
    <button type="button" onClick={closeToChat} className={className}>
      {children}
    </button>
  );
}
