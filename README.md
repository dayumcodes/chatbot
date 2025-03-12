# AI Chatbot

A modern, animated chatbot with typing effects and sound.

## Features

- Real-time AI responses using OpenAI API
- Word-by-word typing animation
- Typing sound effects
- Modern UI with smooth animations
- Environment variable configuration

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:
```
REACT_APP_OPENAI_API_KEY=your_api_key_here
REACT_APP_TYPING_SPEED=100
REACT_APP_ENABLE_SOUND=true
```

3. Add typing sound:
- Download a typing sound effect (MP3 format)
- Place it in the `public` folder as `typing-sound.mp3`

4. Start the development server:
```bash
npm start
```

## Configuration

You can adjust the following environment variables:

- `REACT_APP_TYPING_SPEED`: Time in milliseconds between each word (default: 100)
- `REACT_APP_ENABLE_SOUND`: Enable/disable typing sound (true/false)

## Animations

The chatbot includes several animations:
- Fade-in effect for new messages
- Pulse animation for the header
- Hover effect on message bubbles
- Smooth scrolling
- Loading dots animation

## Dependencies

- React
- Emotion (styled components)
- OpenAI API
