import React, { useState, useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

// Styled components
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const ChatContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(to bottom right, #f8f9fa, #e9ecef);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const ChatHeader = styled.div`
  text-align: center;
  padding: 20px;
  background: linear-gradient(135deg, #0056b3, #007bff);
  color: white;
  border-radius: 10px 10px 0 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  h1 {
    animation: ${pulseAnimation} 2s infinite;
  }
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: rgba(255, 255, 255, 0.9);
  border-left: 1px solid #dee2e6;
  border-right: 1px solid #dee2e6;
  scroll-behavior: smooth;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
    &:hover {
      background: #555;
    }
  }
`;

const MessageBubble = styled.div<{ isUser: boolean }>`
  max-width: 70%;
  padding: 12px 18px;
  border-radius: 18px;
  margin: 10px;
  background-color: ${props => props.isUser ? 
    'linear-gradient(135deg, #007bff, #0056b3)' : 
    'linear-gradient(135deg, #e9ecef, #dee2e6)'};
  color: ${props => props.isUser ? 'white' : 'black'};
  align-self: ${props => props.isUser ? 'flex-end' : 'flex-start'};
  display: inline-block;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  animation: ${fadeIn} 0.3s ease-out;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

const InputContainer = styled.div`
  display: flex;
  padding: 20px;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 0 0 10px 10px;
`;

const Input = styled.input`
  flex: 1;
  padding: 10px;
  border: 1px solid #dee2e6;
  border-radius: 5px;
  margin-right: 10px;
`;

const SendButton = styled.button`
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  &:hover {
    background: #0056b3;
  }
`;

interface Message {
  text: string;
  isUser: boolean;
  isLoading?: boolean;
  isTyping?: boolean;
  displayText?: string;
}

const LoadingDots = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  
  span {
    width: 4px;
    height: 4px;
    background: #666;
    border-radius: 50%;
    animation: bounce 1s infinite;
    
    &:nth-of-type(2) { animation-delay: 0.2s; }
    &:nth-of-type(3) { animation-delay: 0.4s; }
  }

  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-4px); }
  }
`;

const LoadingMessage = () => (
  <LoadingDots>
    <span></span>
    <span></span>
    <span></span>
  </LoadingDots>
);

const TypingMessage = ({ text }: { text: string }) => {
  const [displayText, setDisplayText] = useState('');
  const words = text.split(' ');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio element for typing sound
    const audio = new Audio('/typing-sound.mp3');
    audio.volume = 0.2;
    audioRef.current = audio;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  useEffect(() => {
    if (currentWordIndex < words.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + (prev ? ' ' : '') + words[currentWordIndex]);
        setCurrentWordIndex(prev => prev + 1);
        
        // Play typing sound if enabled
        if (process.env.REACT_APP_ENABLE_SOUND === 'true' && audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(() => {});
        }
      }, parseInt(process.env.REACT_APP_TYPING_SPEED || '100'));

      return () => clearTimeout(timer);
    }
  }, [currentWordIndex, words]);

  return <span>{displayText}</span>;
};

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      text: "Hello! I'm your AI assistant. How can I help you today?", 
      isUser: false,
      isTyping: true 
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const callAIAPI = async (userInput: string): Promise<string> => {
    // Use environment variable or fallback to a placeholder
    const API_KEY = process.env.REACT_APP_OPENAI_API_KEY || 'YOUR_API_KEY_HERE';
    const API_URL = 'https://api.openai.com/v1/chat/completions';

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful and friendly AI assistant. Provide clear, concise, and accurate responses.'
            },
            {
              role: 'user',
              content: userInput
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(errorData.error?.message || 'API request failed');
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error calling AI API:', error);
      return "I apologize, but I'm having trouble processing your request. This could be due to API limits or connection issues. Please try again in a moment.";
    }
  };

  const handleSend = async () => {
    if (inputText.trim() === '') return;

    // Add user message
    const userMessage = { text: inputText, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    
    // Add loading message
    setIsLoading(true);
    const loadingMessage = { text: '', isUser: false, isLoading: true };
    setMessages(prev => [...prev, loadingMessage]);

    try {
      // Get AI response
      const aiResponse = await callAIAPI(inputText);
      
      // Remove loading message and add AI response with typing effect
      setMessages(prev => prev.filter(msg => !msg.isLoading));
      setMessages(prev => [...prev, { 
        text: aiResponse, 
        isUser: false,
        isTyping: true
      }]);
    } catch (error) {
      // Handle error by showing error message
      setMessages(prev => prev.filter(msg => !msg.isLoading));
      setMessages(prev => [...prev, { 
        text: "Sorry, I encountered an error. Please try again.", 
        isUser: false 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ChatContainer>
      <ChatHeader>
        <h1>AI Chatbot</h1>
      </ChatHeader>
      <MessagesContainer>
        {messages.map((message, index) => (
          <MessageBubble key={index} isUser={message.isUser}>
            {message.isLoading ? (
              <LoadingMessage />
            ) : message.isTyping ? (
              <TypingMessage text={message.text} />
            ) : (
              message.text
            )}
          </MessageBubble>
        ))}
        <div ref={messagesEndRef} />
      </MessagesContainer>
      <InputContainer>
        <Input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
          placeholder="Type your message..."
          disabled={isLoading}
        />
        <SendButton onClick={handleSend} disabled={isLoading}>
          {isLoading ? 'Thinking...' : 'Send'}
        </SendButton>
      </InputContainer>
    </ChatContainer>
  );
};

export default App;
