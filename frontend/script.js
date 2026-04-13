let sessionId = null;
let isRecording = false;

const micBtn = document.getElementById('mic-btn');
const statusText = document.getElementById('status-text');
const chatContainer = document.getElementById('chat-container');
const audioPlayer = document.getElementById('audio-player');

// Check for Speech Recognition API
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
    alert("Your browser does not support Speech Recognition. Please use Chrome or Edge.");
}

const recognition = new SpeechRecognition();
recognition.continuous = false;
recognition.interimResults = false;
recognition.lang = 'en-IN'; // Indian English/Hindi mix

recognition.onstart = () => {
    isRecording = true;
    micBtn.classList.add('recording');
    statusText.innerText = 'Listening... Speak now';
    updateStatusBadge('listening');
};

recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    console.log("Transcribed:", transcript);
    addMessage(transcript, 'user');
    sendTextToBackend(transcript);
};

recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    statusText.innerText = 'Error: ' + event.error;
    micBtn.classList.remove('recording');
    isRecording = false;
};

recognition.onend = () => {
    micBtn.classList.remove('recording');
    isRecording = false;
};

micBtn.addEventListener('click', () => {
    if (!isRecording) {
        recognition.start();
    } else {
        recognition.stop();
    }
});

async function sendTextToBackend(text) {
    if (!text || text.trim() === "") return;

    micBtn.classList.add('processing');
    statusText.innerText = 'Thinking...';
    updateStatusBadge('processing');

    try {
        const response = await fetch('http://localhost:8000/process-text', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: text,
                session_id: sessionId ? sessionId.toString() : null
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Server Error:", errorData);
            throw new Error("Validation Error");
        }

        const data = await response.json();
        
        if (data.session_id) sessionId = data.session_id;

        // Display AI message
        addMessage(data.response_text, 'ai');

        // Play AI response audio
        audioPlayer.src = `http://localhost:8000${data.audio_url}`;
        audioPlayer.play();

        micBtn.classList.remove('processing');
        statusText.innerText = 'Speaking...';
        updateStatusBadge('speaking');

        audioPlayer.onended = () => {
            statusText.innerText = 'Ready';
            updateStatusBadge('ready');
        };

    } catch (err) {
        console.error('Error connecting:', err);
        statusText.innerText = 'Error: Check Backend Console';
        micBtn.classList.remove('processing');
        updateStatusBadge('error');
    }
}

function addMessage(text, role) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message');
    msgDiv.classList.add(role === 'user' ? 'user-msg' : 'ai-msg');
    msgDiv.innerText = text;
    
    chatContainer.innerHTML = ''; 
    chatContainer.appendChild(msgDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function updateStatusBadge(state) {
    const dot = document.querySelector('.status-dot');
    if (!dot) return;
    switch(state) {
        case 'listening': dot.style.background = '#ef4444'; break;
        case 'processing': dot.style.background = '#f59e0b'; break;
        case 'speaking': dot.style.background = '#10b981'; break;
        case 'ready': dot.style.background = '#38bdf8'; break;
        default: dot.style.background = '#64748b';
    }
}
