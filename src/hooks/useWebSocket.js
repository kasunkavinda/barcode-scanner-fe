"use client"

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const useWebSocket = () => {
    const [socket, setSocket] = useState(null);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        const newSocket = io(process.env.BE_URL); // Replace with your backend URL
        setSocket(newSocket);

        newSocket.on("barcodeResponse", (data) => {
            console.log("Received from server:", data);
            setMessage(data);
        });

        return () => newSocket.close();
    }, []);

    const sendBarcode = (barcode) => {
        if (socket) {
            socket.emit("barcodeScan", barcode);
        }
    };

    return { message, sendBarcode };
};

export default useWebSocket;
