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
// LOAD CART FOR CHECKOUT
// ============================================================

async function loadCheckout() {

    const loading =
        document.getElementById(
            "loading"
        );

    const errorMessage =
        document.getElementById(
            "errorMessage"
        );

    const checkoutContent =
        document.getElementById(
            "checkoutContent"
        );


    const token = getToken();


    // Check login

    if (!token) {

        loading.classList.add(
            "d-none"
        );

        errorMessage.classList.remove(
            "d-none"
        );

        errorMessage.innerHTML = `
            Please login before checkout.

            <a
                href="/static/login.html"
                class="alert-link"
            >
                Login
            </a>
        `;

        return;
    }


    try {

        const response = await fetch(
            `${API_URL}/cart`,
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


        loading.classList.add(
            "d-none"
        );


        if (!response.ok) {

            throw new Error(
                data.detail ||
                "Unable to load cart"
            );
        }


        if (
            !data.items ||
            data.items.length === 0
        ) {

            throw new Error(
                "Your cart is empty"
            );
        }


        checkoutContent.classList.remove(
            "d-none"
        );


        displayCheckout(data);


    } catch (error) {

        console.error(error);

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
// DISPLAY CHECKOUT
// ============================================================

function displayCheckout(cart) {

    const checkoutItems =
        document.getElementById(
            "checkoutItems"
        );

    const checkoutTotal =
        document.getElementById(
            "checkoutTotal"
        );


    checkoutItems.innerHTML = "";


    cart.items.forEach(item => {

        const itemElement =
            document.createElement(
                "div"
            );


        itemElement.className =
            "border-bottom pb-3 mb-3";


        itemElement.innerHTML = `

            <div
                class="d-flex justify-content-between"
            >

                <div>

                    <h5 class="mb-1">
                        ${item.product_name}
                    </h5>

                    <p class="text-muted mb-0">

                        ₹${item.price}
                        ×
                        ${item.quantity}

                    </p>

                </div>


                <strong>
                    ₹${item.subtotal}
                </strong>

            </div>

        `;


        checkoutItems.appendChild(
            itemElement
        );

    });


    checkoutTotal.textContent =
        `₹${cart.total}`;

}


// ============================================================
// PLACE ORDER
// ============================================================

async function placeOrder() {

    const token = getToken();


    const button =
        document.getElementById(
            "placeOrderButton"
        );

    const message =
        document.getElementById(
            "orderMessage"
        );


    if (!token) {

        message.innerHTML = `
            <div class="alert alert-danger">
                Please login first.
            </div>
        `;

        return;
    }


    // Disable button

    button.disabled = true;

    button.textContent =
        "Placing Order...";


    try {

        const response = await fetch(
            `${API_URL}/orders/checkout`,
            {
                method: "POST",

                headers: {
                    "Authorization":
                        `Bearer ${token}`
                }
            }
        );


        const data =
            await response.json();


        if (!response.ok) {

            message.innerHTML = `
                <div class="alert alert-danger">
                    ${data.detail ||
                      "Unable to place order"}
                </div>
            `;

            button.disabled = false;

            button.textContent =
                "Place Order";

            return;
        }


        message.innerHTML = `
            <div class="alert alert-success">

                Order placed successfully!

                <br>

                Order ID:
                <strong>
                    #${data.id}
                </strong>

            </div>
        `;


        // Redirect to orders page

        setTimeout(() => {

            window.location.href =
                "/static/orders.html";

        }, 1500);


    } catch (error) {

        console.error(error);

        message.innerHTML = `
            <div class="alert alert-danger">
                Unable to connect to server.
            </div>
        `;


        button.disabled = false;

        button.textContent =
            "Place Order";

    }

}


// ============================================================
// BUTTON EVENT
// ============================================================

document
    .getElementById(
        "placeOrderButton"
    )
    .addEventListener(
        "click",
        placeOrder
    );


// ============================================================
// START
// ============================================================

loadCheckout();