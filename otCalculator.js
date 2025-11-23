// OT Calculation Script
        // Get elements
        const mode12 = document.getElementById('12hr-btn');
        const mode24 = document.getElementById('24hr-btn');
        const startAmPm = document.getElementById('start-ampm');
        const endAmPm = document.getElementById('end-ampm');
        const shiftInput = document.getElementById('shift-hours');
        const startInput = document.getElementById('start-time');
        const endInput = document.getElementById('end-time');
        const otDisplay = document.getElementById('ot-display');
        const startAm = document.getElementById('start-am');
        const startPm = document.getElementById('start-pm');
        const endAm = document.getElementById('end-am');
        const endPm = document.getElementById('end-pm');

        // Function to auto-insert ":" after HH
        function autoInsertColon(input) {
            input.addEventListener('input', function() {
                let val = this.value;
                if (val.length === 2 && !val.includes(':')) {
                    this.value = val + ':';
                }
            });
        }

        // Apply to time inputs
        autoInsertColon(shiftInput);
        autoInsertColon(startInput);
        autoInsertColon(endInput);

        // Mode switching
        mode12.addEventListener('click', () => {
            mode12.classList.add('active');
            mode24.classList.remove('active');
            startAmPm.style.display = 'inline';
            endAmPm.style.display = 'inline';
            calculateOT();
        });

        mode24.addEventListener('click', () => {
            mode24.classList.add('active');
            mode12.classList.remove('active');
            startAmPm.style.display = 'none';
            endAmPm.style.display = 'none';
            calculateOT();
        });

        // AM/PM button toggles
        startAm.addEventListener('click', () => {
            startAm.classList.add('active');
            startPm.classList.remove('active');
            calculateOT();
        });

        startPm.addEventListener('click', () => {
            startPm.classList.add('active');
            startAm.classList.remove('active');
            calculateOT();
        });

        endAm.addEventListener('click', () => {
            endAm.classList.add('active');
            endPm.classList.remove('active');
            calculateOT();
        });

        endPm.addEventListener('click', () => {
            endPm.classList.add('active');
            endAm.classList.remove('active');
            calculateOT();
        });

        // Function to parse time string to minutes
        function parseTime(timeStr, is12hr, ampm) {
            if (!timeStr || !timeStr.includes(':')) return null;
            const [hours, minutes] = timeStr.split(':').map(Number);
            if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
            let totalMinutes = hours * 60 + minutes;
            if (is12hr) {
                if (ampm === 'PM' && hours !== 12) totalMinutes += 12 * 60;
                if (ampm === 'AM' && hours === 12) totalMinutes = minutes;
            }
            return totalMinutes;
        }

        // Function to calculate OT
        function calculateOT() {
            const shiftStr = shiftInput.value.trim();
            const startStr = startInput.value.trim();
            const endStr = endInput.value.trim();

            if (!shiftStr || !startStr || !endStr) {
                otDisplay.textContent = '00:00';
                return;
            }

            const is12hr = mode12.classList.contains('active');
            const startAmpm = startAm.classList.contains('active') ? 'AM' : 'PM';
            const endAmpm = endAm.classList.contains('active') ? 'AM' : 'PM';

            const shiftMins = parseTime(shiftStr, false, ''); // Shift hours assumed in 24hr format
            const startMins = parseTime(startStr, is12hr, startAmpm);
            const endMins = parseTime(endStr, is12hr, endAmpm);

            if (shiftMins === null || startMins === null || endMins === null) {
                otDisplay.textContent = 'Invalid';
                return;
            }

            let workedMins = endMins - startMins;
            if (workedMins < 0) workedMins += 24 * 60; // Handle overnight shifts

            const otMins = workedMins - shiftMins;
            if (otMins <= 0) {
                otDisplay.textContent = '00:00';
                return;
            }

            const otHours = Math.floor(otMins / 60);
            const otMinsRem = otMins % 60;
            otDisplay.textContent = `${otHours.toString().padStart(2, '0')}:${otMinsRem.toString().padStart(2, '0')}`;
        }

        // Event listeners for inputs
        shiftInput.addEventListener('input', calculateOT);
        startInput.addEventListener('input', calculateOT);
        endInput.addEventListener('input', calculateOT);