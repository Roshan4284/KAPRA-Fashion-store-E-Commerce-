(function () {

    "use strict";


    // ============================================================
    // KAPRA CART
    // USER-SPECIFIC VERSION
    // ============================================================

    const CART_API_URL =
        window.location.origin;


    let cart = [];

    const productCache = {};


    // ============================================================
    // TOKEN
    // ============================================================

    function getToken() {

        return localStorage.getItem(
            "access_token"
        );

    }


    // ============================================================
    // GET USER ID FROM JWT
    // ============================================================

    function getCurrentUserId() {

        const token =
            getToken();


        if (!token) {

            return null;

        }


        try {

            const parts =
                token.split(".");


            if (
                parts.length !== 3
            ) {

                return null;

            }


            let base64 =
                parts[1]
                    .replace(/-/g, "+")
                    .replace(/_/g, "/");


            while (
                base64.length % 4 !== 0
            ) {

                base64 += "=";

            }


            const payload =
                JSON.parse(
                    atob(base64)
                );


            return payload.sub
                ? String(payload.sub)
                : null;

        }

        catch (error) {

            console.error(
                "Unable to read user from token:",
                error
            );

            return null;

        }

    }


    // ============================================================
    // GET USER CART KEY
    // ============================================================

    function getCartKey() {

        const userId =
            getCurrentUserId();


        if (!userId) {

            return null;

        }


        return `cart_user_${userId}`;

    }


    // ============================================================
    // LOAD CART FROM LOCAL STORAGE
    // ============================================================

    function getLocalCart() {

        const cartKey =
            getCartKey();


        if (!cartKey) {

            return [];

        }


        try {

            const saved =
                localStorage.getItem(
                    cartKey
                );


            if (!saved) {

                return [];

            }


            const parsed =
                JSON.parse(saved);


            if (
                !Array.isArray(parsed)
            ) {

                return [];

            }


            return parsed;

        }

        catch (error) {

            console.error(
                "Cart storage error:",
                error
            );

            return [];

        }

    }


    // ============================================================
    // SAVE CART
    // ============================================================

    function saveCart() {

        const cartKey =
            getCartKey();


        if (!cartKey) {

            console.error(
                "Cannot save cart. User not logged in."
            );

            return;

        }


        localStorage.setItem(
            cartKey,
            JSON.stringify(cart)
        );


        console.log(
            "Cart saved:",
            cartKey,
            cart
        );

    }


    // ============================================================
    // LOAD PRODUCT FROM BACKEND
    // ============================================================

    async function loadProduct(productId) {

        const id =
            Number(productId);


        if (
            productCache[id]
        ) {

            return productCache[id];

        }


        try {

            const response =
                await fetch(
                    `${CART_API_URL}/products/${id}`,
                    {
                        method: "GET",

                        headers: {
                            "Accept":
                                "application/json"
                        }
                    }
                );


            if (!response.ok) {

                console.error(
                    `Product ${id} API error:`,
                    response.status
                );

                return null;

            }


            const product =
                await response.json();


            productCache[id] =
                product;


            return product;

        }

        catch (error) {

            console.error(
                `Unable to load product ${id}:`,
                error
            );

            return null;

        }

    }


    // ============================================================
    // LOAD CART
    // ============================================================

    async function loadCart() {

        console.log(
            "KAPRA CART: loading..."
        );


        const userId =
            getCurrentUserId();


        // --------------------------------------------------------
        // NOT LOGGED IN
        // --------------------------------------------------------

        if (!userId) {

            cart = [];

            showLoginMessage();

            return;

        }


        console.log(
            "Logged-in user:",
            userId
        );


        // --------------------------------------------------------
        // GET THIS USER'S CART
        // --------------------------------------------------------

        cart =
            getLocalCart();


        console.log(
            "Local cart:",
            cart
        );


        // --------------------------------------------------------
        // EMPTY CART
        // --------------------------------------------------------

        if (
            cart.length === 0
        ) {

            showEmptyCart();

            return;

        }


        // --------------------------------------------------------
        // SHOW CART AREA
        // --------------------------------------------------------

        showCartArea();


        // --------------------------------------------------------
        // LOAD ALL PRODUCTS
        // --------------------------------------------------------

        for (
            const item of cart
        ) {

            await loadProduct(
                item.product_id
            );

        }


        // --------------------------------------------------------
        // DISPLAY
        // --------------------------------------------------------

        renderCart();

    }


    // ============================================================
    // LOGIN MESSAGE
    // ============================================================

    function showLoginMessage() {

        const emptyCart =
            document.getElementById(
                "emptyCart"
            );

        const cartContent =
            document.getElementById(
                "cartContent"
            );


        if (cartContent) {

            cartContent.classList.add(
                "d-none"
            );

        }


        if (emptyCart) {

            emptyCart.classList.remove(
                "d-none"
            );


            emptyCart.innerHTML = `

                <div class="text-center py-5">

                    <i
                        class="bi bi-person-lock"
                        style="font-size:50px;"
                    ></i>

                    <h3 class="mt-3">
                        Please Login
                    </h3>

                    <p class="text-muted">
                        Login to view your shopping cart.
                    </p>

                    <a
                        href="/static/login.html"
                        class="btn btn-dark"
                    >
                        Login
                    </a>

                </div>

            `;

        }

    }


    // ============================================================
    // SHOW EMPTY CART
    // ============================================================

    function showEmptyCart() {

        const emptyCart =
            document.getElementById(
                "emptyCart"
            );

        const cartContent =
            document.getElementById(
                "cartContent"
            );


        if (cartContent) {

            cartContent.classList.add(
                "d-none"
            );

        }


        if (emptyCart) {

            emptyCart.classList.remove(
                "d-none"
            );


            emptyCart.innerHTML = `

                <div class="text-center py-5">

                    <i
                        class="bi bi-cart-x"
                        style="font-size:60px;"
                    ></i>

                    <h3 class="mt-3">
                        Your Cart is Empty
                    </h3>

                    <p class="text-muted">
                        Add some products to your cart.
                    </p>

                    <a
                        href="/static/products.html"
                        class="btn btn-dark"
                    >
                        Continue Shopping
                    </a>

                </div>

            `;

        }


        updateTotals();

    }


    // ============================================================
    // SHOW CART AREA
    // ============================================================

    function showCartArea() {

        const emptyCart =
            document.getElementById(
                "emptyCart"
            );

        const cartContent =
            document.getElementById(
                "cartContent"
            );


        if (emptyCart) {

            emptyCart.classList.add(
                "d-none"
            );

        }


        if (cartContent) {

            cartContent.classList.remove(
                "d-none"
            );

        }

    }


    // ============================================================
    // RENDER CART
    // ============================================================

    function renderCart() {

        const cartItems =
            document.getElementById(
                "cartItems"
            );


        if (!cartItems) {

            console.error(
                "ERROR: cartItems element not found."
            );

            return;

        }


        if (
            cart.length === 0
        ) {

            showEmptyCart();

            return;

        }


        showCartArea();


        cartItems.innerHTML = "";


        cart.forEach(
            function (item) {

                const product =
                    productCache[
                        Number(
                            item.product_id
                        )
                    ];


                // ------------------------------------------------
                // PRODUCT NOT FOUND
                // ------------------------------------------------

                if (!product) {

                    console.error(
                        "Product not found:",
                        item.product_id
                    );

                    return;

                }


                const productId =
                    Number(
                        item.product_id
                    );


                const quantity =
                    Number(
                        item.quantity
                    ) || 1;


                const price =
                    Number(
                        product.price
                    ) || 0;


                const subtotal =
                    price * quantity;


                const image =
                    product.image_url ||
                    "/static/images/tshirts.jpg";


                const itemElement =
                    document.createElement(
                        "div"
                    );


                itemElement.className =
                    "cart-item";


                itemElement.innerHTML = `

                    <!-- PRODUCT IMAGE -->

                    <img
                        src="${escapeHTML(image)}"
                        alt="${escapeHTML(
                            product.name
                        )}"
                        class="cart-item-image"
                        onerror="
                            this.src='/static/images/tshirts.jpg'
                        "
                    >


                    <!-- PRODUCT DETAILS -->

                    <div class="cart-item-details">

                        <div class="cart-item-name">

                            ${escapeHTML(
                                product.name
                            )}

                        </div>


                        <div class="cart-item-price">

                            ₹${price.toFixed(2)}

                        </div>


                        <!-- QUANTITY -->

                        <div class="cart-item-quantity">

                            <button
                                type="button"
                                class="cart-quantity-btn"
                                data-action="decrease"
                                data-product-id="${productId}"
                            >
                                −
                            </button>


                            <span
                                class="cart-quantity-value"
                            >
                                ${quantity}
                            </span>


                            <button
                                type="button"
                                class="cart-quantity-btn"
                                data-action="increase"
                                data-product-id="${productId}"
                            >
                                +
                            </button>

                        </div>

                    </div>


                    <!-- RIGHT SIDE -->

                    <div class="cart-item-right">

                        <div class="cart-item-total">

                            ₹${subtotal.toFixed(2)}

                        </div>


                        <button
                            type="button"
                            class="remove-cart-item"
                            data-action="remove"
                            data-product-id="${productId}"
                        >

                            <i class="bi bi-trash"></i>

                            Remove

                        </button>

                    </div>

                `;


                cartItems.appendChild(
                    itemElement
                );

            }
        );


        updateTotals();

    }


    // ============================================================
    // INCREASE QUANTITY
    // ============================================================

    function increaseQuantity(
        productId
    ) {

        const id =
            Number(productId);


        const item =
            cart.find(
                function (cartItem) {

                    return (
                        Number(
                            cartItem.product_id
                        ) === id
                    );

                }
            );


        if (!item) {

            return;

        }


        const product =
            productCache[id];


        if (product) {

            const stock =
                Number(
                    product.stock
                );


            if (
                Number(item.quantity) >=
                stock
            ) {

                showMessage(
                    "Maximum available stock reached.",
                    "warning"
                );

                return;

            }

        }


        item.quantity =
            Number(
                item.quantity
            ) + 1;


        saveCart();

        renderCart();

    }


    // ============================================================
    // DECREASE QUANTITY
    // ============================================================

    function decreaseQuantity(
        productId
    ) {

        const id =
            Number(productId);


        const item =
            cart.find(
                function (cartItem) {

                    return (
                        Number(
                            cartItem.product_id
                        ) === id
                    );

                }
            );


        if (!item) {

            return;

        }


        if (
            Number(item.quantity) <= 1
        ) {

            removeItem(id);

            return;

        }


        item.quantity =
            Number(
                item.quantity
            ) - 1;


        saveCart();

        renderCart();

    }


    // ============================================================
    // REMOVE PRODUCT
    // ============================================================

    function removeItem(
        productId
    ) {

        const id =
            Number(productId);


        cart =
            cart.filter(
                function (item) {

                    return (
                        Number(
                            item.product_id
                        ) !== id
                    );

                }
            );


        delete productCache[id];


        saveCart();

        renderCart();


        showMessage(
            "Product removed from cart.",
            "success"
        );

    }


    // ============================================================
    // UPDATE TOTALS
    // ============================================================

    function updateTotals() {

        let total = 0;


        cart.forEach(
            function (item) {

                const product =
                    productCache[
                        Number(
                            item.product_id
                        )
                    ];


                const price =
                    product
                        ? Number(
                            product.price
                        )
                        : Number(
                            item.price
                        ) || 0;


                const quantity =
                    Number(
                        item.quantity
                    ) || 0;


                total +=
                    price * quantity;

            }
        );


        const subtotalElement =
            document.getElementById(
                "cartSubtotal"
            );


        const totalElement =
            document.getElementById(
                "cartTotal"
            );


        if (subtotalElement) {

            subtotalElement.textContent =
                formatCurrency(
                    total
                );

        }


        if (totalElement) {

            totalElement.textContent =
                formatCurrency(
                    total
                );

        }

    }


    // ============================================================
    // CHECKOUT
    // ============================================================

    async function checkout() {

        const token =
            getToken();


        if (!token) {

            alert(
                "Please login before checkout."
            );


            window.location.href =
                "/static/login.html";


            return;

        }


        if (
            !cart ||
            cart.length === 0
        ) {

            showMessage(
                "Your cart is empty.",
                "danger"
            );

            return;

        }


        const checkoutButton =
            document.getElementById(
                "checkoutButton"
            );


        if (checkoutButton) {

            checkoutButton.disabled =
                true;


            checkoutButton.innerHTML = `

                <span
                    class="spinner-border spinner-border-sm me-2"
                ></span>

                Processing...

            `;

        }


        try {

            // ----------------------------------------------------
            // STEP 1: SEND LOCAL CART TO BACKEND CART
            // ----------------------------------------------------

            for (
                const item of cart
            ) {

                const productId =
                    Number(
                        item.product_id
                    );


                const quantity =
                    Number(
                        item.quantity
                    );


                const response =
                    await fetch(
                        `${CART_API_URL}/cart/items`,
                        {
                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json",

                                "Authorization":
                                    `Bearer ${token}`

                            },

                            body:
                                JSON.stringify({

                                    product_id:
                                        productId,

                                    quantity:
                                        quantity

                                })

                        }
                    );


                if (!response.ok) {

                    let errorMessage =
                        "Unable to sync cart.";


                    try {

                        const data =
                            await response.json();


                        errorMessage =
                            data.detail ||
                            errorMessage;

                    }

                    catch {

                        // Ignore JSON error

                    }


                    throw new Error(
                        errorMessage
                    );

                }

            }


            // ----------------------------------------------------
            // STEP 2: CHECKOUT
            // ----------------------------------------------------

            const orderResponse =
                await fetch(
                    `${CART_API_URL}/orders/checkout`,
                    {
                        method: "POST",

                        headers: {

                            "Authorization":
                                `Bearer ${token}`,

                            "Accept":
                                "application/json"

                        }

                    }
                );


            let orderData = {};


            try {

                orderData =
                    await orderResponse.json();

            }

            catch {

                orderData = {};

            }


            if (
                !orderResponse.ok
            ) {

                throw new Error(
                    orderData.detail ||
                    "Checkout failed."
                );

            }


            // ----------------------------------------------------
            // STEP 3: CLEAR CURRENT USER CART
            // ----------------------------------------------------

            const cartKey =
                getCartKey();


            if (cartKey) {

                localStorage.removeItem(
                    cartKey
                );

            }


            // Remove old cart from previous version

            localStorage.removeItem(
                "cart"
            );


            cart = [];


            // ----------------------------------------------------
            // SUCCESS
            // ----------------------------------------------------

            alert(
                `Order #${orderData.id} placed successfully!`
            );


            window.location.href =
                "/static/orders.html";

        }


        catch (error) {

            console.error(
                "CHECKOUT ERROR:",
                error
            );


            showMessage(
                error.message ||
                "Something went wrong during checkout.",
                "danger"
            );


            if (checkoutButton) {

                checkoutButton.disabled =
                    false;


                checkoutButton.innerHTML = `

                    <i class="bi bi-lock"></i>

                    Checkout

                `;

            }

        }

    }


    // ============================================================
    // CART BUTTON EVENTS
    // ============================================================

    function setupCartEvents() {

        const cartItems =
            document.getElementById(
                "cartItems"
            );


        if (!cartItems) {

            return;

        }


        cartItems.addEventListener(
            "click",
            function (event) {

                const button =
                    event.target.closest(
                        "button"
                    );


                if (!button) {

                    return;

                }


                const action =
                    button.dataset.action;


                const productId =
                    Number(
                        button.dataset.productId
                    );


                if (!productId) {

                    return;

                }


                if (
                    action === "increase"
                ) {

                    increaseQuantity(
                        productId
                    );

                }


                else if (
                    action === "decrease"
                ) {

                    decreaseQuantity(
                        productId
                    );

                }


                else if (
                    action === "remove"
                ) {

                    removeItem(
                        productId
                    );

                }

            }
        );

    }


    // ============================================================
    // CHECKOUT EVENT
    // ============================================================

    function setupCheckoutEvent() {

        const checkoutButton =
            document.getElementById(
                "checkoutButton"
            );


        if (!checkoutButton) {

            return;

        }


        checkoutButton.addEventListener(
            "click",
            checkout
        );

    }


    // ============================================================
    // MESSAGE
    // ============================================================

    function showMessage(
        message,
        type
    ) {

        const messageBox =
            document.getElementById(
                "cartMessage"
            );


        if (!messageBox) {

            alert(message);

            return;

        }


        messageBox.innerHTML = `

            <div
                class="alert alert-${type}"
            >

                ${escapeHTML(message)}

            </div>

        `;


        setTimeout(
            function () {

                messageBox.innerHTML =
                    "";

            },
            4000
        );

    }


    // ============================================================
    // FORMAT CURRENCY
    // ============================================================

    function formatCurrency(
        amount
    ) {

        return (
            "₹" +
            Number(
                amount || 0
            ).toLocaleString(
                "en-IN",
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }
            )
        );

    }


    // ============================================================
    // ESCAPE HTML
    // ============================================================

    function escapeHTML(
        value
    ) {

        return String(
            value ?? ""
        )
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );

    }


    // ============================================================
    // START
    // ============================================================

    function startCart() {

        console.log(
            "KAPRA CART JS STARTED"
        );


        setupCartEvents();

        setupCheckoutEvent();

        loadCart();

    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            startCart
        );

    }

    else {

        startCart();

    }

})();