// `data.js`から`imageData`を読み込む
import { imageData } from './data.js';

// Google Apps ScriptのURL
const scriptUrl = "https://script.google.com/macros/s/AKfycbw8i9wHLxiayFChqEN7xsez_fpUTYkaXdMqvjNP180u4NlmzYZvw4lWxLJxpsIi6yaDCw/exec";

// === Fisher-Yatesシャッフルアルゴリズム ===
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// === セッションIDの管理 ===
function getOrCreateSessionId() {
    let sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
        // セッションIDがなければ新しく生成する
        sessionId = crypto.randomUUID(); // より安全なUUIDを生成
        localStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
}

const userSessionId = getOrCreateSessionId();
console.log('現在のセッションID:', userSessionId);

// === いいね！機能の追加 ===
function setupLikeButtons(shuffledData) {
    const likeButtons = document.querySelectorAll('.like-button');

    likeButtons.forEach(button => {
        const item = button.closest('.feature-item');
        const itemId = item.dataset.itemId;
        
        // ローカルストレージをチェック
        if (localStorage.getItem('liked_' + itemId)) {
            button.disabled = true;
            button.classList.add('liked');
        }

        button.addEventListener('click', async () => {
            if (button.disabled) {
                return;
            }

            button.classList.add('liked');
            button.disabled = true;
            
            localStorage.setItem('liked_' + itemId, 'true');

            const itemData = shuffledData.find(data => (data.itemId || data.text) === itemId);
            
            try {
                await fetch(scriptUrl, {
                    method: "POST",
                    body: new URLSearchParams({ 
                        itemId: itemData.text,
                        uid: itemData.uid,
                        serverId: itemData.serverId,
                        imageUrl: itemData.url,
                        screenWidth: window.screen.width,
                        screenHeight: window.screen.height,
                        sessionId: userSessionId // ここで生成したセッションIDを使用
                    }),
                    mode: "no-cors"
                });
                console.log('データを正常に送信しました。');
            } catch (error) {
                console.error('データの送信に失敗しました:', error);
            }
        });
    });
}

// === アイテムを動的に生成する関数 ===
function generateFeatures() {
    // ローカルストレージをクリアして、いいねの状態をリセット
    localStorage.clear();

    const container = document.getElementById('features-container');
    const containerWidth = container.offsetWidth;
    const itemWidth = 200; 
    const itemsPerRow = Math.floor(containerWidth / itemWidth);
    
    // アイテムの数を計算。最低でも4つ（2行分）表示する
    const numberOfItems = Math.max(itemsPerRow * 2, 4);

    const shuffledData = shuffle([...imageData]);
    container.innerHTML = '';

    for (let i = 0; i < numberOfItems; i++) {
        const itemData = shuffledData[i % shuffledData.length];
        const featureItem = document.createElement('div');
        featureItem.className = 'feature-item';

        const uniqueId = itemData.itemId || itemData.text;
        featureItem.dataset.itemId = uniqueId;

        featureItem.innerHTML = `
            <div class="image">
                <img src="${itemData.url}" alt="${itemData.text}">
            </div>
            <div class="content">
                <p>${itemData.text}</p>
            </div>
            <div class="like-section">
                <button class="like-button">♡いいね</button>
            </div>
        `;
        container.appendChild(featureItem);
    }
    setupLikeButtons(shuffledData);
}

// === 「もっと見る」ボタンの機能 ===
document.addEventListener('DOMContentLoaded', () => {
    const reloadButton = document.getElementById('reload-button');
    if (reloadButton) {
        reloadButton.addEventListener('click', (event) => {
            event.preventDefault();
            generateFeatures();
        });
    }

    generateFeatures();
    // 以下の部分を修正
    let lastWidth = window.innerWidth;
    window.addEventListener('resize', () => {
        // 幅が変わった場合にのみ generateFeatures を実行
        if (window.innerWidth !== lastWidth) {
            generateFeatures();
            lastWidth = window.innerWidth;
        }
    });
});
