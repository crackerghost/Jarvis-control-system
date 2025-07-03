import React, { useState, useRef, useEffect } from "react";
import api from "../../utils/interceptos";

const HOTWORDS = ["hii", "hello", "hi", "jarvis", "echo"];

const WhisperMic = () => {
  const [status, setStatus] = useState("Initializing...");
  const [transcript, setTranscript] = useState("");
  const [isHotwordListening, setIsHotwordListening] = useState(false);
  const [isCommandListening, setIsCommandListening] = useState(false);

  // Refs for state and cleanup
  const recognitionRef = useRef(null);
  const runningModeRef = useRef("hotword"); // "hotword" | "command"
  const isUnmountedRef = useRef(false);
  const restartTimeoutRef = useRef(null);

  // ========== HOTWORD DETECTION ==============
  const startHotwordRecognition = () => {
    cleanupRecognition(); // Always clean before starting
    runningModeRef.current = "hotword";
    setStatus('Listening for hotword: "Jarvis" or "Echo"...');
    setIsHotwordListening(true);
    setIsCommandListening(false);

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setStatus("Speech Recognition not supported in this browser.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.continuous = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsHotwordListening(true);
      };

      recognition.onresult = (event) => {
        const lastResult = event.results[event.results.length - 1][0].transcript
          .toLowerCase()
          .trim();
           console.log("Hotword result:", lastResult);
        if (HOTWORDS.some((hotword) => lastResult.includes(hotword))) {
          setStatus(
            `Hotword "${lastResult}" detected. Listening for command...`
          );
          recognition.stop();
          startCommandRecognition();
        }
      };

      recognition.onerror = (event) => {
        if (isUnmountedRef.current) return;
        setStatus(`Hotword error: ${event.error}`);
        setIsHotwordListening(false);

        // Handle not allowed (user denied mic)
        if (event.error === "not-allowed" || event.error === "denied") {
          setStatus("Microphone access denied.");
          return;
        }

        // Restart hotword detection after a delay (network, no-speech, etc)
        debounceRestartHotword();
      };

      recognition.onend = () => {
        setIsHotwordListening(false);
        if (isUnmountedRef.current) return;
        // If not switching to command, restart hotword detection
        if (runningModeRef.current === "hotword") {
          debounceRestartHotword();
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      setStatus("Failed to start hotword detection.");
      debounceRestartHotword();
    }
  };

  // ========== COMMAND DETECTION ==============
  const startCommandRecognition = () => {
    cleanupRecognition();
    runningModeRef.current = "command";
    setStatus("Listening for command...");
    setIsHotwordListening(false);
    setIsCommandListening(true);

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setStatus("Speech Recognition not supported in this browser.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.continuous = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsCommandListening(true);
      };

      recognition.onresult = async (event) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        setStatus(`Command: "${text}". Sending to server...`);

        try {
          await api.post("/command", { command: text });
          setStatus("Command sent successfully.");
        } catch (err) {
          setStatus(
            "Error sending command: " +
              (err.response?.data?.message || err.message)
          );
        }
      };

      recognition.onerror = (event) => {
        if (isUnmountedRef.current) return;
        setStatus(`Command error: ${event.error}`);
      };

      recognition.onend = () => {
        setIsCommandListening(false);
        if (isUnmountedRef.current) return;
        setStatus("Returning to hotword detection...");
        debounceRestartHotword();
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      setStatus("Failed to start command recognition.");
      debounceRestartHotword();
    }
  };

  // ========== CLEANUP & RESTART HELPERS ==============

  const cleanupRecognition = () => {
    try {
      if (recognitionRef.current) {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onstart = null;
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = null;
      }
    } catch (e) {}
  };

  const debounceRestartHotword = () => {
    if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
    restartTimeoutRef.current = setTimeout(() => {
      if (!isUnmountedRef.current) startHotwordRecognition();
    }, 1200);
  };

  // ========== LIFECYCLE ==============

  useEffect(() => {
    isUnmountedRef.current = false;
    startHotwordRecognition();

    return () => {
      isUnmountedRef.current = true;
      cleanupRecognition();
    };
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        cleanupRecognition();
      } else {
        if (!isHotwordListening && !isCommandListening) {
          debounceRestartHotword();
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isHotwordListening, isCommandListening]);

  // ========== UI ==============

  return (
    <div className="p-6 max-w-lg mx-auto rounded-lg shadow-lg mt-10">
      <div className="space-y-4">
        <div className="p-4 border rounded-lg bg-gray-50">
          <div className="flex items-center gap-3 mb-2">
            <div
              className={`w-4 h-4 rounded-full ${
                isCommandListening
                  ? "bg-red-500 animate-pulse"
                  : isHotwordListening
                  ? "bg-green-500 animate-pulse"
                  : "bg-gray-400"
              }`}
            ></div>
          </div>
          <p className="text-sm text-gray-600">{status}</p>
        </div>

        {transcript && (
          <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">Last Command:</h3>
            <p className="text-blue-700">{transcript}</p>
          </div>
        )}

        <div className="text-sm text-gray-600  p-3 rounded-xl border">
          <h4 className="font-semibold mb-2">Instructions:</h4>
          <ul className="space-y-1">
            <li>• Say "Jarvis" or "Echo" to trigger command recording.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WhisperMic;
