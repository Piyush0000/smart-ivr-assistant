# GovVoice AI - Smart Conversational IVR (Lightweight Version)

A high-fidelity AI-powered conversational IVR system. This version is optimized for setup speed and **requires zero local speech processing software (no FFmpeg needed!)**.

## 🚀 Features
- **Zero-FFmpeg**: Uses your web browser's native Speech Recognition.
- **OpenRouter Brain**: Leverages OpenRouter for any LLM model.
- **Hinglish Support**: Naturally understands and speaks a mix of Hindi and English.
- **Premium UI**: Modern dark-mode interface with real-time status animations.

## 🛠️ Tech Stack
- **Backend**: FastAPI (Python)
- **STT**: Browser Native API (`webkitSpeechRecognition`)
- **LLM**: OpenRouter (OpenAI-compatible SDK)
- **TTS**: gTTS (Google Text-to-Speech)
- **UI**: Vanilla HTML5, CSS3, JavaScript

## 📋 Prerequisites
- Python 3.8+
- OpenRouter API Key
- **Browser**: Google Chrome or Microsoft Edge (Latest versions)

## ⚙️ Setup Instructions

1. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure Environment Variables**:
   - Create a `.env` file in the root directory.
   - Add your OpenRouter API key:
     ```env
     OPENROUTER_API_KEY=sk-or-v1-xxxx...
     ```

3. **Run the Backend**:
   ```bash
   python backend/main.py
   ```

4. **Open the Frontend**:
   - Open `frontend/index.html` in **Chrome** or **Edge**.
   - **Click Allow** on the microphone permission popup.

## 🎙️ How to Test
1. Click the **Microphone Button**.
2. Speak clearly in Hindi, English, or both.
3. The system will process your text and play back the AI response.
"# smart-ivr-assistant" 
