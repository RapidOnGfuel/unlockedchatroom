// ✅ Your Firebase config (Replace with actual credentials)
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "your-project-id.firebaseapp.com",
    databaseURL: "https://your-project-id.firebaseio.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// ✅ Initialize Firebase (using v8 syntax)
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let userName = "";
let roomCode = "";

document.getElementById('joinBtn').addEventListener('click', () => {
    userName = document.getElementById('username').value.trim();
    roomCode = document.getElementById('roomCode').value.trim();

    if (userName && roomCode) {
        document.getElementById('login').classList.add('hidden');
        document.getElementById('chat').classList.remove('hidden');
        document.getElementById('chatHeader').innerText = `Room: ${roomCode}`;

        listenForMessages();
    }
});

document.getElementById('sendBtn').addEventListener('click', () => {
    const text = document.getElementById('messageInput').value;
    if (text.trim()) {
        const msgRef = db.ref(`chats/${roomCode}`).push();
        msgRef.set({ userName, text });
        document.getElementById('messageInput').value = '';
    }
});

function listenForMessages() {
    db.ref(`chats/${roomCode}`).on('child_added', (snapshot) => {
        const message = snapshot.val();
        displayMessage(message);
    });
}

function displayMessage({ userName, text }) {
    const chatBox = document.getElementById('chatBox');
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message');
    msgDiv.textContent = `${userName}: ${text}`;

    if (userName === userName) {
        msgDiv.classList.add('myMessage');
    } else {
        msgDiv.classList.add('otherMessage');
    }

    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}
