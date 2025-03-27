// ✅ Your Firebase config (Replace with actual credentials)
const firebaseConfig = {
  apiKey: "AIzaSyBsTY9yL4e3dG6Clpd7WuweT8oBv0Kb4yM",
  authDomain: "chatroom-46108.firebaseapp.com",
  databaseURL: "https://chatroom-46108-default-rtdb.firebaseio.com", // This looks good
  projectId: "chatroom-46108",
  storageBucket: "chatroom-46108.appspot.com", // Corrected here
  messagingSenderId: "611157906840",
  appId: "1:611157906840:web:14e6846a72fcdf4d4c47ed",
  measurementId: "G-FPV2M8FY06"
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
