document.addEventListener("DOMContentLoaded", () => {
    const socket = io();
    let sessionToken = "";
    const msgInput = document.getElementById("msg");
    const sendBtn = document.getElementById("submit-btn");
    const messages = document.getElementById("messages");
    const toTokenInput = document.getElementById("toToken");
    const myTokenDisplay = document.getElementById("myToken");

    const cssInput = document.getElementById('msg');
    const submitBtn = document.getElementById('submit-btn');
    let cssBackgroundImage;
    let isClicked = true;

    function update(){
      submitBtn.disabled = isClicked;
    }

    update();

    submitBtn.addEventListener('click', () => {
      cssBackgroundImage = cssInput.value;
      isClicked = true;
      document.body.style.backgroundImage = cssBackgroundImage;
      update();
    })

    cssInput.addEventListener('input', () => {
      if (cssInput.value === ""){
         isClicked = true;
      } else {
         isClicked = false;
      }
      update();
    });


    // Get token from server
    // Get token from server
    const copyBtn = document.createElement('button');
    copyBtn.id = 'copyBtn';
    copyBtn.innerHTML = '<i class="fa-solid fa-copy" aria-hidden="true"></i>';

    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(sessionToken);
        copyBtn.textContent = 'Copied!';
      } catch (err) {
        console.error('Copy failed', err);
      }
    });

        fetch("/get-token")
            .then(r => r.json())
            .then(j => {
                sessionToken = j.token;
                myTokenDisplay.textContent = sessionToken;
                myTokenDisplay.parentNode.insertBefore(copyBtn, myTokenDisplay.nextSibling);
                socket.emit("registerToken", sessionToken);
            })
            .catch(err => console.error("Token fetch error:", err));

      // Send private message
      sendBtn.onclick = () => {
            const text = msgInput.value.trim();
            const toToken = toTokenInput.value.trim();

            if (text && toToken) {
                socket.emit("privateMessage", { fromToken: sessionToken, toToken, text });
                messages.value += `(Sent to ${toToken}): ${text}\n`;
                msgInput.value = "";
            }
            else if (!toToken) {
                alert("Please Enter Session Token of other user whom you want to send the text message!")
            }
          };

           // Receive message
      socket.on("chatMessage", (msg) => {
        messages.value += msg + "\n";
        messages.scrollTop = messages.scrollHeight;
      });
    });