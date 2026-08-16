// ============================================================
// KAPRA ADMIN ORDERS
// ============================================================

const API_URL = "http://127.0.0.1:8000";

let orders = [];

let orderDetailsModal = null;


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
        "Content-Type": "application/json",

        "Authorization":
            `Bearer ${token}`
    };

}


// ============================================================
// CHECK ADMIN ACCESS
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
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
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


        if (
            user.role !== "admin"
        ) {

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

        window.location.href =
            "/static/admin-login.html";

        return false;

    }

}


// ============================================================
// LOAD ORDERS
// ============================================================

async function loadOrders() {

    const loading =
        document.getElementById(
            "ordersLoading"
        );

    const tableWrapper =
        document.getElementById(
            "ordersTableWrapper"
        );

    const noOrders =
        document.getElementById(
            "noOrders"
        );


    if (loading) {

        loading.classList.remove(
            "d-none"
        );

    }


    if (tableWrapper) {

        tableWrapper.classList.add(
            "d-none"
        );

    }


    if (noOrders) {

        noOrders.classList.add(
            "d-none"
        );

    }


    try {

        const response =
            await fetch(
                `${API_URL}/orders/admin/all`,
                {
                    method: "GET",

                    headers:
                        getAuthHeaders()
                }
            );


        const responseText =
            await response.text();


        let data;


        try {

            data =
                JSON.parse(
                    responseText
                );

        } catch {

            throw new Error(
                responseText ||
                "Invalid server response."
            );

        }


        if (!response.ok) {

            throw new Error(
                data.detail ||
                "Unable to load orders."
            );

        }


        orders =
            Array.isArray(data)
                ? data
                : [];


        console.log(
            "Admin orders:",
            orders
        );


        updateOrderSummary(
            orders
        );


        displayOrders(
            orders
        );


    } catch (error) {

        console.error(
            "Load orders error:",
            error
        );


        showMessage(
            error.message,
            "danger"
        );


        updateOrderSummary([]);


        displayOrders([]);


    } finally {

        if (loading) {

            loading.classList.add(
                "d-none"
            );

        }

    }

}


// ============================================================
// UPDATE ORDER SUMMARY
// ============================================================

function updateOrderSummary(
    orderList
) {

    const totalOrders =
        document.getElementById(
            "totalOrders"
        );


    const placedOrders =
        document.getElementById(
            "placedOrders"
        );


    const totalRevenue =
        document.getElementById(
            "totalRevenue"
        );


    const total =
        orderList.length;


    const placed =
        orderList.filter(
            order =>
                String(
                    order.status
                ).toLowerCase() ===
                "placed"
        ).length;


    const revenue =
        orderList.reduce(
            (
                sum,
                order
            ) => {

                return (
                    sum +
                    Number(
                        order.total_amount || 0
                    )
                );

            },
            0
        );


    if (totalOrders) {

        totalOrders.textContent =
            total;

    }


    if (placedOrders) {

        placedOrders.textContent =
            placed;

    }


    if (totalRevenue) {

        totalRevenue.textContent =
            formatCurrency(
                revenue
            );

    }

}


// ============================================================
// DISPLAY ORDERS
// ============================================================

function displayOrders(
    orderList
) {

    const tableBody =
        document.getElementById(
            "ordersTableBody"
        );


    const tableWrapper =
        document.getElementById(
            "ordersTableWrapper"
        );


    const noOrders =
        document.getElementById(
            "noOrders"
        );


    if (!tableBody) {

        return;

    }


    tableBody.innerHTML = "";


    if (
        !orderList ||
        orderList.length === 0
    ) {

        if (tableWrapper) {

            tableWrapper.classList.add(
                "d-none"
            );

        }


        if (noOrders) {

            noOrders.classList.remove(
                "d-none"
            );

        }


        return;

    }


    if (noOrders) {

        noOrders.classList.add(
            "d-none"
        );

    }


    if (tableWrapper) {

        tableWrapper.classList.remove(
            "d-none"
        );

    }


    orderList.forEach(
        order => {

            const row =
                document.createElement(
                    "tr"
                );


            const items =
                Array.isArray(
                    order.items
                )
                    ? order.items
                    : [];


            const totalQuantity =
                items.reduce(
                    (
                        sum,
                        item
                    ) => {

                        return (
                            sum +
                            Number(
                                item.quantity || 0
                            )
                        );

                    },
                    0
                );


            const productIds =
                items.map(
                    item =>
                        `#${item.product_id}`
                );


            const status =
                String(
                    order.status ||
                    "unknown"
                ).toLowerCase();


            const statusClass =
                getStatusClass(
                    status
                );


            const statusText =
                formatStatus(
                    status
                );


            row.innerHTML = `

                <!-- ORDER ID -->

                <td>

                    <span
                        class="admin-order-id"
                    >

                        #${order.id}

                    </span>

                </td>


                <!-- CUSTOMER -->

                <td>

                    <span
                        class="admin-order-customer"
                    >

                        User #${order.user_id}

                    </span>

                </td>


                <!-- PRODUCTS -->

                <td>

                    <div
                        class="admin-order-products"
                    >

                        ${
                            productIds.length > 0

                                ? productIds
                                    .map(
                                        productId => `
                                            <div
                                                class="admin-order-product-line"
                                            >

                                                <span
                                                    class="admin-order-product-id"
                                                >
                                                    ${productId}
                                                </span>

                                            </div>
                                        `
                                    )
                                    .join("")

                                : `
                                    <span
                                        class="text-muted"
                                    >
                                        No items
                                    </span>
                                `
                        }

                    </div>

                </td>


                <!-- QUANTITY -->

                <td>

                    <span
                        class="admin-order-quantity"
                    >

                        ${totalQuantity}

                    </span>

                </td>


                <!-- AMOUNT -->

                <td>

                    <span
                        class="admin-order-amount"
                    >

                        ${formatCurrency(
                            order.total_amount
                        )}

                    </span>

                </td>


                <!-- STATUS -->

                <td>

                    <span
                        class="admin-order-status ${statusClass}"
                    >

                        ${statusText}

                    </span>

                </td>


                <!-- ACTION -->

                <td>

                    <button
                        type="button"
                        class="admin-order-action"
                        title="View Order"
                        onclick="viewOrder(
                            ${order.id}
                        )"
                    >

                        <i
                            class="bi bi-eye"
                        ></i>

                    </button>

                </td>

            `;


            tableBody.appendChild(
                row
            );

        }
    );

}


// ============================================================
// VIEW ORDER
// ============================================================

function viewOrder(
    orderId
) {

    const order =
        orders.find(
            item =>
                Number(item.id) ===
                Number(orderId)
        );


    if (!order) {

        showMessage(
            "Order not found.",
            "danger"
        );

        return;

    }


    const title =
        document.getElementById(
            "orderDetailsTitle"
        );


    const content =
        document.getElementById(
            "orderDetailsContent"
        );


    if (!title || !content) {

        return;

    }


    title.textContent =
        `Order #${order.id}`;


    const items =
        Array.isArray(
            order.items
        )
            ? order.items
            : [];


    const status =
        String(
            order.status ||
            "unknown"
        ).toLowerCase();


    let itemsHTML = "";


    if (
        items.length === 0
    ) {

        itemsHTML = `

            <p
                class="text-muted"
            >
                No items found.
            </p>

        `;

    } else {

        itemsHTML = `

            <table
                class="order-items-table"
            >

                <thead>

                    <tr>

                        <th>
                            Product ID
                        </th>

                        <th>
                            Quantity
                        </th>

                        <th>
                            Price
                        </th>

                        <th>
                            Total
                        </th>

                    </tr>

                </thead>


                <tbody>

                    ${
                        items.map(
                            item => {

                                const itemTotal =
                                    Number(
                                        item.price || 0
                                    ) *
                                    Number(
                                        item.quantity || 0
                                    );


                                return `

                                    <tr>

                                        <td>
                                            #${item.product_id}
                                        </td>

                                        <td>
                                            ${item.quantity}
                                        </td>

                                        <td>
                                            ${formatCurrency(
                                                item.price
                                            )}
                                        </td>

                                        <td>
                                            ${formatCurrency(
                                                itemTotal
                                            )}
                                        </td>

                                    </tr>

                                `;

                            }
                        ).join("")
                    }

                </tbody>

            </table>

        `;

    }


    content.innerHTML = `

        <!-- ORDER INFORMATION -->

        <div
            class="order-detail-grid"
        >


            <div
                class="order-detail-box"
            >

                <span>
                    Order ID
                </span>

                <strong>
                    #${order.id}
                </strong>

            </div>


            <div
                class="order-detail-box"
            >

                <span>
                    Customer ID
                </span>

                <strong>
                    User #${order.user_id}
                </strong>

            </div>


            <div
                class="order-detail-box"
            >

                <span>
                    Status
                </span>

                <strong>
                    ${formatStatus(
                        status
                    )}
                </strong>

            </div>


            <div
                class="order-detail-box"
            >

                <span>
                    Total Amount
                </span>

                <strong>
                    ${formatCurrency(
                        order.total_amount
                    )}
                </strong>

            </div>


        </div>


        <!-- ORDER ITEMS -->

        <div>

            <h6
                class="order-items-title"
            >
                Order Items
            </h6>

            ${itemsHTML}

        </div>

    `;


    if (!orderDetailsModal) {

        orderDetailsModal =
            new bootstrap.Modal(
                document.getElementById(
                    "orderDetailsModal"
                )
            );

    }


    orderDetailsModal.show();

}


// ============================================================
// STATUS CLASS
// ============================================================

function getStatusClass(
    status
) {

    switch (status) {

        case "placed":

            return "admin-order-status-placed";


        case "processing":

            return "admin-order-status-processing";


        case "shipped":

            return "admin-order-status-shipped";


        case "delivered":

            return "admin-order-status-delivered";


        case "cancelled":

        case "canceled":

            return "admin-order-status-cancelled";


        default:

            return "admin-order-status-placed";

    }

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


    return String(status)
        .charAt(0)
        .toUpperCase() +
        String(status)
            .slice(1)
            .toLowerCase();

}


// ============================================================
// FORMAT CURRENCY
// ============================================================

function formatCurrency(
    amount
) {

    const value =
        Number(amount || 0);


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
// SHOW MESSAGE
// ============================================================

function showMessage(
    message,
    type = "success"
) {

    const messageBox =
        document.getElementById(
            "orderMessage"
        );


    if (!messageBox) {

        return;

    }


    messageBox.className =
        `alert alert-${type}`;


    messageBox.textContent =
        message;


    messageBox.classList.remove(
        "d-none"
    );


    setTimeout(
        function () {

            messageBox.classList.add(
                "d-none"
            );

        },
        4000
    );

}


// ============================================================
// SETUP EVENTS
// ============================================================

function setupEvents() {


    // ========================================================
    // SIDEBAR TOGGLE
    // ========================================================

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


    // ========================================================
    // LOGOUT
    // ========================================================

    const logoutButton =
        document.getElementById(
            "logoutButton"
        );


    if (logoutButton) {

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


    // ========================================================
    // REFRESH ORDERS
    // ========================================================

    const refreshButton =
        document.getElementById(
            "refreshOrdersButton"
        );


    if (refreshButton) {

        refreshButton.addEventListener(
            "click",
            async function () {

                await loadOrders();

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


        setupEvents();


        orderDetailsModal =
            new bootstrap.Modal(
                document.getElementById(
                    "orderDetailsModal"
                )
            );


        await loadOrders();

    }
);