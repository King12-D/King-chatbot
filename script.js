// Global variables - declared only once
const chatbox = document.getElementById("chatbox");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const clearButton = document.getElementById("clearButton");
const themeToggle = document.getElementById("themeToggle");
const startChat = document.getElementById("startChat");
const imageUpload = document.getElementById("imageUpload");

const landing = document.getElementById("landing");
const chatUI = document.getElementById("chatUI");
const chatFooter = document.getElementById("chatFooter");

let receiving = false;
let websocket = null;
const chatId = crypto.randomUUID();
const systemPrompt = "Y'ello, I am King_Dav your AI developer for KING-AI and I am a software engineer.";

// Function to create a message element
function createMessageElement(text, alignment) {
  const wrapper = document.createElement("div");
  wrapper.className = `flex items-start gap-2 ${alignment === "left" ? "self-start" : "self-end flex-row-reverse"}`;

  const avatar = document.createElement("img");
  avatar.src = alignment === "left" ? "bot.jpg" : "user.jpg";
  avatar.className = "w-8 h-8 rounded-full";

  const bubble = document.createElement("div");
  bubble.className = `p-3 rounded-lg max-w-[75%] whitespace-pre-wrap ${
    alignment === "left" ? "bg-gray-100 dark:bg-blue-700" : "bg-blue-100 dark:bg-blue-600 text-right"
  }`;
  bubble.textContent = text;

  const timestamp = document.createElement("span");
  timestamp.className = "text-xs text-gray-400 mt-1 block";
  timestamp.textContent = new Date().toLocaleTimeString();

  wrapper.append(avatar, bubble, timestamp);
  return wrapper;
}

// Function to create the typing indicator
function createTypingIndicator() {
  const indicator = document.createElement("div");
  indicator.className = "typing-indicator self-start";
  indicator.innerHTML = "<span></span><span></span><span></span>";
  return indicator;
}

// Function to connect to the WebSocket
function connectWebSocket(message, isWelcome = false) {
  const url = "wss://backend.buildpicoapps.com/api/chatbot/chat";
  websocket = new WebSocket(url);

  const typing = createTypingIndicator();
  const msgEl = createMessageElement("", "left");

  chatbox.append(msgEl, typing);
  chatbox.scrollTop = chatbox.scrollHeight;

  websocket.onopen = () => {
    websocket.send(JSON.stringify({
      chatId,
      appId: "word-almost",
      systemPrompt,
      message: isWelcome ? "A very short welcome message from KING-AI" : message
    }));
  };

  websocket.onmessage = (event) => {
    typing.remove();
    msgEl.querySelector("div").textContent += event.data;
    chatbox.scrollTop = chatbox.scrollHeight;

    // Play receiving sound
    document.getElementById('receiveSound').play();
  };

  websocket.onclose = () => {
    typing.remove();
    receiving = false;
    sendButton.textContent = "Send";
  };
}

// Event listener for the send button
sendButton.onclick = () => {
  const msg = messageInput.value.trim();
  if (!receiving && msg) {
    const userMsg = createMessageElement(msg, "right");
    chatbox.appendChild(userMsg);
    messageInput.value = "";
    receiving = true;
    sendButton.textContent = "Cancel";

    // Play sending sound
    document.getElementById('sendSound').play();

    connectWebSocket(msg);
  } else if (receiving) {
    websocket?.close(1000);
  }
};

// Event listener for the input field (Enter key)
messageInput.onkeydown = (e) => {
  if (e.key === "Enter") sendButton.click();
};

// Event listener for clearing the chat
clearButton.onclick = () => {
  chatbox.innerHTML = "";
  chatUI.classList.add("hidden");
  chatFooter.classList.add("hidden");
  landing.classList.remove("hidden");
};

// Event listener for theme toggle
themeToggle.onclick = () => {
  // Toggle the dark mode class on the body
  const isDarkMode = document.body.classList.toggle("dark");

  // Change the button text based on the theme
  themeToggle.textContent = isDarkMode ? "Light" : "Dark";  // Light mode text when dark mode is active, and vice versa

  // Save the user's theme preference in localStorage so it's persisted on page reload
  localStorage.setItem("theme", isDarkMode ? "dark" : "light");
};

// Check for saved theme preference in localStorage and apply it on page load
window.onload = () => {
  const savedTheme = localStorage.getItem("theme");

  // If a saved theme is found, apply it, otherwise default to light mode
  if (savedTheme === "dark") {
    document.body.classList.add("dark");
    themeToggle.textContent = "Light";  // Show "Light" text if dark mode is applied
  } else {
    themeToggle.textContent = "Dark";   // Show "Dark" text if light mode is applied
  }
};

// Event listener for starting the chat
startChat.onclick = () => {
  landing.classList.add("hidden");
  chatUI.classList.remove("hidden");
  chatFooter.classList.remove("hidden");
  connectWebSocket("", true);
};

// Event listener for image upload
imageUpload.onchange = (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const fileMsg = createMessageElement(`Image: ${file.name}`, "right");

      // Create a preview
      const imagePreview = document.createElement("img");
      imagePreview.src = readerEvent.target.result;
      imagePreview.className = "w-40 h-40 object-cover rounded-md";
      fileMsg.querySelector("div").appendChild(imagePreview);

      chatbox.appendChild(fileMsg);
      chatbox.scrollTop = chatbox.scrollHeight;
    };
    reader.readAsDataURL(file);
  }
};