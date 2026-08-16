const API_URL = "http://127.0.0.1:8000";


function getToken() {

    return localStorage.getItem(
        "access_token"
    );

}


async function loadOrderDetails() {

    const loading =
        document.getElementById("loading");

    const errorMessage =
        document.getElementById("errorMessage");

    const orderContent =
        document.getElementById("orderContent");


    const token = getToken();


    if (!token) {

        loading.classList.add("d-none");

        errorMessage.classList.remove("d-none");

        errorMessage.innerHTML = `
            Please login to view your order.

            <a
                href="/static/login.html"
                class="alert-link"
            >
                Login
            </a>
        `;

        return;
    }


    const params =
        new URLSearchParams(
            window.location.search
        );


    const orderId =
        params.get("id");


    if (!orderId) {

        loading.classList.add("d-none");

        errorMessage.classList.remove("d-none");

        errorMessage.textContent =
            "Order ID is missing.";

        return;
    }


    try {

        const response = await fetch(
            `${API_URL}/orders/${orderId}`,
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


        if (!response.ok) {

            throw new Error(
                data.detail ||
                "Unable to load order"
            );
        }


        loading.classList.add("d-none");

        orderContent.classList.remove("d-none");


        document.getElementById(
            "orderId"
        ).textContent =
            `#${data.id}`;


        document.getElementById(
            "userId"
        ).textContent =
            data.user_id;


        document.getElementById(
            "orderStatus"
        ).textContent =
            data.status;


        document.getElementById(
            "orderTotal"
        ).textContent =
            `₹${data.total_amount}`;


        displayOrderItems(
            data.items
        );


    } catch (error) {

        console.error(error);

        loading.classList.add("d-none");

        errorMessage.classList.remove(
            "d-none"
        );

        errorMessage.textContent =
            error.message;

    }

}


function displayOrderItems(items) {

    const orderItems =
        document.getElementById(
            "orderItems"
        );


    orderItems.innerHTML = "";


    items.forEach(item => {

        const itemElement =
            document.createElement(
                "div"
            );


        itemElement.className =
            "border-bottom py-3";


        const subtotal =
            item.price *
            item.quantity;


        itemElement.innerHTML = `

            <div
                class="d-flex
                       justify-content-between
                       align-items-center"
            >

                <div>

                    <h5 class="fw-bold mb-1">
                        Product #${item.product_id}
                    </h5>

                    <p class="text-muted mb-0">

                        ₹${item.price}
                        ×
                        ${item.quantity}

                    </p>

                </div>


                <strong>
                    ₹${subtotal}
                </strong>

            </div>

        `;


        orderItems.appendChild(
            itemElement
        );

    });

}


loadOrderDetails();