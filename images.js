// 画像URLとテキストのリストを定義
const imageData = [
  {
    "url": "https://kinoko-wiki.com/easyedit/kcfinder/upload/images/%E5%A4%96%E8%A6%B3%E4%BA%A4%E6%B5%81%E4%BC%9A/202509/test01.png",
    "text": "◯◯◯◯◯◯◯◯◯◯",
    "uid": "TEST1",
    "serverId": "test"
  },
  {
    "url": "https://kinoko-wiki.com/easyedit/kcfinder/upload/images/%E5%A4%96%E8%A6%B3%E4%BA%A4%E6%B5%81%E4%BC%9A/202509/test02.png",
    "text": "アラビアンタイムマシン",
    "uid": "TEST2",
    "serverId": "test"
  },
  {
    "url": "https://kinoko-wiki.com/easyedit/kcfinder/upload/images/%E5%A4%96%E8%A6%B3%E4%BA%A4%E6%B5%81%E4%BC%9A/202509/test03.png",
    "text": "狼の使者",
    "uid": "TEST3",
    "serverId": "test"
  },
  {
    "url": "https://kinoko-wiki.com/easyedit/kcfinder/upload/images/%E5%A4%96%E8%A6%B3%E4%BA%A4%E6%B5%81%E4%BC%9A/202509/test04.png",
    "text": "森の王子様",
    "uid": "TEST4",
    "serverId": "test"
  },
  {
    "url": "https://kinoko-wiki.com/easyedit/kcfinder/upload/images/%E5%A4%96%E8%A6%B3%E4%BA%A4%E6%B5%81%E4%BC%9A/202509/test05.png",
    "text": "宇宙魔法戦士",
    "uid": "TEST5",
    "serverId": "test"
  },
  {
    "url": "https://kinoko-wiki.com/easyedit/kcfinder/upload/images/%E5%A4%96%E8%A6%B3%E4%BA%A4%E6%B5%81%E4%BC%9A/202509/test06.png",
    "text": "竜を駆る者",
    "uid": "TEST6",
    "serverId": "test"
  },
  {
    "url": "https://kinoko-wiki.com/easyedit/kcfinder/upload/images/%E5%A4%96%E8%A6%B3%E4%BA%A4%E6%B5%81%E4%BC%9A/202509/test07.png",
    "text": "豊穣の使者",
    "uid": "TEST7",
    "serverId": "test"
  },
  {
    "url": "https://kinoko-wiki.com/easyedit/kcfinder/upload/images/%E5%A4%96%E8%A6%B3%E4%BA%A4%E6%B5%81%E4%BC%9A/202509/test08.png",
    "text": "裁定を下す者",
    "uid": "TEST8",
    "serverId": "test"
  },
  {
    "url": "https://kinoko-wiki.com/easyedit/kcfinder/upload/images/%E5%A4%96%E8%A6%B3%E4%BA%A4%E6%B5%81%E4%BC%9A/202509/test09.png",
    "text": "( ˘ω˘)ｽﾔｧ",
    "uid": "TEST9",
    "serverId": "test"
  },
  {
    "url": "https://kinoko-wiki.com/easyedit/kcfinder/upload/images/%E5%A4%96%E8%A6%B3%E4%BA%A4%E6%B5%81%E4%BC%9A/202509/test10.png",
    "text": "お菓子の魔法使い",
    "uid": "TEST0",
    "serverId": "test"
  }
];
// Google Apps ScriptのURL
const scriptUrl = "https://script.google.com/macros/s/AKfycbz8tSaybeBFlyNv5KAQstxHcY8a2hfVNiU3qz6JsizcgDJSFeYrG5E_ixdrz9096eE60w/exec";

// === Fisher-Yatesシャッフルアルゴリズム ===
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// === いいね機能の追加 ===
function setupLikeButtons(shuffledData) {
    const likeButtons = document.querySelectorAll('.like-button');
    
    likeButtons.forEach(button => {
        const item = button.closest('.feature-item');
        const itemId = item.dataset.itemId;
        
        // ローカルストレージをチェック
        if (localStorage.getItem('liked_' + itemId)) {
            button.disabled = true;
            button.classList.add('liked'); // likedクラスを追加して色を変更
        }

        button.addEventListener('click', async () => {
            if (button.disabled) {
                return;
            }

            button.classList.add('liked'); // likedクラスを追加して色を変更
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
                        imageUrl: itemData.url
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
    const numberOfItems = itemsPerRow * 2;

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
