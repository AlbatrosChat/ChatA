// Firebase configuration and initialization
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const database = firebase.database();

document.getElementById('login-btn').addEventListener('click', () => {
    const email = prompt('Enter your email:');
    const password = prompt('Enter your password:');
    auth.signInWithEmailAndPassword(email, password)
        .catch(error => console.error(error));
});

auth.onAuthStateChanged(user => {
    if (user) {
        document.getElementById('login-btn').style.display = 'none';
        document.getElementById('logout-btn').style.display = 'block';
        loadChatRooms();
    } else {
        document.getElementById('login-btn').style.display = 'block';
        document.getElementById('logout-btn').style.display = 'none';
    }
});

document.getElementById('logout-btn').addEventListener('click', () => {
    auth.signOut();
});

function loadChatRooms() {
    database.ref('rooms').on('child_added', snapshot => {
        const room = snapshot.val();
        const roomElement = document.createElement('li');
        roomElement.textContent = room.name;
        roomElement.addEventListener('click', () => joinRoom(snapshot.key));
        document.getElementById('rooms').appendChild(roomElement);
    });
}

function joinRoom(roomId) {
    database.ref('rooms/' + roomId + '/messages').on('child_added', snapshot => {
        const message = snapshot.val();
        const messageElement = document.createElement('div');
        messageElement.textContent = `${message.name}: ${message.text}`;
        document.getElementById('chat-messages').appendChild(messageElement);
    });

    document.getElementById('send-message-btn').addEventListener('click', () => {
        const messageInput = document.getElementById('message-input');
        const message = messageInput.value;
        const user = auth.currentUser;
        if (message && user) {
            database.ref('rooms/' + roomId + '/messages').push({
                name: user.displayName,
                text: message
            });
            messageInput.value = '';
        }
    });
}

document.getElementById('create-room-btn').addEventListener('click', () => {
    const roomName = prompt('Enter room name:');
    if (roomName) {
        const newRoomKey = database.ref('rooms').push().key;
        database.ref('rooms/' + newRoomKey).set({
            name: roomName,
            owner: auth.currentUser.uid
        });
    }
});
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    databaseURL: "YOUR_DATABASE_URL",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
// إضافة إلى app.js
const recordAudioBtn = document.getElementById('record-audio-btn');
let mediaRecorder;
let audioChunks = [];

recordAudioBtn.addEventListener('click', () => {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.start();

            mediaRecorder.addEventListener('dataavailable', event => {
                audioChunks.push(event.data);
            });

            mediaRecorder.addEventListener('stop', () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                const audioURL = URL.createObjectURL(audioBlob);
                const audio = new Audio(audioURL);
                audio.play();
                
                // إرسال الرسالة الصوتية إلى Firebase
                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = () => {
                    const base64String = reader.result.split(',')[1];
                    database.ref('rooms/' + currentRoom + '/messages').push({
                        name: auth.currentUser.displayName,
                        audio: base64String,
                        type: 'audio'
                    });
                };

                audioChunks = [];
            });

            setTimeout(() => {
                mediaRecorder.stop();
            }, 5000); // تسجيل لمدة 5 ثواني
        });
});
// إضافة إلى app.js
const changeLangBtn = document.getElementById('change-lang-btn');

changeLangBtn.addEventListener('click', () => {
    const currentLang = document.documentElement.lang;
    const newLang = currentLang === 'en' ? 'ar' : 'en';
    document.documentElement.lang = newLang;
    // تحديث واجهة المستخدم بالنصوص الجديدة
});
// إضافة إلى app.js
const giftSelect = document.getElementById('gift-select');
const sendGiftBtn = document.getElementById('send-gift-btn');

function loadGifts() {
    // تهيئة قائمة الهدايا
    const gifts = [
        { id: 'gift1', name: 'Rose', price: 10 },
        { id: 'gift2', name: 'Teddy Bear', price: 50 },
        { id: 'gift3', name: 'Diamond', price: 100 }
    ];

    gifts.forEach(gift => {
        const option = document.createElement('option');
        option.value = gift.id;
        option.textContent = `${gift.name} - ${gift.price} Coins`;
        giftSelect.appendChild(option);
    });
}

sendGiftBtn.addEventListener('click', () => {
    const selectedGiftId = giftSelect.value;
    const user = auth.currentUser;

    if (selectedGiftId && user) {
        database.ref('rooms/' + currentRoom + '/gifts').push({
            sender: user.displayName,
            giftId: selectedGiftId,
            timestamp: new Date().toISOString()
        });

        alert('Gift sent successfully!');
    }
});

loadGifts();
// إضافة إلى app.js
const vipList = document.getElementById('vip-list');
const storeItems = document.getElementById('store-items');

function loadVIPLevels() {
    // تهيئة قائمة مستويات VIP
    const vipLevels = [
        { id: 'vip1', name: 'Silver', price: 500 },
        { id: 'vip2', name: 'Gold', price: 1000 },
        { id: 'vip3', name: 'Platinum', price: 2000 }
    ];

    vipLevels.forEach(level => {
        const li = document.createElement('li');
        li.textContent = `${level.name} - ${level.price} Coins`;
        vipList.appendChild(li);
    });
}

function loadStoreItems() {
    // تهيئة قائمة العناصر في المتجر
    const items = [
        { id: 'item1', name: 'Custom Avatar', price: 100 },
        { id: 'item2', name: 'Background Music', price: 200 },
        { id: 'item3', name: 'Emoji Pack', price: 300 }
    ];

    items.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `${item.name} - ${item.price} Coins`;
        storeItems.appendChild(li);
    });
}

loadVIPLevels();
loadStoreItems();
// إضافة إلى app.js
const editProfileBtn = document.getElementById('edit-profile-btn');
const manageUsersBtn = document.getElementById('manage-users-btn');
const viewReportsBtn = document.getElementById('view-reports-btn');

editProfileBtn.addEventListener('click', () => {
    // وظيفة تحرير الملف الشخصي
    alert('Edit Profile clicked');
});

manageUsersBtn.addEventListener('click', () => {
    // وظيفة إدارة المستخدمين
    alert('Manage Users clicked');
});

viewReportsBtn.addEventListener('click', () => {
    // وظيفة عرض التقارير
    alert('View Reports clicked');
});
// إضافة إلى app.js
const updateRoomSettingsBtn = document.getElementById('update-room-settings-btn');
const emojiButtons = document.querySelectorAll('.emoji-btn');

updateRoomSettingsBtn.addEventListener('click', () => {
    const roomPassword = document.getElementById('room-password').value;
    const roomBackground = document.getElementById('room-background').value;
    const micCount = document.getElementById('mic-count').value;

    if (currentRoom) {
        database.ref('rooms/' + currentRoom).update({
            password: roomPassword,
            background: roomBackground,
            micCount: parseInt(micCount, 10)
        }).then(() => {
            alert('Room settings updated successfully!');
        });
    }
});

emojiButtons.forEach(button => {
    button.addEventListener('click', () => {
        const emoji = button.textContent;
        if (currentRoom && auth.currentUser) {
            database.ref('rooms/' + currentRoom + '/emojis').push({
                sender: auth.currentUser.displayName,
                emoji: emoji,
                timestamp: new Date().toISOString()
            });
        }
    });
});
// إضافة إلى app.js
const manageUsersBtn = document.getElementById('manage-users-btn');
const manageRoomsBtn = document.getElementById('manage-rooms-btn');
const viewReportsBtn = document.getElementById('view-reports-btn');

manageUsersBtn.addEventListener('click', () => {
    alert('Manage Users clicked');
});

manageRoomsBtn.addEventListener('click', () => {
    alert('Manage Rooms clicked');
});

viewReportsBtn.addEventListener('click', () => {
    alert('View Reports clicked');
});
// إضافة إلى app.js
const walletBalance = document.getElementById('wallet-balance');
const topUpAmountInput = document.getElementById('top-up-amount');
const topUpBtn = document.getElementById('top-up-btn');

topUpBtn.addEventListener('click', () => {
    const topUpAmount = parseInt(topUpAmountInput.value, 10);
    const coinsPerDollar = 7000;
    const newCoins = topUpAmount * coinsPerDollar;
    
    if (auth.currentUser) {
        const userRef = database.ref('users/' + auth.currentUser.uid);
        userRef.once('value').then(snapshot => {
            const currentBalance = snapshot.val().walletBalance || 0;
            userRef.update({
                walletBalance: currentBalance + newCoins
            }).then(() => {
                alert('Wallet topped up successfully!');
                loadWalletBalance();
            });
        });
    }
});

function loadWalletBalance() {
    if (auth.currentUser) {
        const userRef = database.ref('users/' + auth.currentUser.uid);
        userRef.once('value').then(snapshot => {
            const currentBalance = snapshot.val().walletBalance || 0;
            walletBalance.textContent = currentBalance;
        });
    }
}

auth.onAuthStateChanged(user => {
    if (user) {
        loadWalletBalance();
    }
});
// Firebase configuration and initialization
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const database = firebase.database();
let currentUser;

// وظيفة التحقق إذا كان المستخدم مسؤولاً أم لا
function checkAdmin() {
    auth.onAuthStateChanged(user => {
        if (user) {
            currentUser = user;
            database.ref('users/' + user.uid).once