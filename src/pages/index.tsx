import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import dynamic from "next/dynamic";
// Dynamically import react-qr-barcode-scanner
const QrReader = dynamic(() => import("react-qr-barcode-scanner"), {
  ssr: false,
});

const x = process.env.NEXT_PUBLIC_BE_URL;

const socket = io(x, {
  transports: ["websocket", "polling"],
});

export default function BarcodeScanner() {
  const [messages, setMessages] = useState<string[]>([]);
  const [scannedData, setScannedData] = useState<string | null>(null);

  useEffect(() => {
    // Listen to events from the backend
    socket.on("barcodeResponse", (data) => {
      setMessages((prev) => [...prev, data.message]);
    });

    return () => {
      // socket.disconnect();
    };
  }, []);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && e.currentTarget.value.trim()) {
      const barcode = e.currentTarget.value.trim(); // Get the scanned barcode
      socket.emit("barcodex", { barcode }); // Send to backend
      e.currentTarget.value = ""; // Clear the input field for the next scan
    }
  };

  const handleScan = (data: string | null) => {
    if (data) {
      setScannedData(data);
      console.log("Scanned Data:", data);
      socket.emit("barcodex", { barcode: data });
    }
  };

  const handleError = (err: any) => {
    console.error("Scan Error:", err);
  };

  return (
    <div>
      {/* Input field to capture barcode scanner data */}
      <input
        type="text"
        placeholder="Scan a barcode"
        onKeyPress={handleKeyPress}
        autoFocus // Automatically focus the input field for continuous scanning
      />
      <QrReader
        onUpdate={(err, result) => {
          if (result) handleScan(result.getText());
          if (err) handleError(err);
        }}
      />
      {scannedData && <p>Scanned Data: {scannedData}</p>}
      <div>
        <h3>Responses:</h3>
        {messages.map((msg, index) => (
          <p key={index}>{msg}</p>
        ))}
      </div>
    </div>
  );
}
