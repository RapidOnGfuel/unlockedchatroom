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

        // Add user to the online users list
        addUserToRoom(roomCode, userName);

        listenForMessages();
        listenForOnlineUsers();
    }
});

// Send Message
document.getElementById('sendBtn').addEventListener('click', sendMessage);

// Send Message with Enter key
document.getElementById('messageInput').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

function sendMessage() {
    const text = document.getElementById('messageInput').value;
    if (text.trim()) {
        const msgRef = db.ref(`chats/${roomCode}`).push();
        msgRef.set({ userName, text });
        document.getElementById('messageInput').value = ''; // Clear input field
    }
}

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

    // Check if it's the current user's message or not
    if (userName === userName) {
        msgDiv.classList.add('myMessage'); // Right side for your messages
    } else {
        msgDiv.classList.add('otherMessage'); // Left side for others' messages
    }

    msgDiv.textContent = `${userName}: ${text}`;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function listenForOnlineUsers() {
    // Listen for changes to the online users list
    db.ref(`onlineUsers/${roomCode}`).on('value', (snapshot) => {
        const users = snapshot.val();
        updateOnlineUsers(users);
    });
}

function updateOnlineUsers(users) {
    const onlineUsersList = document.getElementById('onlineUsers');
    onlineUsersList.innerHTML = ''; // Clear the current list

    for (let user in users) {
        const userDiv = document.createElement('div');
        userDiv.classList.add('onlineUser');
        userDiv.textContent = user;
        onlineUsersList.appendChild(userDiv);
    }
}

function addUserToRoom(roomCode, userName) {
    const userRef = db.ref(`onlineUsers/${roomCode}/${userName}`);

    userRef.set(true); // Set user to true when they join

    // Remove user when they disconnect
    window.addEventListener('beforeunload', () => {
        userRef.remove();
    });
}
