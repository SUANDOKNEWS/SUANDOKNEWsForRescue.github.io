// Global variables to store selected values
let scores = {
    respiratory: null,
    oxygen: null,
    supp_oxygen: null,
    temperature: null,
    bp: null,
    heart_rate: null,
    avpu: null
};

let selectedValues = {
    gender: null,
    age: null
};

// Function to handle option selection for scoring parameters
function selectOption(category, score, button) {
    // Remove active class from all buttons in this category
    const categoryButtons = document.querySelectorAll(`#${category} button`);
    categoryButtons.forEach(btn => btn.classList.remove('active'));

    // Add active class to selected button
    button.classList.add('active');

    // Store the score
    if (category === 'gender' || category === 'age') {
        selectedValues[category] = button.textContent.trim();
    } else {
        scores[category] = score;
    }

    // Update total score
    updateTotalScore();
}

// Function to handle oxygen scale selection
function selectOxygenOption(scale, score, button) {
    // Remove active class from all oxygen buttons
    const allOxygenButtons = document.querySelectorAll('#oxygen_scale1 button, #oxygen_scale2 button');
    allOxygenButtons.forEach(btn => btn.classList.remove('active'));

    // Add active class to selected button
    button.classList.add('active');

    // Store the score for oxygen
    scores.oxygen = score;

    // Update total score
    updateTotalScore();
}

// Function to calculate and update total score
function updateTotalScore() {
    let total = 0;
    let hasRedScore = false;

    // Calculate total from all scores
    Object.values(scores).forEach(score => {
        if (score !== null) {
            total += score;
            if (score === 3) {
                hasRedScore = true;
            }
        }
    });

    // Update total score display
    document.getElementById('totalScore').textContent = total;

    // Update advice based on score (only if form is complete)
    if (isFormComplete()) {
        updateAdvice(total, hasRedScore);
    } else {
        const adviceElement = document.getElementById('advice');
        adviceElement.textContent = 'กรุณาเลือกให้ครบทุกข้อเพื่อดูคำแนะนำ';
        adviceElement.className = 'incomplete';
    }

    // Enable/disable save button based on completion
    const saveButton = document.getElementById('saveButton');
    if (saveButton) {
        saveButton.disabled = !isFormComplete();
        saveButton.style.opacity = isFormComplete() ? '1' : '0.5';
    }
}

// Function to update advice based on total score
function updateAdvice(total, hasRedScore) {
    const adviceElement = document.getElementById('advice');
    let advice = '';
    let className = '';

    if (hasRedScore) {
        advice = 'ตรวจพบ RED Score คะแนนแดง - ต้องได้รับการดูแลอย่างเร่งด่วน';
        className = 'red-alert';
    } else if (total >= 7) {
        advice = 'คะแนนสูง - Emergent ฉุกเฉิน';
        className = 'high-score';
    } else if (total >= 5) {
        advice = 'คะแนนปานกลาง - Urgent เร่งด่วน';
        className = 'medium-score';
    } else if (total >= 3) {
        advice = 'คะแนนต่ำ-ปานกลาง - Less Urgent เร่งด่วนน้อย';
        className = 'low-medium-score';
    } else {
        advice = 'คะแนนต่ำ - Non Urgent ไม่เร่งด่วน';
        className = 'low-score';
    }

    adviceElement.textContent = advice;
    adviceElement.className = className;
}

// Function to reset all scores
function resetScores() {
    // Reset all scores
    scores = {
        respiratory: null,
        oxygen: null,
        supp_oxygen: null,
        temperature: null,
        bp: null,
        heart_rate: null,
        avpu: null
    };

    // Reset selected values
    selectedValues = {
        gender: null,
        age: null
    };

    // Remove active class from all buttons
    const allButtons = document.querySelectorAll('button');
    allButtons.forEach(button => {
        if (button.id !== 'resetButton') {
            button.classList.remove('active');
        }
    });

    // Reset total score display
    document.getElementById('totalScore').textContent = '0';

    // Reset advice
    const adviceElement = document.getElementById('advice');
    adviceElement.textContent = '';
    adviceElement.className = '';
}

// Function to check if all required fields are completed
function isFormComplete() {
    // Check gender and age
    if (!selectedValues.gender || !selectedValues.age) {
        return false;
    }

    // Check all scoring parameters are selected
    const requiredScores = ['respiratory', 'oxygen', 'supp_oxygen', 'temperature', 'bp', 'heart_rate', 'avpu'];
    for (let category of requiredScores) {
        if (scores[category] === null) {
            return false;
        }
    }

    return true;
}

// Function to save data to statistics table
function saveToStatistics() {
    // Check if all required fields are completed
    if (!isFormComplete()) {
        alert('กรุณาเลือกให้ครบทุกข้อก่อนบันทึกข้อมูล (เพศ, อายุ และการประเมินทุกข้อ)');
        return;
    }

    // Calculate total score
    let total = 0;
    Object.values(scores).forEach(score => {
        if (score !== null) {
            total += score;
        }
    });

    // Get current date and time
    const now = new Date();
    const dateTime = now.toLocaleString('th-TH');

    // Add row to statistics table
    const tableBody = document.getElementById('statisticsBody');
    const newRow = tableBody.insertRow(0);

    // Add cells with data
    newRow.insertCell(0).textContent = selectedValues.gender;
    newRow.insertCell(1).textContent = selectedValues.age;
    newRow.insertCell(2).textContent = total;
    newRow.insertCell(3).textContent = dateTime;

    // Optional: Save to localStorage for persistence
    saveToLocalStorage();

    // Show success message
    alert('บันทึกข้อมูลเรียบร้อยแล้ว');
}

// Function to save data to localStorage
function saveToLocalStorage() {
    const data = {
        gender: selectedValues.gender,
        age: selectedValues.age,
        scores: scores,
        totalScore: Object.values(scores).reduce((sum, score) => sum + (score || 0), 0),
        timestamp: new Date().toISOString()
    };

    // Get existing data
    let savedData = JSON.parse(localStorage.getItem('newsStatistics') || '[]');

    // Add new data
    savedData.unshift(data);

    // Keep only last 50 records
    if (savedData.length > 50) {
        savedData = savedData.slice(0, 50);
    }

    // Save back to localStorage
    localStorage.setItem('newsStatistics', JSON.stringify(savedData));
}

// Function to load data from localStorage on page load
function loadFromLocalStorage() {
    const savedData = JSON.parse(localStorage.getItem('newsStatistics') || '[]');
    const tableBody = document.getElementById('statisticsBody');

    savedData.forEach(record => {
        const newRow = tableBody.insertRow();
        newRow.insertCell(0).textContent = record.gender;
        newRow.insertCell(1).textContent = record.age;
        newRow.insertCell(2).textContent = record.totalScore;
        newRow.insertCell(3).textContent = new Date(record.timestamp).toLocaleString('th-TH');
    });
}

// Add save button functionality
document.addEventListener('DOMContentLoaded', function() {
    // Load saved data when page loads
    loadFromLocalStorage();

    // Add save button if it doesn't exist
    const buttonContainer = document.querySelector('.button-container');
    if (buttonContainer && !document.getElementById('saveButton')) {
        const saveButton = document.createElement('button');
        saveButton.id = 'saveButton';
        saveButton.textContent = 'บันทึกข้อมูล';
        saveButton.onclick = saveToStatistics;
        saveButton.disabled = true;
        saveButton.style.opacity = '0.5';
        buttonContainer.appendChild(saveButton);
    }
});

// Legacy functions for backwards compatibility
function checkVital(id, min, max) {
    const input = document.getElementById(id);
    const value = parseFloat(input.value);
    const button = input.nextElementSibling.nextElementSibling;

    if (value >= min && value <= max) {
        button.style.backgroundColor = 'pink';
    } else {
        button.style.backgroundColor = 'red';
    }
}

function checkBP() {
    const input = document.getElementById('bp');
    const values = input.value.split('/');
    const button = input.nextElementSibling.nextElementSibling;

    if (values.length === 2) {
        const systolic = parseInt(values[0]);
        const diastolic = parseInt(values[1]);

        if (systolic >= 90 && systolic <= 120 && diastolic >= 60 && diastolic <= 80) {
            button.style.backgroundColor = 'pink';
        } else {
            button.style.backgroundColor = 'red';
        }
    }
}
