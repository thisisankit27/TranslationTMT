var targetLang = ''; // Global variable to store the target language
var sourceLang = ''; // Global variable to store the target language

function selectChat(lang) {
    // Remove 'active' class from all sideBar-body elements
    const sideBarBodies = document.querySelectorAll('.sideBar-body');
    sideBarBodies.forEach(body => {
        body.classList.remove('active');
    });

    // Add 'active' class to the selected sideBar-body
    const selectedChat = document.querySelector(`.sideBar-body[data-lang='${lang}']`);
    if (selectedChat) {
        selectedChat.classList.add('active');
        // Update the heading avatar based on the selected language
        const headingAvatar = document.querySelector('#heading-avatar-icon-chat img');
        switch (lang) {
            case 'hi':
                headingAvatar.src = staticUrl + 'images/hindi.png';
                break;
            case 'bn':
                headingAvatar.src = staticUrl + 'images/bangla.png';
                break;
            case 'fr':
                headingAvatar.src = staticUrl + 'images/french.jpg';
                break;
            case 'de':
                headingAvatar.src = staticUrl + 'images/german.png';
                break;
            case 'zh':
                headingAvatar.src = staticUrl + 'images/chinese.jpg';
                break;
            // Add more cases for other languages if needed
        }
        document.getElementById('comment').focus();
        targetLang = lang;
        sourceLang = 'en';
    }
}

function swapLanguages() {
    // Swap the values of sourceLang and targetLang
    var tempLang = sourceLang;
    sourceLang = targetLang;
    targetLang = tempLang;

    // Toggle the color of the language icon between blue and red
    var icon = document.querySelector('.fa-language');
    if (icon.style.color === 'blue') {
        icon.style.color = 'red';
    } else {
        icon.style.color = 'blue';
    }

    // Update any elements or logic that depends on sourceLang and targetLang
    // For example, you might want to update the UI to reflect the new source and target languages
    // ...

    document.getElementById('comment').focus();
}

function getCurrentTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0'); // Ensure two digits
    const minutes = now.getMinutes().toString().padStart(2, '0'); // Ensure two digits
    const currentTime = `${hours}:${minutes}`;
    return currentTime;
}

function speakText(text, lang) {
    var utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    speechSynthesis.speak(utterance);
}

function translateMe() {
    var inputSentence = document.getElementById("comment").value;
    document.getElementById("comment").value = '';

    // Display user message
    displayMessage('col-sm-12 message-main-sender', 'sender', inputSentence);

    // Make an AJAX request to your Django backend
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/translate/', true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            var response = JSON.parse(xhr.responseText);

            // Display bot's response
            displayMessage('col-sm-12 message-main-receiver', 'receiver', response.translated_text);
        }
    };

    // Send the input sentence directly as the data

    var encodedData = 'sentence=' + encodeURIComponent(inputSentence) + '&source_lang=' + encodeURIComponent(sourceLang) + '&target_lang=' + encodeURIComponent(targetLang);
    xhr.send(encodedData);
}

function displayMessage(className, className2, message) {
    var chatMessagesContainer = document.getElementById('conversation');

    // Create message container
    var messageContainer = document.createElement('div');
    messageContainer.className = 'row message-body';

    // Create message element
    var messageElement = document.createElement('div');
    messageElement.className = className;

    // Create receiver element
    var receiverElement = document.createElement('div');
    receiverElement.className = className2;

    // Create message text element
    var messageTextElement = document.createElement('div');
    messageTextElement.className = 'message-text';
    messageTextElement.innerText = message;

    // Create message time element
    var messageTimeElement = document.createElement('span');
    messageTimeElement.className = 'message-time pull-right';
    messageTimeElement.innerText = getCurrentTime();


    // Append elements
    receiverElement.appendChild(messageTextElement);
    receiverElement.appendChild(messageTimeElement);
    messageElement.appendChild(receiverElement);
    messageContainer.appendChild(messageElement);
    chatMessagesContainer.appendChild(messageContainer);

    scrollToBottom();

    messageTextElement.addEventListener('click', function () {
        if (className2 === 'receiver')
            speakText(message, targetLang);
        else
            speakText(message, 'en');
    });
}

function scrollToBottom() {
    var conversation = document.getElementById('conversation');
    conversation.scrollTop = conversation.scrollHeight;
}

document.addEventListener('DOMContentLoaded', function () {
    const commentTextarea = document.getElementById('comment');
    const startRecordingBtn = document.getElementById('startRecording');
    const recognition = new webkitSpeechRecognition() || SpeechRecognition();
    let isRecording = false;

    recognition.continuous = true;

    // Add event listener for Enter key on commentTextarea
    commentTextarea.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            translateMe();
        }
    });

    // Add event listener for click on startRecordingBtn
    startRecordingBtn.addEventListener('click', () => {
        if (isRecording) {
            recognition.stop();
        } else {
            recognition.start();
        }

        isRecording = !isRecording;
        toggleMicrophoneIcon();
    });

    recognition.onresult = (event) => {
        const result = event.results[event.results.length - 1][0].transcript;
        commentTextarea.value += result;
    };

    recognition.onend = () => {
        toggleMicrophoneIcon();
    };

    function toggleMicrophoneIcon() {
        const icon = startRecordingBtn.querySelector('i');
        if (isRecording) {
            icon.classList.remove('fa-microphone-slash');
            icon.classList.add('fa-microphone');
            icon.style.color = 'green';
        } else {
            icon.classList.remove('fa-microphone');
            icon.classList.add('fa-microphone-slash');
            icon.style.color = 'red';
            document.getElementById('comment').focus();
        }
    }
});

window.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('comment').focus();
});