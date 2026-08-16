// ============================================================
// KAPRA AUTHENTICATION
// ============================================================

// Use the same origin as the deployed FastAPI application.
// Local:  http://127.0.0.1:8000
// Render: https://kapra-fashion-store.onrender.com
const API_URL = window.location.origin;


// ============================================================
// HELPER: READ API RESPONSE SAFELY
// ============================================================

async function getResponseData(response) {

    const contentType =
        response.headers.get("content-type") || "";

    // JSON response
    if (contentType.includes("application/json")) {

        try {

            return await response.json();

        } catch (error) {

            return {
                detail: "Server returned invalid JSON."
            };

        }

    }

    // Non-JSON response
    const text = await response.text();

    return {
        detail: text || `Server returned status ${response.status}`
    };

}


// ============================================================
// HELPER: DISPLAY ERROR
// ============================================================

function showError(element, message) {

    if (!element) {
        console.error(message);
        return;
    }

    element.innerHTML = `
        <div class="alert alert-danger">
            ${escapeHTML(message)}
        </div>
    `;

}


// ============================================================
// HELPER: DISPLAY SUCCESS
// ============================================================

function showSuccess(element, message) {

    if (!element) {
        console.log(message);
        return;
    }

    element.innerHTML = `
        <div class="alert alert-success">
            ${escapeHTML(message)}
        </div>
    `;

}


// ============================================================
// HELPER: ESCAPE HTML
// ============================================================

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ============================================================
// REGISTER
// ============================================================

const registerForm =
    document.getElementById("registerForm");


if (registerForm) {

    registerForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            // ------------------------------------------------
            // GET FORM VALUES
            // ------------------------------------------------

            const name =
                document.getElementById("name")?.value.trim();

            const email =
                document.getElementById("email")?.value.trim();

            const password =
                document.getElementById("password")?.value;

            const message =
                document.getElementById("message");


            // ------------------------------------------------
            // VALIDATION
            // ------------------------------------------------

            if (!name || !email || !password) {

                showError(
                    message,
                    "Please fill in all fields."
                );

                return;

            }


            // ------------------------------------------------
            // API URL
            // ------------------------------------------------

            const registerURL =
                `${API_URL}/auth/register`;


            console.log(
                "REGISTER API URL:",
                registerURL
            );


            try {

                // ------------------------------------------------
                // SEND REGISTER REQUEST
                // ------------------------------------------------

                const response =
                    await fetch(
                        registerURL,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                "Accept":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                name: name,
                                email: email,
                                password: password
                            })
                        }
                    );


                // ------------------------------------------------
                // READ RESPONSE
                // ------------------------------------------------

                const data =
                    await getResponseData(response);


                console.log(
                    "REGISTER STATUS:",
                    response.status
                );

                console.log(
                    "REGISTER RESPONSE:",
                    data
                );


                // ------------------------------------------------
                // API ERROR
                // ------------------------------------------------

                if (!response.ok) {

                    showError(
                        message,
                        data.detail ||
                        data.message ||
                        `Registration failed (${response.status})`
                    );

                    return;

                }


                // ------------------------------------------------
                // SUCCESS
                // ------------------------------------------------

                showSuccess(
                    message,
                    "Account created successfully!"
                );


                registerForm.reset();


                // ------------------------------------------------
                // REDIRECT TO LOGIN
                // ------------------------------------------------

                setTimeout(
                    function () {

                        window.location.href =
                            "/static/login.html";

                    },
                    1500
                );

            }


            // ------------------------------------------------
            // NETWORK / JAVASCRIPT ERROR
            // ------------------------------------------------

            catch (error) {

                console.error(
                    "REGISTER ERROR:",
                    error
                );


                showError(
                    message,
                    `Unable to connect to server: ${
                        error.message || error
                    }`
                );

            }

        }
    );

}


// ============================================================
// LOGIN
// ============================================================

const loginForm =
    document.getElementById("loginForm");


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            // ------------------------------------------------
            // GET FORM VALUES
            // ------------------------------------------------

            const email =
                document
                    .getElementById("loginEmail")
                    ?.value.trim();

            const password =
                document
                    .getElementById("loginPassword")
                    ?.value;


            const message =
                document.getElementById(
                    "loginMessage"
                );


            // ------------------------------------------------
            // VALIDATION
            // ------------------------------------------------

            if (!email || !password) {

                showError(
                    message,
                    "Please enter your email and password."
                );

                return;

            }


            // ------------------------------------------------
            // API URL
            // ------------------------------------------------

            const loginURL =
                `${API_URL}/auth/login`;


            console.log(
                "LOGIN API URL:",
                loginURL
            );


            try {

                // ------------------------------------------------
                // SEND LOGIN REQUEST
                // ------------------------------------------------

                const response =
                    await fetch(
                        loginURL,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                "Accept":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                email: email,
                                password: password
                            })
                        }
                    );


                // ------------------------------------------------
                // READ RESPONSE
                // ------------------------------------------------

                const data =
                    await getResponseData(response);


                console.log(
                    "LOGIN STATUS:",
                    response.status
                );

                console.log(
                    "LOGIN RESPONSE:",
                    data
                );


                // ------------------------------------------------
                // API ERROR
                // ------------------------------------------------

                if (!response.ok) {

                    showError(
                        message,
                        data.detail ||
                        data.message ||
                        `Login failed (${response.status})`
                    );

                    return;

                }


                // ------------------------------------------------
                // CHECK TOKEN
                // ------------------------------------------------

                if (!data.access_token) {

                    showError(
                        message,
                        "Login succeeded but the server did not return an access token."
                    );

                    console.error(
                        "Login response does not contain access_token:",
                        data
                    );

                    return;

                }


                // ------------------------------------------------
                // SAVE JWT TOKEN
                // ------------------------------------------------

                localStorage.setItem(
                    "access_token",
                    data.access_token
                );


                console.log(
                    "JWT token saved successfully."
                );


                // ------------------------------------------------
                // SUCCESS MESSAGE
                // ------------------------------------------------

                showSuccess(
                    message,
                    "Login successful!"
                );


                // ------------------------------------------------
                // REDIRECT TO PRODUCTS
                // ------------------------------------------------

                setTimeout(
                    function () {

                        window.location.href =
                            "/static/products.html";

                    },
                    800
                );

            }


            // ------------------------------------------------
            // NETWORK / JAVASCRIPT ERROR
            // ------------------------------------------------

            catch (error) {

                console.error(
                    "LOGIN ERROR:",
                    error
                );


                showError(
                    message,
                    `Unable to connect to server: ${
                        error.message || error
                    }`
                );

            }

        }
    );

}