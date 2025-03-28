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
let replyToMessage = null;

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

document.getElementById('launchBtn').addEventListener('click', () => {
    const win = window.open('about:blank', '_blank');

    win.document.title = "Google Drive";
    const link = win.document.createElement('link');
    link.rel = 'icon';
    link.href = 'icons/googledrive.png';
    win.document.head.appendChild(link);

    win.document.body.style.margin = '0';
    win.document.body.style.height = '100vh';
    const iframe = win.document.createElement('iframe');
    iframe.style.border = 'none';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.allow = 'autoplay; fullscreen';

    const url = window.location.href;
    iframe.src = url;
    win.document.body.appendChild(iframe);
});

document.getElementById('howToUseBtn').addEventListener('click', () => {
    document.getElementById('howToUsePopup').classList.add('active');
    document.getElementById('login').classList.add('blur');
    document.getElementById('chat').classList.add('blur');
});

document.getElementById('closePopup').addEventListener('click', () => {
    document.getElementById('howToUsePopup').classList.remove('active');
    document.getElementById('login').classList.remove('blur');
    document.getElementById('chat').classList.remove('blur');
});

document.getElementById('sendBtn').addEventListener('click', () => sendMessage());

document.getElementById('messageInput').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

document.getElementById('uploadBtn').addEventListener('click', () => {
    document.getElementById('imageInput').click();
});

document.getElementById('imageInput').addEventListener('change', handleImageUpload);

document.getElementById('closeReply').addEventListener('click', () => {
    document.getElementById('replyBox').classList.add('hidden');
    replyToMessage = null; // Reset the replyToMessage variable
});

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
        const messageData = { userName, text, timestamp, isImage };

        if (replyToMessage) {
            messageData.replyTo = replyToMessage;
            replyToMessage = null;
            document.getElementById('replyBox').classList.add('hidden');
        }

        msgRef.set(messageData);
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

function displayMessage({ userName: senderName, text, timestamp, isImage, replyTo }) {
    const chatBox = document.getElementById('chatBox');
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message');

    if (senderName === userName) {
        msgDiv.classList.add('myMessage');
    } else {
        msgDiv.classList.add('otherMessage');
    }

    const time = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

    // Add sender's username above the message
    const senderElement = document.createElement('div');
    senderElement.classList.add('senderName');
    senderElement.textContent = senderName;
    msgDiv.appendChild(senderElement);

    if (replyTo) {
        const replyDiv = document.createElement('div');
        replyDiv.classList.add('replyBox');
        if (replyTo.isImage) {
            const img = document.createElement('img');
            img.src = replyTo.text;
            img.style.maxWidth = '100%';
            img.style.borderRadius = '10px';
            replyDiv.appendChild(img);
        } else {
            replyDiv.innerHTML = `<strong>${replyTo.senderName}</strong>: ${replyTo.text}`;
        }
        msgDiv.appendChild(replyDiv);
    }

    if (isImage) {
        const img = document.createElement('img');
        img.src = text;
        img.style.maxWidth = '100%';
        img.style.borderRadius = '10px';
        msgDiv.appendChild(img);
    } else {
        const messageText = document.createElement('span');
        if (text.length > 500) {
            const shortText = text.substring(0, 500);
            messageText.innerHTML = `${shortText}... <a href="#" class="viewMore">View More</a>`;
            messageText.querySelector('.viewMore').addEventListener('click', (e) => {
                e.preventDefault();
                messageText.innerHTML = text;
            });
        } else {
            messageText.textContent = text;
        }
        msgDiv.appendChild(messageText);
    }

    const timestampSpan = document.createElement('span');
    timestampSpan.classList.add('timestamp');
    timestampSpan.textContent = time;
    msgDiv.appendChild(timestampSpan);

    msgDiv.addEventListener('click', () => {
        replyToMessage = { senderName, text, isImage };
        showReplyBox(senderName, text, isImage);
    });

    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function showReplyBox(senderName, text, isImage) {
    const replyBox = document.getElementById('replyBox');
    const replyText = document.getElementById('replyText');
    replyBox.classList.remove('hidden');

    if (isImage) {
        const img = document.createElement('img');
        img.src = text;
        img.style.maxWidth = '100%';
        img.style.borderRadius = '10px';
        replyText.innerHTML = '';
        replyText.appendChild(img);
    } else {
        replyText.innerHTML = `<strong>${senderName}</strong>: ${text}`;
    }
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
