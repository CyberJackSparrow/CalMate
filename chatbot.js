"; // Replace with your actual API key
const model = "microsoft/DialoGPT-medium"; // Better conversational AI

async function chatWithCalMateAI(userMessage) {
    try {
        const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ inputs: `You are a fitness and nutrition expert. Answer this: ${userMessage}` })
        });

        if (!response.ok) {
            console.error(`Error: ${response.status}`);
            return "Oops! Something went wrong.";
        }

        const data = await response.json();

        // Extract correct response from API data
        if (data && typeof data === "object" && data.generated_text) {
            return data.generated_text;
        } else {
            return "Hmm, I'm not sure. Can you try asking in a different way?";
        }
    } catch (error) {
        console.error("Error:", error);
        return "I’m having trouble connecting to the AI. Try again later.";
    }
}

// Handling Chatbot UI Interactions
document.getElementById("sendMessage").addEventListener("click", async function () {
    const userInput = document.getElementById("chatBotInput").value;
    if (!userInput.trim()) return;

    // Display user's message in chat
    const chatBox = document.getElementById("chatBotMessages");
    const userMessageElement = document.createElement("p");
    userMessageElement.classList.add("user-message");
    userMessageElement.innerText = `You: ${userInput}`;
    chatBox.appendChild(userMessageElement);

    // Get AI response
    const aiResponse = await chatWithCalMateAI(userInput);

    // Display AI's response in chat
    const botMessageElement = document.createElement("p");
    botMessageElement.classList.add("bot-message");
    botMessageElement.innerText = `CalMateAI: ${aiResponse}`;
    chatBox.appendChild(botMessageElement);

    // Clear input box
    document.getElementById("chatBotInput").value = "";

    // Auto-scroll to latest message
    chatBox.scrollTop = chatBox.scrollHeight;
});
