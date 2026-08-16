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
// LOAD ORDERS
// ============================================================

async function loadOrders() {

    const loading =
        document.getElementById(
            "loading"
        );

    const errorMessage =
        document.getElementById(
            "errorMessage"
        );

    const emptyOrders =
        document.getElementById(
            "emptyOrders"
        );

    const ordersContent =
        document.getElementById(
            "ordersContent"
        );


    const token = getToken();


    // ========================================================
    // CHECK LOGIN
    // ========================================================

    if (!token) {

        loading.classList.add(
            "d-none"
        );

        errorMessage.classList.remove(
            "d-none"
        );

        errorMessage.innerHTML = `
            Please login to view your orders.

            <a
                href="/static/login.html"
                class="alert-link"
            >
                Login
            </a>
        `;

        return;
    }


    // ========================================================
    // GET ORDERS
    // ========================================================

    try {

        const response = await fetch(
            `${API_URL}/orders`,
            {
                method: "GET",

                headers: {
                    "Authorization":
                        `Bearer ${token}`
                }
            }
        );


        const data =
            await response.json();


        // Hide loading

        loading.classList.add(
            "d-none"
        );


        // ====================================================
        // HANDLE ERROR
        // ====================================================

        if (!response.ok) {

            throw new Error(
                data.detail ||
                "Unable to load orders"
            );
        }


        // ====================================================
        // NO ORDERS
        // ====================================================

        if (
            !data ||
            data.length === 0
        ) {

            emptyOrders.classList.remove(
                "d-none"
            );

            return;
        }


        // ====================================================
        // SHOW ORDERS
        // ====================================================

        ordersContent.classList.remove(
            "d-none"
        );


        displayOrders(data);


    } catch (error) {

        console.error(
            "Error loading orders:",
            error
        );


        loading.classList.add(
            "d-none"
        );


        errorMessage.classList.remove(
            "d-none"
        );


        errorMessage.textContent =
            error.message;

    }

}


// ============================================================
// DISPLAY ORDERS
// ============================================================

function displayOrders(orders) {

    const ordersList =
        document.getElementById(
            "ordersList"
        );


    ordersList.innerHTML = "";


    orders.forEach(order => {


        // ====================================================
        // CREATE ORDER CARD
        // ====================================================

        const orderElement =
            document.createElement(
                "div"
            );


        orderElement.className =
            "card shadow-sm mb-4";


        // ====================================================
        // ORDER ITEMS
        // ====================================================

        let itemsHTML = "";


        if (
            order.items &&
            order.items.length > 0
        ) {

            order.items.forEach(item => {

                const subtotal =
                    item.price *
                    item.quantity;


                itemsHTML += `

                    <div
                        class="border-bottom py-3"
                    >

                        <div
                            class="d-flex
                                   justify-content-between"
                        >

                            <span>
                                Product #${item.product_id}
                            </span>


                            <strong>
                                ₹${item.price}
                            </strong>

                        </div>


                        <small
                            class="text-muted"
                        >

                            Quantity:
                            ${item.quantity}

                        </small>


                        <div
                            class="text-end mt-1"
                        >

                            <strong>
                                ₹${subtotal}
                            </strong>

                        </div>

                    </div>

                `;

            });

        } else {

            itemsHTML = `

                <p class="text-muted">
                    No items found.
                </p>

            `;

        }


        // ====================================================
        // ORDER CARD HTML
        // ====================================================

        orderElement.innerHTML = `

            <div class="card-body">


                <!-- ORDER HEADER -->

                <div
                    class="d-flex
                           justify-content-between
                           align-items-center
                           mb-3"
                >

                    <div>

                        <h5
                            class="fw-bold mb-1"
                        >
                            Order #${order.id}
                        </h5>


                        <small
                            class="text-muted"
                        >
                            User ID:
                            ${order.user_id}
                        </small>

                    </div>


                    <span
                        class="badge bg-success"
                    >
                        ${order.status}
                    </span>

                </div>


                <hr>


                <!-- ORDER ITEMS -->

                <h6
                    class="fw-bold"
                >
                    Order Items
                </h6>


                ${itemsHTML}


                <!-- TOTAL -->

                <div
                    class="d-flex
                           justify-content-between
                           align-items-center
                           mt-4"
                >

                    <div>

                        <small
                            class="text-muted"
                        >
                            Total Amount
                        </small>


                        <h4
                            class="fw-bold mb-0"
                        >
                            ₹${order.total_amount}
                        </h4>

                    </div>


                    <!-- VIEW ORDER -->

                    <a
                        href="/static/order-details.html?id=${order.id}"
                        class="btn btn-dark"
                    >
                        View Order
                    </a>

                </div>

            </div>

        `;


        ordersList.appendChild(
            orderElement
        );

    });

}


// ============================================================
// START ORDERS PAGE
// ============================================================

console.log(
    "orders.js loaded"
);


loadOrders();