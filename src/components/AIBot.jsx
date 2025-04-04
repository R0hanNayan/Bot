import { useState, useEffect } from "react";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
} from "@chatscope/chat-ui-kit-react";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import MicRoundedIcon from '@mui/icons-material/MicRounded';
import HearingRoundedIcon from '@mui/icons-material/HearingRounded';
import StopCircleRoundedIcon from '@mui/icons-material/StopCircleRounded';

const AIVoiceAssistant = ({ propertyData }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Load messages from localStorage on component mount
  useEffect(() => {
    const savedMessages = localStorage.getItem("chatMessages");
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("chatMessages", JSON.stringify(messages));
    }
  }, [messages]);

  // Function to start listening to the user's voice
  const startListening = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = isListening ? true : false;
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onerror = (event) => console.error("Speech Recognition Error:", event);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      handleSend(transcript);
    };

    recognition.start();
  };

  // Function to speak the AI response
  const speakResponse = (text) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-IN";
      utterance.rate = 1; // Adjust speed (0.5 = slow, 1 = normal, 2 = fast)
      utterance.pitch = 1; // Adjust pitch (0 = low, 1 = normal, 2 = high)
      utterance.volume = 1; // Adjust volume (0 = mute, 1 = max)

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (err) => console.error("Speech Synthesis Error:", err);

      window.speechSynthesis.speak(utterance);
    } else {
      alert("Speech Synthesis not supported in this browser.");
    }
  };

  // Function to stop AI voice response
  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Function to handle message sending and AI response retrieval
  const handleSend = async (message) => {
    if (!message.trim()) return;

    const newMessages = [...messages, { role: "user", content: message }];
    setMessages(newMessages);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/azure-ai", { // ✅ Updated API route
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, propertyData }),
      });

      const data = await res.json();
      const aiResponse = { role: "assistant", content: data.reply };
      
      setMessages([...newMessages, aiResponse]);
      
      // 🗣️ Speak AI response
      speakResponse(data.reply);
      
    } catch (error) {
      console.error("Error fetching AI response:", error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-90 h-120 max-w-sm sm:w-90 md:w-90 bg-white rounded-lg shadow-lg p-4 z-10 absolute bottom-5 right-0">
      <MainContainer className="rounded-xl shadow-xl py-2">
        <ChatContainer>
          <MessageList typingIndicator={isTyping ? <TypingIndicator content="AI is thinking..." /> : null}>
            {messages.map((msg, i) => (
              <Message
                key={i}
                model={{
                  message: msg.content,
                  sender: msg.role === "user" ? "You" : "AI",
                  direction: msg.role === "user" ? "outgoing" : "incoming",
                }}
              />
            ))}
          </MessageList>
          {/* Message Input Field */}
          <MessageInput
            placeholder="Type your message or use voice..."
            value={input}
            onChange={(val) => setInput(val)}
            onSend={handleSend}
            attachButton={false}
          />
        </ChatContainer>
      </MainContainer>

      {/* 🎤 Start Listening Button */}
      <button
        onClick={startListening}
        className={`mt-2 p-2 rounded-lg text-white ${isListening ? "bg-red-600" : "bg-blue-600"}`}
        style={{ width: "100%", marginTop: "10px" }}
      >
        {isListening ? <HearingRoundedIcon /> : <MicRoundedIcon />}
      </button>

      {/* 🔇 Stop AI Voice Button */}
      {isSpeaking && (
        <button
          onClick={stopSpeaking}
          className="mt-2 p-2 bg-red-600 text-white rounded-lg"
          style={{ width: "100%", marginTop: "10px" }}
        >
          <StopCircleRoundedIcon />
        </button>
      )}
    </div>
  );
};

export default AIVoiceAssistant;
