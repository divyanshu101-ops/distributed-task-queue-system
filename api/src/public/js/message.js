function displayMessage(message, isSuccess = true, duration = 2500) {

    const oldMessage = document.querySelector(".message-box");

    if (oldMessage) {

        oldMessage.remove();

    }

    const messageBox = document.createElement("div");

    messageBox.className = "message-box";

    if (!isSuccess) {

        messageBox.classList.add("error");

    }

    messageBox.textContent = message;

    document.body.appendChild(messageBox);

    setTimeout(() => {

        messageBox.classList.add("show");

    }, 100);

    setTimeout(() => {

        messageBox.classList.remove("show");

        setTimeout(() => {

            messageBox.remove();

        }, 300);

    }, duration);

}