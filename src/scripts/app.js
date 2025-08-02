$(document).ready(function () {
    const rouletteWheel = $('#roulette-wheel');
    const wheelContent = $('#wheel-content');
    const spinButton = $('#spin-button');
    const resultDisplay = $('#result');
    const itemInput = $('#item-input');
    const addItemButton = $('#add-item-button');

    // 初期データ。空にしてユーザー入力のみにすることも可能
    let items = ['項目1', '項目2'];

    /**
     * ルーレットの盤面と項目ラベルを描画する関数
     * @param {string[]} currentItems - ルーレットに表示する項目の配列
     */
    function renderWheel(currentItems) {
        const totalItems = currentItems.length;
        wheelContent.empty(); // 既存のラベルをクリア
        wheelContent.css('transform', 'rotate(0deg)'); // 回転をリセット

        if (totalItems === 0) {
            rouletteWheel.css('background', '#f0f0f0'); // 項目がない場合は単色表示
            return;
        }

        let gradientSegments = [];
        const anglePerItem = 360 / totalItems;
        const radius = rouletteWheel.width() / 2;

        // 使用する色のリスト
        const colors = ['#dc3545', '#007bff', '#28a745', '#ffc107', '#17a2b8', '#6f42c1'];
        
        currentItems.forEach((item, index) => {
            const start = index * anglePerItem;
            const end = (index + 1) * anglePerItem;
            const middleAngle = start + anglePerItem / 2;

            // 色を順番に適用
            const color = colors[index % colors.length];
            gradientSegments.push(`${color} ${start}deg ${end}deg`);

            // 項目名を配置するラベル要素を作成
            const label = $('<div class="item-label"></div>').text(item);

            // ラベルの位置を三角関数で計算 (半径の60%の位置に配置)
            const labelRadius = radius * 0.6;
            const x = labelRadius * Math.cos(middleAngle * Math.PI / 180);
            const y = labelRadius * Math.sin(middleAngle * Math.PI / 180);

            // CSSを設定して配置と回転を行う
            label.css({
                'left': `calc(50% + ${y}px)`,
                'top': `calc(50% - ${x}px)`,
                'transform': `translate(-50%, -50%) rotate(${middleAngle}deg) rotate(-${middleAngle}deg)`
            });
            wheelContent.append(label);
        });

        // conic-gradientでルーレットの背景を作成
        const gradient = `conic-gradient(${gradientSegments.join(', ')})`;
        wheelContent.css('background', gradient);
        rouletteWheel.css('background', '#f0f0f0'); // 外枠は単色
    }

    /**
     * 入力項目リストを更新する関数
     * @param {string[]} currentItems - 表示する項目の配列
     */
    function updateItemList(items) {
        const itemList = $('#item-list');
        itemList.empty();
        items.forEach((item, index) => {
            const listItem = $('<li></li>');
            const itemText = $('<span></span>').text(item);
            const editButton = $('<button>編集</button>').on('click', function () {
                const inputField = $('<input type="text" />').val(item);
                const saveButton = $('<button>保存</button>').on('click', function () {
                    const newItem = inputField.val().trim();
                    if (newItem) {
                        items[index] = newItem;
                        renderWheel(items);
                        updateItemList(items);
                    }
                });
                listItem.empty().append(inputField).append(saveButton);
            });
            const deleteButton = $('<button>削除</button>').on('click', function () {
                items.splice(index, 1);
                renderWheel(items);
                updateItemList(items);
            });
            listItem.append(itemText).append(editButton).append(deleteButton);
            itemList.append(listItem);
        });
    }

    /**
     * 全体の再描画を行う関数
     */
    function redrawAll() {
        renderWheel(items);
        updateItemList(items);
    }

    // --- イベントハンドラ ---

    // 「追加」ボタンのクリックイベント
    addItemButton.on('click', function () {
        const newItem = itemInput.val().trim();
        if (newItem) {
            items.push(newItem);
            itemInput.val('');
            redrawAll();
            // alert(`項目「${newItem}」が追加されました！`);
        } else {
            alert('項目を入力してください。');
        }
    });

    // 「項目を入力」フィールドでEnterキーを押した時のイベント
    itemInput.on('keypress', function(e) {
        if (e.which === 13) { // Enterキーのキーコードは13
            addItemButton.click(); // 追加ボタンのクリックイベントを発火
        }
    });


    // 「削除」ボタンのクリックイベント (イベント委譲)
    $('#item-list').on('click', '.delete-item-button', function() {
        if (items.length <= 2) {
            alert('項目は2つ以上必要です。');
            return;
        }
        const indexToDelete = $(this).data('index');
        items.splice(indexToDelete, 1); // 配列から項目を削除
        redrawAll();
    });

    // ボタンの状態管理用
    let isSpinning = false;
    let isResultShown = false;
    let lastRotation = 0;

    spinButton.on('click', function () {
        if (isSpinning) return;

        if (!isResultShown) {
            // スピン処理
            if (items.length === 0) {
                alert('項目を追加してください。');
                return;
            }
            isSpinning = true;
            $(this).prop('disabled', true);
            resultDisplay.text('');

            const totalItems = items.length;
            const anglePerItem = 360 / totalItems;
            const randomIndex = Math.floor(Math.random() * totalItems);
            const selectedItem = items[randomIndex];
            const stopAngle = anglePerItem * (totalItems - 1 - randomIndex) + anglePerItem / 2;
            const currentRotation = wheelContent.css('transform');
            let currentAngle = 0;
            if (currentRotation && currentRotation !== 'none') {
                const values = currentRotation.split('(')[1].split(')')[0].split(',');
                const a = parseFloat(values[0]);
                const b = parseFloat(values[1]);
                currentAngle = Math.round(Math.atan2(b, a) * (180/Math.PI));
            }
            const totalRotation = 360 * 5 + stopAngle;
            const newRotation = currentAngle + totalRotation;
            lastRotation = newRotation;

            wheelContent.css({
                'transition': 'transform 4s cubic-bezier(0.23, 1, 0.32, 1)',
                'transform': `rotate(${newRotation}deg)`
            });

            setTimeout(() => {
                resultDisplay.text(`結果：${selectedItem}`);
                spinButton.prop('disabled', false);
                spinButton.text('リセット');
                isSpinning = false;
                isResultShown = true;
            }, 4000);
        } else {
            // リセット処理
            wheelContent.css({
                'transition': 'none',
                'transform': 'rotate(0deg)'
            });
            resultDisplay.text('');
            spinButton.text('回す');
            isResultShown = false;
            lastRotation = 0;
        }
    });

    // --- 初期化処理 ---
    redrawAll();

    // ウィンドウリサイズ時はラベルのみ再描画（レスポンシブ対応）
    $(window).on('resize', function() {
        renderWheel(items);
    });
});
