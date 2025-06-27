// WhisperMic.jsx
import React, { useState, useRef, useEffect } from "react";
import api from "../../utils/interceptos";

const WhisperMic = () => {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState("Initializing...");

  const hotwordRecognitionRef = useRef(null);
  const commandRecognitionRef = useRef(null);
  const shouldRunRef = useRef(true);
  const restartTimeoutRef = useRef(null);

  const startCommandRecognition = async (detectedText) => {
    setStatus("Command recognition started");

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech Recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setRecording(true);
      setStatus("Listening for command...");
    };

    recognition.onresult = async (event) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      setStatus(`Command: ${text}`);

      try {
        await api.post("/android/command", { command: text });
        setStatus("Command sent successfully");
      } catch (err) {
        console.error("API Error:", err.response?.data || err.message);
        setStatus("Error sending command");
      }
    };

    recognition.onerror = (event) => {
      console.error("Command recognition error:", event.error);
      setStatus(`Command error: ${event.error}`);
    };

    recognition.onend = () => {
      setRecording(false);
      setStatus("Command recognition ended");
      commandRecognitionRef.current = null;
      // Restart hotword detection after command is done
      setTimeout(startHotwordDetection, 500);
    };

    recognition.start();
    commandRecognitionRef.current = recognition;
  };

  const startHotwordDetection = () => {
    if (!shouldRunRef.current || hotwordRecognitionRef.current || recording) {
      return;
    }

    setStatus("Starting hotword detection...");

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech Recognition is not supported in this browser.");
      return;
    }

    // Clear any existing timeout
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = true;
    recognition.maxAlternatives = 1;

    let isProcessing = false;

    recognition.onstart = () => {
      setIsListening(true);
      setStatus("Listening for 'babee' or 'baby'...");
    };

    recognition.onresult = (event) => {
      if (isProcessing) return;

      // Get the latest result
      const lastResultIndex = event.results.length - 1;
      const text = event.results[lastResultIndex][0].transcript
        .toLowerCase()
        .trim();

      if (text.includes("babee") || text.includes("baby")) {
        isProcessing = true;
        recognition.stop(); // This will trigger onend
      }
    };

    recognition.onerror = (event) => {
      console.error("Hotword error:", event.error);
      setStatus(`Hotword error: ${event.error}`);

      if (event.error === "not-allowed") {
        setStatus("Microphone access denied");
        shouldRunRef.current = false;
        return;
      }

      if (event.error === "network") {
        setStatus("Network error - retrying...");
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      hotwordRecognitionRef.current = null;

      if (isProcessing) {
        // Hotword was detected, start command recognition
        startCommandRecognition();
        isProcessing = false;
      } else if (shouldRunRef.current && !recording) {
        // Recognition ended naturally, restart after delay
        setStatus("Restarting hotword detection...");
        restartTimeoutRef.current = setTimeout(() => {
          if (shouldRunRef.current) {
            startHotwordDetection();
          }
        }, 1000);
      }
    };

    try {
      recognition.start();
      hotwordRecognitionRef.current = recognition;
    } catch (error) {
      console.error("Failed to start recognition:", error);
      setStatus("Failed to start - retrying...");
      restartTimeoutRef.current = setTimeout(() => {
        if (shouldRunRef.current) {
          startHotwordDetection();
        }
      }, 2000);
    }
  };

  const stopAll = () => {
    shouldRunRef.current = false;

    if (hotwordRecognitionRef.current) {
      hotwordRecognitionRef.current.stop();
      hotwordRecognitionRef.current = null;
    }

    if (commandRecognitionRef.current) {
      commandRecognitionRef.current.stop();
      commandRecognitionRef.current = null;
    }

    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }

    setIsListening(false);
    setRecording(false);
    setStatus("Stopped");
  };

  const startAll = () => {
    shouldRunRef.current = true;
    startHotwordDetection();
  };

  const manualRecord = () => {
    if (recording) {
      if (commandRecognitionRef.current) {
        commandRecognitionRef.current.stop();
      }
    } else {
      // Stop hotword detection temporarily
      if (hotwordRecognitionRef.current) {
        hotwordRecognitionRef.current.stop();
      }
      startCommandRecognition();
    }
  };

  // Initialize on mount
  useEffect(() => {
    startHotwordDetection();

    return () => {
      shouldRunRef.current = false;
      if (hotwordRecognitionRef.current) {
        hotwordRecognitionRef.current.stop();
      }
      if (commandRecognitionRef.current) {
        commandRecognitionRef.current.stop();
      }
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
    };
  }, []);

  // Handle page visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page hidden - stop recognition to save resources
        if (hotwordRecognitionRef.current) {
          hotwordRecognitionRef.current.stop();
        }
      } else {
        // Page visible - restart if should be running
        if (shouldRunRef.current && !isListening && !recording) {
          setTimeout(startHotwordDetection, 1000);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isListening, recording]);

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
        Voice Assistant
      </h2>

      <div className="space-y-4">
        {/* Control Buttons */}
        <div className="flex gap-2">
          <button
            onClick={manualRecord}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
              recording
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {recording ? "Stop Recording" : "Manual Record"}
          </button>

          <button
            onClick={shouldRunRef.current ? stopAll : startAll}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
              shouldRunRef.current
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            {shouldRunRef.current ? "Stop All" : "Start All"}
          </button>
        </div>

        {/* Status Display */}
        <div className="p-4 border rounded-lg bg-gray-50">
          <div className="flex items-center gap-3 mb-2">
            <div
              className={`w-4 h-4 rounded-full ${
                isListening
                  ? "bg-green-500 animate-pulse"
                  : recording
                  ? "bg-red-500 animate-pulse"
                  : "bg-gray-400"
              }`}
            ></div>
            <span className="font-medium">
              {isListening
                ? "Listening for Hotword"
                : recording
                ? "Recording Command"
                : "Inactive"}
            </span>
          </div>
          <p className="text-sm text-gray-600">{status}</p>
        </div>

        {/* Last Command */}
        {transcript && (
          <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">Last Command:</h3>
            <p className="text-blue-700">{transcript}</p>
          </div>
        )}

        {/* Instructions */}
        <div className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
          <h4 className="font-semibold mb-2">Instructions:</h4>
          <ul className="space-y-1">
            <li>• Say "babee" or "baby" to trigger command recording</li>
            <li>• System runs continuously in background</li>
            <li>• Use "Stop All" to completely disable</li>
            <li>• Manual record bypasses hotword detection</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WhisperMic;
