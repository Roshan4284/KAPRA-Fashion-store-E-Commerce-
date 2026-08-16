const API_URL = "http://127.0.0.1:8000";



// REGISTER


const registerForm = document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        const message = document.getElementById("message");

        try {

            const response = await fetch(
                `${API_URL}/auth/register`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        name: name,
                        email: email,
                        password: password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {

                message.innerHTML = `
                    <div class="alert alert-danger">
                        ${data.detail || "Registration failed"}
                    </div>
                `;

                return;
            }

            message.innerHTML = `
                <div class="alert alert-success">
                    Account created successfully!
                </div>
            `;

            registerForm.reset();

            setTimeout(() => {

                window.location.href = "/static/login.html";

            }, 1500);

        } catch (error) {

            console.error(error);

            message.innerHTML = `
                <div class="alert alert-danger">
                    Unable to connect to server.
                </div>
            `;
        }

    });
}


// ============================================================
// LOGIN
// ============================================================

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const email =
            document.getElementById("loginEmail").value;

        const password =
            document.getElementById("loginPassword").value;

        const message =
            document.getElementById("loginMessage");


        try {

            const response = await fetch(
                `${API_URL}/auth/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                }
            );


            const data = await response.json();


            if (!response.ok) {

                message.innerHTML = `
                    <div class="alert alert-danger">
                        ${data.detail || "Login failed"}
                    </div>
                `;

                return;
            }


            // Save JWT token
            localStorage.setItem(
                "access_token",
                data.access_token
            );


            message.innerHTML = `
                <div class="alert alert-success">
                    Login successful!
                </div>
            `;


            setTimeout(() => {

                window.location.href =
                    "/static/products.html";

            }, 1000);


        } catch (error) {

            console.error(error);

            message.innerHTML = `
                <div class="alert alert-danger">
                    Unable to connect to server.
                </div>
            `;
        }

    });
}