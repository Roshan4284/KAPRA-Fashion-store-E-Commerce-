(function () {

    "use strict";


    // ============================================================
    // KAPRA - PRODUCT DETAILS
    // ============================================================

    const PRODUCT_API_URL =
        "http://127.0.0.1:8000";


    // ============================================================
    // GET PRODUCT ID
    // ============================================================

    function getProductId() {

        const params =
            new URLSearchParams(
                window.location.search
            );

        return params.get("id");
    }


    // ============================================================
    // SHOW ERROR
    // ============================================================

    function showError(message) {

        const loading =
            document.getElementById("loading");

        const errorMessage =
            document.getElementById("errorMessage");

        const productDetails =
            document.getElementById("productDetails");


        if (loading) {

            loading.classList.add("d-none");

        }


        if (productDetails) {

            productDetails.classList.add("d-none");

        }


        if (errorMessage) {

            errorMessage.classList.remove("d-none");

            errorMessage.textContent =
                message;

        }

    }


    // ============================================================
    // DISPLAY PRODUCT
    // ============================================================

    function showProduct(product) {

        console.log(
            "Displaying product:",
            product
        );


        // --------------------------------------------------------
        // IMAGE
        // --------------------------------------------------------

        const productImage =
            document.getElementById(
                "productImage"
            );


        if (productImage) {

            productImage.src =
                product.image_url ||
                "/static/images/tshirts.jpg";

            productImage.alt =
                product.name ||
                "Product";


            productImage.onerror =
                function () {

                    this.src =
                        "/static/images/tshirts.jpg";

                };

        }


        // --------------------------------------------------------
        // THUMBNAIL
        // --------------------------------------------------------

        const thumbnail =
            document.getElementById(
                "thumbnailMain"
            );


        if (thumbnail) {

            thumbnail.src =
                product.image_url ||
                "/static/images/tshirts.jpg";

            thumbnail.alt =
                product.name ||
                "Product";

        }


        // --------------------------------------------------------
        // NAME
        // --------------------------------------------------------

        const productName =
            document.getElementById(
                "productName"
            );


        if (productName) {

            productName.textContent =
                product.name || "";

        }


        // --------------------------------------------------------
        // BREADCRUMB NAME
        // --------------------------------------------------------

        const breadcrumbName =
            document.getElementById(
                "breadcrumbProductName"
            );


        if (breadcrumbName) {

            breadcrumbName.textContent =
                product.name || "Product";

        }


        // --------------------------------------------------------
        // DESCRIPTION
        // --------------------------------------------------------

        const productDescription =
            document.getElementById(
                "productDescription"
            );


        if (productDescription) {

            productDescription.textContent =
                product.description || "";

        }


        // --------------------------------------------------------
        // PRICE
        // --------------------------------------------------------

        const productPrice =
            document.getElementById(
                "productPrice"
            );


        if (productPrice) {

            productPrice.textContent =
                `₹${Number(
                    product.price || 0
                ).toFixed(2)}`;

        }


        // --------------------------------------------------------
        // SIZE
        // --------------------------------------------------------

        const productSize =
            document.getElementById(
                "productSize"
            );


        if (productSize) {

            productSize.textContent =
                product.size || "N/A";

        }


        // --------------------------------------------------------
        // COLOR
        // --------------------------------------------------------

        const productColor =
            document.getElementById(
                "productColor"
            );


        if (productColor) {

            productColor.textContent =
                product.color || "N/A";

        }


        // --------------------------------------------------------
        // STOCK
        // --------------------------------------------------------

        const productStock =
            document.getElementById(
                "productStock"
            );


        if (productStock) {

            productStock.textContent =
                product.stock;

        }


        // --------------------------------------------------------
        // STOCK STATUS
        // --------------------------------------------------------

        const stockStatus =
            document.getElementById(
                "stockStatus"
            );


        if (stockStatus) {

            if (
                Number(product.stock) <= 0
            ) {

                stockStatus.textContent =
                    "Out of Stock";

            } else {

                stockStatus.textContent =
                    "In Stock";

            }

        }


        // --------------------------------------------------------
        // QUANTITY
        // --------------------------------------------------------

        const quantity =
            document.getElementById(
                "quantity"
            );


        if (quantity) {

            quantity.min = 1;

            quantity.max =
                Math.max(
                    1,
                    Number(product.stock)
                );

            quantity.value = 1;

        }


        // --------------------------------------------------------
        // PLUS BUTTON
        // --------------------------------------------------------

        const increaseButton =
            document.getElementById(
                "increaseQuantity"
            );


        if (increaseButton) {

            increaseButton.onclick =
                function () {

                    if (!quantity) {
                        return;
                    }


                    const current =
                        Number(
                            quantity.value
                        );


                    const max =
                        Number(
                            product.stock
                        );


                    if (
                        current < max
                    ) {

                        quantity.value =
                            current + 1;

                    }

                };

        }


        // --------------------------------------------------------
        // MINUS BUTTON
        // --------------------------------------------------------

        const decreaseButton =
            document.getElementById(
                "decreaseQuantity"
            );


        if (decreaseButton) {

            decreaseButton.onclick =
                function () {

                    if (!quantity) {
                        return;
                    }


                    const current =
                        Number(
                            quantity.value
                        );


                    if (
                        current > 1
                    ) {

                        quantity.value =
                            current - 1;

                    }

                };

        }


        // --------------------------------------------------------
        // ADD TO CART
        // --------------------------------------------------------

        const addButton =
            document.getElementById(
                "addToCartButton"
            );


        if (addButton) {

            if (
                Number(product.stock) <= 0
            ) {

                addButton.disabled =
                    true;

                addButton.textContent =
                    "Out of Stock";

            } else {

                addButton.disabled =
                    false;

                addButton.textContent =
                    "Add to Cart";


                addButton.onclick =
                    function () {

                        addToCart(
                            product
                        );

                    };

            }

        }


        // --------------------------------------------------------
        // HIDE LOADING
        // --------------------------------------------------------

        const loading =
            document.getElementById(
                "loading"
            );


        if (loading) {

            loading.classList.add(
                "d-none"
            );

        }


        // --------------------------------------------------------
        // SHOW PRODUCT
        // --------------------------------------------------------

        const productDetails =
            document.getElementById(
                "productDetails"
            );


        if (productDetails) {

            productDetails.classList.remove(
                "d-none"
            );

        }


        console.log(
            "Product displayed successfully."
        );

    }


    // ============================================================
    // LOAD PRODUCT
    // ============================================================

    async function loadProductDetails() {

        const productId =
            getProductId();


        console.log(
            "Product ID:",
            productId
        );


        // --------------------------------------------------------
        // CHECK PRODUCT ID
        // --------------------------------------------------------

        if (!productId) {

            showError(
                "Product ID is missing."
            );

            return;

        }


        try {

            console.log(
                "Calling:",
                `${PRODUCT_API_URL}/products/${productId}`
            );


            // ----------------------------------------------------
            // BACKEND REQUEST
            // ----------------------------------------------------

            const response =
                await fetch(
                    `${PRODUCT_API_URL}/products/${productId}`,
                    {
                        method: "GET",

                        headers: {
                            "Accept":
                                "application/json"
                        }
                    }
                );


            console.log(
                "Product API status:",
                response.status
            );


            // ----------------------------------------------------
            // CHECK RESPONSE
            // ----------------------------------------------------

            if (!response.ok) {

                let message =
                    "Product not found.";


                try {

                    const errorData =
                        await response.json();


                    if (
                        errorData &&
                        errorData.detail
                    ) {

                        message =
                            errorData.detail;

                    }

                } catch {

                    // Ignore invalid JSON

                }


                throw new Error(
                    message
                );

            }


            // ----------------------------------------------------
            // READ JSON
            // ----------------------------------------------------

            const product =
                await response.json();


            console.log(
                "Product received:",
                product
            );


            // ----------------------------------------------------
            // DISPLAY
            // ----------------------------------------------------

            showProduct(
                product
            );

        }


        catch (error) {

            console.error(
                "Product loading error:",
                error
            );


            showError(
                error.message ||
                "Unable to load product."
            );

        }

    }


    // ============================================================
    // GET USER ID FROM JWT
    // ============================================================

    function getUserIdFromToken() {

        const token =
            localStorage.getItem(
                "access_token"
            );


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


            const payload =
                JSON.parse(
                    atob(
                        parts[1]
                            .replace(
                                /-/g,
                                "+"
                            )
                            .replace(
                                /_/g,
                                "/"
                            )
                    )
                );


            return payload.sub || null;

        }


        catch (error) {

            console.error(
                "Unable to read token:",
                error
            );


            return null;

        }

    }


    // ============================================================
    // CHECK ADMIN
    // ============================================================

    function isAdminUser() {

        const token =
            localStorage.getItem(
                "access_token"
            );


        if (!token) {

            return false;

        }


        try {

            const parts =
                token.split(".");


            if (
                parts.length !== 3
            ) {

                return false;

            }


            const payload =
                JSON.parse(
                    atob(
                        parts[1]
                            .replace(
                                /-/g,
                                "+"
                            )
                            .replace(
                                /_/g,
                                "/"
                            )
                    )
                );


            return (
                payload.role === "admin"
            );

        }


        catch {

            return false;

        }

    }


    // ============================================================
    // ADD TO CART
    // ============================================================

    function addToCart(product) {

        // --------------------------------------------------------
        // CHECK LOGIN
        // --------------------------------------------------------

        const userId =
            getUserIdFromToken();


        if (!userId) {

            alert(
                "Please login before adding products to cart."
            );


            window.location.href =
                "/static/login.html";


            return;

        }


        // --------------------------------------------------------
        // ADMIN CANNOT SHOP
        // --------------------------------------------------------

        if (
            isAdminUser()
        ) {

            alert(
                "Admin accounts cannot add products to cart."
            );


            window.location.href =
                "/static/admin.html";


            return;

        }


        // --------------------------------------------------------
        // QUANTITY
        // --------------------------------------------------------

        const quantityInput =
            document.getElementById(
                "quantity"
            );


        let quantity =
            Number(
                quantityInput
                    ? quantityInput.value
                    : 1
            );


        if (
            !Number.isInteger(quantity) ||
            quantity < 1
        ) {

            quantity = 1;

        }


        // --------------------------------------------------------
        // STOCK CHECK
        // --------------------------------------------------------

        if (
            quantity >
            Number(product.stock)
        ) {

            alert(
                `Only ${product.stock} items are available.`
            );


            return;

        }


        // --------------------------------------------------------
        // USER-SPECIFIC CART
        // --------------------------------------------------------

        const cartKey =
            `cart_user_${userId}`;


        let cart = [];


        try {

            cart =
                JSON.parse(
                    localStorage.getItem(
                        cartKey
                    ) || "[]"
                );


            if (
                !Array.isArray(cart)
            ) {

                cart = [];

            }

        }


        catch {

            cart = [];

        }


        // --------------------------------------------------------
        // FIND EXISTING PRODUCT
        // --------------------------------------------------------

        const existingItem =
            cart.find(
                function (item) {

                    return (
                        Number(
                            item.product_id
                        ) ===
                        Number(
                            product.id
                        )
                    );

                }
            );


        // --------------------------------------------------------
        // UPDATE EXISTING ITEM
        // --------------------------------------------------------

        if (
            existingItem
        ) {

            const newQuantity =
                Number(
                    existingItem.quantity
                ) +
                quantity;


            if (
                newQuantity >
                Number(product.stock)
            ) {

                alert(
                    `Only ${product.stock} items are available.`
                );


                return;

            }


            existingItem.quantity =
                newQuantity;

        }


        // --------------------------------------------------------
        // ADD NEW ITEM
        // --------------------------------------------------------

        else {

            cart.push({

                product_id:
                    Number(
                        product.id
                    ),

                quantity:
                    quantity,

                price:
                    Number(
                        product.price
                    )

            });

        }


        // --------------------------------------------------------
        // SAVE
        // --------------------------------------------------------

        localStorage.setItem(
            cartKey,
            JSON.stringify(cart)
        );


        // --------------------------------------------------------
        // SUCCESS MESSAGE
        // --------------------------------------------------------

        const cartMessage =
            document.getElementById(
                "cartMessage"
            );


        if (cartMessage) {

            cartMessage.innerHTML = `

                <div
                    class="alert alert-success"
                >

                    <strong>
                        ${escapeHTML(
                            product.name
                        )}
                    </strong>

                    has been added to your cart.

                    <a
                        href="/static/cart.html"
                        class="alert-link ms-2"
                    >
                        View Cart
                    </a>

                </div>

            `;

        }

    }


    // ============================================================
    // ESCAPE HTML
    // ============================================================

    function escapeHTML(value) {

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

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            loadProductDetails
        );

    } else {

        loadProductDetails();

    }

})();