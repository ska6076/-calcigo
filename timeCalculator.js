let is12Hour = true; // Default to 12-hour format
        let startIsAM = true; // Default start to AM
        let endIsAM = true; // Default end to AM

        const btn12Hour = document.getElementById('btn12Hour');
        const btn24Hour = document.getElementById('btn24Hour');
        const btnStartAM = document.getElementById('btnStartAM');
        const btnStartPM = document.getElementById('btnStartPM');
        const btnEndAM = document.getElementById('btnEndAM');
        const btnEndPM = document.getElementById('btnEndPM');
        const startHourInput = document.getElementById('startHour');
        const startMinuteInput = document.getElementById('startMinute');
        const endHourInput = document.getElementById('endHour');
        const endMinuteInput = document.getElementById('endMinute');
        const calculateBtn = document.getElementById('calculateBtn');
        const resultDiv = document.getElementById('result');
        const errorDiv = document.getElementById('error');

        // Function to toggle button active state
        function setActiveButton(buttons, activeBtn) {
            buttons.forEach(btn => btn.classList.remove('active'));
            activeBtn.classList.add('active');
        }

        // Function to update input max values based on format
        function updateInputLimits() {
            if (is12Hour) {
                startHourInput.min = 1;
                startHourInput.max = 12;
                endHourInput.min = 1;
                endHourInput.max = 12;
            } else {
                startHourInput.min = 0;
                startHourInput.max = 23;
                endHourInput.min = 0;
                endHourInput.max = 23;
            }
        }

        // Event listeners for format buttons
        btn12Hour.addEventListener('click', () => {
            is12Hour = true;
            setActiveButton([btn12Hour, btn24Hour], btn12Hour);
            document.querySelectorAll('.ampm-buttons button').forEach(btn => btn.disabled = false);
            updateInputLimits();
        });

        btn24Hour.addEventListener('click', () => {
            is12Hour = false;
            setActiveButton([btn12Hour, btn24Hour], btn24Hour);
            document.querySelectorAll('.ampm-buttons button').forEach(btn => btn.disabled = true);
            updateInputLimits();
        });

        // Event listeners for AM/PM buttons
        btnStartAM.addEventListener('click', () => {
            startIsAM = true;
            setActiveButton([btnStartAM, btnStartPM], btnStartAM);
        });

        btnStartPM.addEventListener('click', () => {
            startIsAM = false;
            setActiveButton([btnStartAM, btnStartPM], btnStartPM);
        });

        btnEndAM.addEventListener('click', () => {
            endIsAM = true;
            setActiveButton([btnEndAM, btnEndPM], btnEndAM);
        });

        btnEndPM.addEventListener('click', () => {
            endIsAM = false;
            setActiveButton([btnEndAM, btnEndPM], btnEndPM);
        });

        // Function to parse time inputs
        function parseTime(hour, minute, isAM) {
            let hours = parseInt(hour);
            let minutes = parseInt(minute);
            if (isNaN(hours) || isNaN(minutes) || minutes < 0 || minutes > 59) return null;

            if (is12Hour) {
                if (hours < 1 || hours > 12) return null;
                if (!isAM && hours !== 12) hours += 12;
                if (isAM && hours === 12) hours = 0;
            } else {
                if (hours < 0 || hours > 23) return null;
            }
            return hours * 60 + minutes; // Return total minutes
        }

        // Function to calculate difference
        calculateBtn.addEventListener('click', () => {
            errorDiv.textContent = '';
            resultDiv.textContent = '';

            const startHour = startHourInput.value.trim();
            const startMinute = startMinuteInput.value.trim();
            const endHour = endHourInput.value.trim();
            const endMinute = endMinuteInput.value.trim();

            if (!startHour || !startMinute || !endHour || !endMinute) {
                errorDiv.textContent = 'Please enter all time fields.';
                return;
            }

            const startMinutes = parseTime(startHour, startMinute, startIsAM);
            const endMinutes = parseTime(endHour, endMinute, endIsAM);

            if (startMinutes === null || endMinutes === null) {
                errorDiv.textContent = 'Select 24hr Time Zone';
                return;
            }

            let diffMinutes = endMinutes - startMinutes;
            if (diffMinutes < 0) diffMinutes += 24 * 60; // Assume next day if negative

            const hours = Math.floor(diffMinutes / 60);
            const minutes = diffMinutes % 60;

            resultDiv.textContent = `${hours}:${minutes} hr`;
        });

        // Initial setup
        updateInputLimits();
        document.querySelectorAll('.ampm-buttons button').forEach(btn => btn.disabled = false);