// ============================================================
// KAPRA NAVBAR
// ============================================================

const API_URL = "http://127.0.0.1:8000";


// ============================================================
// GET TOKEN
// ============================================================

function getToken() {

    return localStorage.getItem(
        "access_token"
    );

}


// ============================================================
// GET JWT PAYLOAD
// ============================================================

function getTokenPayload() {

    const token =
        getToken();

    if (!token) {

        return null;

    }

    try {

        const parts =
            token.split(".");

        if (parts.length !== 3) {

            return null;

        }

        return JSON.parse(
            atob(
                parts[1]
                    .replace(/-/g, "+")
                    .replace(/_/g, "/")
            )
        );

    } catch (error) {

        console.error(
            "Unable to read JWT:",
            error
        );

        return null;

    }

}


// ============================================================
// GET ROLE FROM TOKEN
// ============================================================

function getRoleFromToken() {

    const payload =
        getTokenPayload();

    if (!payload) {

        return null;

    }

    return payload.role || null;

}


// ============================================================
// GET USER ID FROM TOKEN
// ============================================================

function getUserIdFromToken() {

    const payload =
        getTokenPayload();

    if (!payload) {

        return null;

    }

    return payload.sub || null;

}


// ============================================================
// GET CURRENT USER
// ============================================================

async function getCurrentUser() {

    const token =
        getToken();

    if (!token) {

        return null;

    }


    try {

        const response =
            await fetch(
                `${API_URL}/auth/me`,
                {
                    headers: {

                        "Authorization":
                            `Bearer ${token}`

                    }
                }
            );


        // ----------------------------------------------------
        // DO NOT DELETE TOKEN HERE
        // ----------------------------------------------------

        if (!response.ok) {

            console.error(
                "Auth verification failed:",
                response.status
            );

            return null;

        }


        return await response.json();

    }

    catch (error) {

        console.error(
            "Unable to get current user:",
            error
        );

        return null;

    }

}


// ============================================================
// LOAD NAVBAR
// ============================================================

async function loadNavbar() {

    const navbar =
        document.getElementById(
            "navbar"
        );


    if (!navbar) {

        console.error(
            "Navbar container not found"
        );

        return;

    }


    const token =
        getToken();


    console.log(
        "Navbar loaded. Token exists:",
        !!token
    );


    // ========================================================
    // USER NOT LOGGED IN
    // ========================================================

    if (!token) {

        loadLoggedOutNavbar();

        return;

    }


    // ========================================================
    // FIRST GET ROLE FROM JWT
    // ========================================================

    const tokenRole =
        getRoleFromToken();


    const tokenUserId =
        getUserIdFromToken();


    console.log(
        "JWT User ID:",
        tokenUserId
    );


    console.log(
        "JWT Role:",
        tokenRole
    );


    // ========================================================
    // IF JWT HAS ROLE
    // USE IT IMMEDIATELY
    // ========================================================

    if (tokenRole === "admin") {

        loadAdminNavbar();

    }

    else if (
        tokenRole === "customer"
    ) {

        loadCustomerNavbar();

    }

    else {

        // ----------------------------------------------------
        // If role isn't available in JWT,
        // verify through backend.
        // ----------------------------------------------------

        const currentUser =
            await getCurrentUser();


        if (!currentUser) {

            console.warn(
                "Could not verify user. Keeping login session."
            );

            // Do NOT remove token.
            // Show customer navbar as fallback.

            loadCustomerNavbar();

            return;

        }


        if (
            currentUser.role === "admin"
        ) {

            loadAdminNavbar();

        }

        else {

            loadCustomerNavbar();

        }

    }


    // ========================================================
    // OPTIONAL BACKEND VERIFICATION
    // ========================================================

    /*
     * We don't need to call /auth/me on every page load
     * when the JWT already contains the role.
     *
     * This makes the website faster and prevents a temporary
     * backend delay from logging the user out.
     */


}


// ============================================================
// ADMIN NAVBAR
// ============================================================

function loadAdminNavbar() {

    const navbar =
        document.getElementById(
            "navbar"
        );


    if (!navbar) {

        return;

    }


    navbar.innerHTML = `

        <!-- =================================================
             ADMIN TOP NAVBAR
        ================================================== -->

        <nav class="kapra-navbar">

            <div class="container">

                <div class="kapra-nav-main">


                    <!-- LOGO -->

                    <a
                        href="/static/admin.html"
                        class="kapra-logo"
                    >

                        <img
                            src="/static/images/kapra-logo.jpg"
                            alt="KAPRA"
                            class="kapra-logo-image"
                        >

                    </a>


                    <!-- ADMIN SEARCH -->

                    <div class="kapra-search">

                        <span
                            class="kapra-search-icon"
                        >
                            🔍
                        </span>


                        <input
                            type="text"
                            placeholder="Search products..."
                            id="navbarSearch"
                        >

                    </div>


                    <!-- ADMIN ACTIONS -->

                    <div class="kapra-actions">


                        <!-- DASHBOARD -->

                        <a
                            href="/static/admin.html"
                            class="kapra-action"
                        >

                            <span
                                class="kapra-action-icon"
                            >
                                📊
                            </span>

                            <span>
                                Dashboard
                            </span>

                        </a>


                        <!-- PRODUCTS -->

                        <a
                            href="/static/admin-products.html"
                            class="kapra-action"
                        >

                            <span
                                class="kapra-action-icon"
                            >
                                🛍️
                            </span>

                            <span>
                                Products
                            </span>

                        </a>


                        <!-- LOGOUT -->

                        <button
                            id="logoutButton"
                            type="button"
                            class="kapra-logout"
                        >
                            Logout
                        </button>


                    </div>

                </div>

            </div>

        </nav>


        <!-- =================================================
             ADMIN CATEGORY BAR
        ================================================== -->

        <div class="kapra-category-bar">

            <div class="container">

                <div class="kapra-categories">


                    <a
                        href="/static/admin.html"
                    >
                        DASHBOARD
                    </a>


                    <a
                        href="/static/admin-products.html"
                    >
                        PRODUCTS
                    </a>


                    <a
                        href="/static/admin-orders.html"
                    >
                        ORDERS
                    </a>


                    <a
                        href="/static/admin-users.html"
                    >
                        USERS
                    </a>


                </div>

            </div>

        </div>

    `;


    setupLogout();

    setupAdminSearch();


    console.log(
        "KAPRA admin navbar created"
    );

}


// ============================================================
// CUSTOMER NAVBAR
// ============================================================

function loadCustomerNavbar() {

    const navbar =
        document.getElementById(
            "navbar"
        );


    if (!navbar) {

        return;

    }


    navbar.innerHTML = `

        <!-- =================================================
             CUSTOMER TOP NAVBAR
        ================================================== -->

        <nav class="kapra-navbar">

            <div class="container">

                <div class="kapra-nav-main">


                    <!-- LOGO -->

                    <a
                        href="/"
                        class="kapra-logo"
                    >

                        <img
                            src="/static/images/kapra-logo.jpg"
                            alt="KAPRA"
                            class="kapra-logo-image"
                        >

                    </a>


                    <!-- SEARCH -->

                    <div class="kapra-search">

                        <span
                            class="kapra-search-icon"
                        >
                            🔍
                        </span>


                        <input
                            type="text"
                            placeholder="Search for products, brands and more..."
                            id="navbarSearch"
                        >

                    </div>


                    <!-- CUSTOMER ACTIONS -->

                    <div class="kapra-actions">


                        <!-- ACCOUNT -->

                        <a
                            href="#"
                            class="kapra-action"
                            id="accountButton"
                        >

                            <span
                                class="kapra-action-icon"
                            >
                                👤
                            </span>

                            <span>
                                Account
                            </span>

                        </a>


                        <!-- ORDERS -->

                        <a
                            href="/static/orders.html"
                            class="kapra-action"
                        >

                            <span
                                class="kapra-action-icon"
                            >
                                📦
                            </span>

                            <span>
                                Orders
                            </span>

                        </a>


                        <!-- CART -->

                        <a
                            href="/static/cart.html"
                            class="kapra-action"
                        >

                            <span
                                class="kapra-action-icon"
                            >
                                🛒
                            </span>

                            <span>
                                Cart
                            </span>

                        </a>


                        <!-- LOGOUT -->

                        <button
                            id="logoutButton"
                            type="button"
                            class="kapra-logout"
                        >
                            Logout
                        </button>


                    </div>

                </div>

            </div>

        </nav>


        <!-- =================================================
             CUSTOMER CATEGORY BAR
        ================================================== -->

        <div class="kapra-category-bar">

            <div class="container">

                <div class="kapra-categories">


                    <a
                        href="/static/products.html?category=1"
                    >
                        MEN
                    </a>


                    <a
                        href="/static/products.html?category=2"
                    >
                        WOMEN
                    </a>


                    <a
                        href="/static/products.html?category=3"
                    >
                        KIDS
                    </a>


                    <a
                        href="/static/products.html"
                    >
                        NEW ARRIVALS
                    </a>


                    <a
                        href="/static/products.html"
                    >
                        COLLECTIONS
                    </a>


                    <a
                        href="/static/products.html"
                        class="kapra-sale"
                    >
                        SALE
                    </a>


                </div>

            </div>

        </div>

    `;


    setupLogout();

    setupCustomerSearch();


    console.log(
        "KAPRA customer navbar created"
    );

}


// ============================================================
// LOGGED-OUT NAVBAR
// ============================================================

function loadLoggedOutNavbar() {

    const navbar =
        document.getElementById(
            "navbar"
        );


    if (!navbar) {

        return;

    }


    navbar.innerHTML = `

        <!-- =================================================
             TOP NAVBAR
        ================================================== -->

        <nav class="kapra-navbar">

            <div class="container">

                <div class="kapra-nav-main">


                    <!-- LOGO -->

                    <a
                        href="/"
                        class="kapra-logo"
                    >

                        <img
                            src="/static/images/kapra-logo.jpg"
                            alt="KAPRA"
                            class="kapra-logo-image"
                        >

                    </a>


                    <!-- SEARCH -->

                    <div class="kapra-search">

                        <span
                            class="kapra-search-icon"
                        >
                            🔍
                        </span>


                        <input
                            type="text"
                            placeholder="Search for products, brands and more..."
                            id="navbarSearch"
                        >

                    </div>


                    <!-- LOGIN / REGISTER -->

                    <div class="kapra-actions">


                        <a
                            href="/static/login.html"
                            class="kapra-login"
                        >
                            Login
                        </a>


                        <a
                            href="/static/register.html"
                            class="kapra-register"
                        >
                            Create Account
                        </a>


                    </div>

                </div>

            </div>

        </nav>


        <!-- =================================================
             CATEGORY NAVIGATION
        ================================================== -->

        <div class="kapra-category-bar">

            <div class="container">

                <div class="kapra-categories">


                    <a
                        href="/static/products.html?category=1"
                    >
                        MEN
                    </a>


                    <a
                        href="/static/products.html?category=2"
                    >
                        WOMEN
                    </a>


                    <a
                        href="/static/products.html?category=3"
                    >
                        KIDS
                    </a>


                    <a
                        href="/static/products.html"
                    >
                        NEW ARRIVALS
                    </a>


                    <a
                        href="/static/products.html"
                    >
                        COLLECTIONS
                    </a>


                    <a
                        href="/static/products.html"
                        class="kapra-sale"
                    >
                        SALE
                    </a>


                </div>

            </div>

        </div>

    `;


    setupCustomerSearch();


    console.log(
        "KAPRA logged-out navbar created"
    );

}


// ============================================================
// LOGOUT
// ============================================================

function setupLogout() {

    const logoutButton =
        document.getElementById(
            "logoutButton"
        );


    if (!logoutButton) {

        return;

    }


    logoutButton.addEventListener(
        "click",
        function () {

            console.log(
                "Logging out..."
            );


            // Remove login token

            localStorage.removeItem(
                "access_token"
            );


            // Redirect to login

            window.location.href =
                "/static/login.html";

        }
    );

}


// ============================================================
// CUSTOMER SEARCH
// ============================================================

function setupCustomerSearch() {

    const searchInput =
        document.getElementById(
            "navbarSearch"
        );


    if (!searchInput) {

        return;

    }


    searchInput.addEventListener(
        "keypress",
        function (event) {

            if (
                event.key !== "Enter"
            ) {

                return;

            }


            const search =
                searchInput.value.trim();


            if (search) {

                window.location.href =
                    `/static/products.html?search=${encodeURIComponent(
                        search
                    )}`;

            }

        }
    );

}


// ============================================================
// ADMIN SEARCH
// ============================================================

function setupAdminSearch() {

    const searchInput =
        document.getElementById(
            "navbarSearch"
        );


    if (!searchInput) {

        return;

    }


    searchInput.addEventListener(
        "keypress",
        function (event) {

            if (
                event.key !== "Enter"
            ) {

                return;

            }


            const search =
                searchInput.value.trim();


            if (search) {

                window.location.href =
                    `/static/admin-products.html?search=${encodeURIComponent(
                        search
                    )}`;

            }

        }
    );

}


// ============================================================
// START NAVBAR
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadNavbar();

    }
);