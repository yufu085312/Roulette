$(document).ready(function () {
    const rouletteWheel = $('#roulette-wheel');
    const wheelContent = $('#wheel-content');
    const spinButton = $('#spin-button');
    const resultDisplay = $('#result');
    const itemInput = $('#item-input');
    const addItemButton = $('#add-item-button');

    // Initial Data
    let items = ['Lunch', 'Dinner', 'Snack'];

    // A more premium, pastel/vibrant color palette
    const colors = [
        '#FF9A9E', // Pink
        '#FECFEF', // Light Pink
        '#A18CD1', // Purple
        '#FBC2EB', // Lavender
        '#8FD3F4', // Light Blue
        '#84FAB0', // Mint
        '#E0C3FC'  // Light Violet
    ];

    /**
     * Render the roulette wheel
     * @param {string[]} currentItems
     */
    function renderWheel(currentItems) {
        const totalItems = currentItems.length;
        wheelContent.empty();
        wheelContent.css('transform', 'rotate(0deg)');

        if (totalItems === 0) {
            wheelContent.css('background', 'rgba(255,255,255,0.2)');
            return;
        }

        let gradientSegments = [];
        const anglePerItem = 360 / totalItems;
        const radius = rouletteWheel.width() / 2;

        currentItems.forEach((item, index) => {
            const start = index * anglePerItem;
            const end = (index + 1) * anglePerItem;
            const middleAngle = start + anglePerItem / 2;

            const color = colors[index % colors.length];
            gradientSegments.push(`${color} ${start}deg ${end}deg`);

            // Check contrast logic slightly or just use white text with shadow
            // Create label
            const label = $('<div class="item-label"></div>').text(item);

            // CSSを設定して配置と回転を行う
            // .item-label in CSS is width: 50%, top: 50%, left: 50%, transform-origin: 0 50%
            // So we just need to rotate it to the middle angle.
            // Conic gradient starts at 12 o'clock (0deg), but CSS rotation 0deg is 3 o'clock.
            // We need to subtract 90 degrees to align them.
            label.css({
                'transform': `translateY(-50%) rotate(${middleAngle - 90}deg)`
            });
            wheelContent.append(label);
        });

        const gradient = `conic-gradient(${gradientSegments.join(', ')})`;
        wheelContent.css('background', gradient);
    }

    /**
     * Update the item list UI
     * @param {string[]} items 
     */
    function updateItemList(items) {
        const itemList = $('#item-list');
        itemList.empty();
        items.forEach((item, index) => {
            const listItem = $('<li></li>');
            const itemText = $('<span></span>').text(item);

            // Edit Button
            const editButton = $('<button class="edit-btn"><i class="fa-solid fa-pen"></i></button>').on('click', function () {
                const inputField = $('<input type="text" />').val(item);
                const saveButton = $('<button class="edit-btn"><i class="fa-solid fa-check"></i></button>').on('click', function () {
                    const newItem = inputField.val().trim();
                    if (newItem) {
                        items[index] = newItem;
                        redrawAll();
                    }
                });
                listItem.empty().append(inputField).append(saveButton);
                inputField.focus();
            });

            // Delete Button
            const deleteButton = $('<button class="delete-btn"><i class="fa-solid fa-trash"></i></button>').on('click', function () {
                if (items.length <= 2) {
                    alert('At least 2 items are required!');
                    return;
                }
                items.splice(index, 1);
                redrawAll();
            });

            listItem.append(itemText).append($('<div></div>').append(editButton).append(deleteButton));
            itemList.append(listItem);
        });
    }

    function redrawAll() {
        renderWheel(items);
        updateItemList(items);
    }

    // --- Events ---

    addItemButton.on('click', function () {
        const newItem = itemInput.val().trim();
        if (newItem) {
            items.push(newItem);
            itemInput.val('');
            redrawAll();
        } else {
            // Optional: Shake animation for error or just ignore
            itemInput.focus();
        }
    });

    itemInput.on('keypress', function(e) {
        if (e.which === 13) {
            addItemButton.click(); 
        }
    });

    let isSpinning = false;

    spinButton.on('click', function () {
        if (isSpinning) return;

        if (spinButton.text().includes('RESET')) {
            wheelContent.css({
                'transition': 'none',
                'transform': 'rotate(0deg)'
            });
            resultDisplay.text('');
            spinButton.html('<i class="fa-solid fa-play"></i> START');
            spinButton.removeClass('btn-secondary').addClass('btn-primary');
            return;
        }

        if (items.length === 0) return;

        isSpinning = true;
        spinButton.prop('disabled', true);
        resultDisplay.text('');

        const totalItems = items.length;
        const anglePerItem = 360 / totalItems;
        const randomIndex = Math.floor(Math.random() * totalItems);
        const selectedItem = items[randomIndex];

        // Calculate stop angle to point to the pin (top)
        // Pin is at -90deg (top) visually, so we need to align the segment there.
        // If segment 0 starts at 0deg, to bring it to top (-90/270), we rotate.
        // However, the previous logic worked, let's stick to the relative rotation logic but ensure it lands right.
        // Let's rely on visual calibration or simpler logic:
        // Pin is at top. Segment 0 is 0-X deg.

        const stopAngle = anglePerItem * (totalItems - 1 - randomIndex) + anglePerItem / 2;
        // Add extra spins
        const extraSpins = 360 * 5;
        const totalRotation = extraSpins + stopAngle;

        const newRotation = totalRotation;

        wheelContent.css({
            'transition': 'transform 4s cubic-bezier(0.15, 0.9, 0.3, 1)',
            'transform': `rotate(${newRotation}deg)`
        });

        setTimeout(() => {
            resultDisplay.text(selectedItem);
            spinButton.prop('disabled', false);
            spinButton.html('<i class="fa-solid fa-rotate-right"></i> RESET');
            isSpinning = false;
        }, 4000);
    });

    // Resize handler
    $(window).on('resize', function() {
        renderWheel(items);
    });

    // Initial Draw
    redrawAll();
});
