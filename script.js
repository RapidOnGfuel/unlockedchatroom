// Your Firebase config and initialization
const firebaseConfig = {
    apiKey: "AIzaSyBsTY9yL4e3dG6Clpd7WuweT8oBv0Kb4yM",
    authDomain: "chatroom-46108.firebaseapp.com",
    databaseURL: "https://chatroom-46108-default-rtdb.firebaseio.com",
    projectId: "chatroom-46108",
    storageBucket: "chatroom-46108.firebasestorage.app",
    messagingSenderId: "611157906840",
    appId: "1:611157906840:web:14e6846a72fcdf4d4c47ed",
    measurementId: "G-FPV2M8FY06"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
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

        addUserToRoom(roomCode, userName);

        listenForMessages();
        listenForOnlineUsers();
    }
});

document.getElementById('sendBtn').addEventListener('click', () => sendMessage());

document.getElementById('messageInput').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

document.getElementById('imageInput').addEventListener('change', handleImageUpload);

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const base64String = e.target.result;
            sendMessage(base64String, true);
        };
        reader.readAsDataURL(file);
    }
}

function sendMessage(content = null, isImage = false) {
    const text = content || document.getElementById('messageInput').value;
    if (text.trim()) {
        const msgRef = db.ref(`chats/${roomCode}`).push();
        const timestamp = new Date().toISOString();
        msgRef.set({ userName, text, timestamp, isImage });
        if (!isImage) {
            document.getElementById('messageInput').value = '';
        }
    }
}

function listenForMessages() {
    db.ref(`chats/${roomCode}`).on('child_added', (snapshot) => {
        const message = snapshot.val();
        displayMessage(message);
    });
}

function displayMessage({ userName, text, timestamp, isImage }) {
    const chatBox = document.getElementById('chatBox');
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message');

    if (userName === userName) {
        msgDiv.classList.add('myMessage');
    } else {
        msgDiv.classList.add('otherMessage');
    }

    const time = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

    if (isImage) {
        const img = document.createElement('img');
        img.src = text;
        img.style.maxWidth = '100%';
        img.style.borderRadius = '10px';
        msgDiv.appendChild(img);
    } else {
        msgDiv.innerHTML = `<span>${userName}: ${text}</span>`;
    }

    const timestampSpan = document.createElement('span');
    timestampSpan.classList.add('timestamp');
    timestampSpan.textContent = time;

    msgDiv.appendChild(timestampSpan);
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function listenForOnlineUsers() {
    db.ref(`onlineUsers/${roomCode}`).on('value', (snapshot) => {
        const users = snapshot.val();
        updateOnlineUsers(users);
    });
}

function updateOnlineUsers(users) {
    const onlineUsersList = document.getElementById('onlineUsers');
    onlineUsersList.innerHTML = '';

    for (let user in users) {
        const userDiv = document.createElement('div');
        userDiv.classList.add('onlineUser');
        userDiv.textContent = user;
        onlineUsersList.appendChild(userDiv);
    }
}

function addUserToRoom(roomCode, userName) {
    const userRef = db.ref(`onlineUsers/${roomCode}/${userName}`);
    userRef.set(true);

    window.addEventListener('beforeunload', () => {
        userRef.remove();
    });
}
