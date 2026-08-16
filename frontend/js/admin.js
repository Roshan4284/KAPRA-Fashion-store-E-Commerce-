// ============================================================
// KAPRA ADMIN DASHBOARD
// ============================================================

const API_URL = window.location.origin;


// ============================================================
// GET TOKEN
// ============================================================

function getToken() {

    return localStorage.getItem(
        "access_token"
    );

}


// ============================================================
// AUTH HEADERS
// ============================================================

function getAuthHeaders() {

    const token = getToken();

    return {
        "Authorization":
            `Bearer ${token}`
    };

}


// ============================================================
// CHECK ADMIN
// ============================================================

async function checkAdminAccess() {

    const token = getToken();


    if (!token) {

        window.location.href =
            "/static/admin-login.html";

        return false;

    }


    try {

        const response =
            await fetch(
                `${API_URL}/auth/me`,
                {
                    headers:
                        getAuthHeaders()
                }
            );


        if (!response.ok) {

            localStorage.removeItem(
                "access_token"
            );

            window.location.href =
                "/static/admin-login.html";

            return false;

        }


        const user =
            await response.json();


        if (user.role !== "admin") {

            localStorage.removeItem(
                "access_token"
            );

            window.location.href =
                "/static/admin-login.html";

            return false;

        }


        return true;


    } catch (error) {

        console.error(
            "Admin authentication error:",
            error
        );

        return false;

    }

}


// ============================================================
// LOAD DASHBOARD
// ============================================================

async function loadDashboard() {

    console.log(
        "Loading admin dashboard..."
    );


    await Promise.all([
        loadProductsCount(),
        loadOrdersData(),
        loadUsersCount()
    ]);

}


// ============================================================
// LOAD PRODUCTS
// ============================================================

async function loadProductsCount() {

    const totalProducts =
        document.getElementById(
            "totalProducts"
        );


    if (!totalProducts) {

        console.error(
            "totalProducts element not found"
        );

        return;

    }


    try {

        const response =
            await fetch(
                `${API_URL}/products/?skip=0&limit=1000`,
                {
                    headers:
                        getAuthHeaders()
                }
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load products"
            );

        }


        const products =
            await response.json();


        const activeProducts =
            products.filter(
                product =>
                    product.is_active !== false
            );


        totalProducts.textContent =
            activeProducts.length;


        console.log(
            "Active products:",
            activeProducts.length
        );


    } catch (error) {

        console.error(
            "Product count error:",
            error
        );


        totalProducts.textContent =
            "—";

    }

}


// ============================================================
// LOAD ORDERS
// ============================================================

async function loadOrdersData() {

    const totalOrders =
        document.getElementById(
            "totalOrders"
        );


    const totalRevenue =
        document.getElementById(
            "totalRevenue"
        );


    const recentOrders =
        document.getElementById(
            "recentOrders"
        );


    try {

        const response =
            await fetch(
                `${API_URL}/orders/admin/all`,
                {
                    headers:
                        getAuthHeaders()
                }
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load orders"
            );

        }


        const orders =
            await response.json();


        // ----------------------------------------------------
        // TOTAL ORDERS
        // ----------------------------------------------------

        if (totalOrders) {

            totalOrders.textContent =
                orders.length;

        }


        // ----------------------------------------------------
        // TOTAL REVENUE
        // ----------------------------------------------------

        const revenue =
            orders.reduce(
                (
                    total,
                    order
                ) => {

                    return (
                        total +
                        Number(
                            order.total_amount || 0
                        )
                    );

                },
                0
            );


        if (totalRevenue) {

            totalRevenue.textContent =
                formatCurrency(
                    revenue
                );

        }


        // ----------------------------------------------------
        // RECENT ORDERS
        // ----------------------------------------------------

        if (recentOrders) {

            displayRecentOrders(
                orders,
                recentOrders
            );

        }


        console.log(
            "Orders:",
            orders
        );


    } catch (error) {

        console.error(
            "Orders error:",
            error
        );


        if (totalOrders) {

            totalOrders.textContent =
                "—";

        }


        if (totalRevenue) {

            totalRevenue.textContent =
                "—";

        }

    }

}


// ============================================================
// LOAD USERS
// ============================================================

async function loadUsersCount() {

    const totalUsers =
        document.getElementById(
            "totalUsers"
        );


    if (!totalUsers) {

        console.error(
            "totalUsers element not found"
        );

        return;

    }


    try {

        const response =
            await fetch(
                `${API_URL}/users/`,
                {
                    headers:
                        getAuthHeaders()
                }
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load users"
            );

        }


        const users =
            await response.json();


        totalUsers.textContent =
            users.length;


        console.log(
            "Total users:",
            users.length
        );


    } catch (error) {

        console.error(
            "Users error:",
            error
        );


        totalUsers.textContent =
            "—";

    }

}


// ============================================================
// DISPLAY RECENT ORDERS
// ============================================================

function displayRecentOrders(
    orders,
    container
) {

    container.innerHTML = "";


    if (
        !orders ||
        orders.length === 0
    ) {

        container.innerHTML = `

            <div class="text-center py-4">

                <i
                    class="bi bi-cart-x"
                    style="font-size: 30px;"
                ></i>

                <p class="text-muted mt-2 mb-0">

                    No orders found.

                </p>

            </div>

        `;

        return;

    }


    // Show latest 5 orders

    const recent =
        orders.slice(
            0,
            5
        );


    recent.forEach(
        order => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "recent-order-row";


            const status =
                String(
                    order.status ||
                    "placed"
                );


            row.innerHTML = `

                <div
                    class="recent-order-info"
                >

                    <strong>

                        Order #${order.id}

                    </strong>

                    <small>

                        User #${order.user_id}

                    </small>

                </div>


                <div
                    class="recent-order-amount"
                >

                    <strong>

                        ${formatCurrency(
                            order.total_amount
                        )}

                    </strong>

                    <span
                        class="recent-order-status"
                    >

                        ${formatStatus(
                            status
                        )}

                    </span>

                </div>

            `;


            container.appendChild(
                row
            );

        }
    );

}


// ============================================================
// FORMAT CURRENCY
// ============================================================

function formatCurrency(
    amount
) {

    const value =
        Number(
            amount || 0
        );


    return (
        "₹" +
        value.toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        )
    );

}


// ============================================================
// FORMAT STATUS
// ============================================================

function formatStatus(
    status
) {

    if (!status) {

        return "Unknown";

    }


    const text =
        String(status)
            .toLowerCase();


    return (
        text.charAt(0).toUpperCase() +
        text.slice(1)
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

            localStorage.removeItem(
                "access_token"
            );


            window.location.href =
                "/static/admin-login.html";

        }
    );

}


// ============================================================
// SIDEBAR TOGGLE
// ============================================================

function setupSidebar() {

    const sidebarToggle =
        document.getElementById(
            "sidebarToggle"
        );


    const sidebar =
        document.querySelector(
            ".admin-sidebar"
        );


    if (
        sidebarToggle &&
        sidebar
    ) {

        sidebarToggle.addEventListener(
            "click",
            function () {

                sidebar.classList.toggle(
                    "show"
                );

            }
        );

    }

}


// ============================================================
// START
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        const isAdmin =
            await checkAdminAccess();


        if (!isAdmin) {

            return;

        }


        setupLogout();

        setupSidebar();

        await loadDashboard();

    }
);