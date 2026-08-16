// ============================================================
// KAPRA PRODUCTS
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
// CHECK ADMIN
// ============================================================

function isAdmin() {

    const payload =
        getTokenPayload();

    return (
        payload &&
        payload.role === "admin"
    );

}


// ============================================================
// GET CATEGORY FROM URL
// ============================================================

function getCategoryId() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    const category =
        params.get("category");

    if (!category) {

        return null;

    }

    const categoryId =
        Number(category);

    if (
        Number.isNaN(categoryId)
    ) {

        return null;

    }

    return categoryId;

}


// ============================================================
// LOAD PRODUCTS
// ============================================================

async function loadProducts() {

    const loading =
        document.getElementById(
            "loading"
        );

    const errorMessage =
        document.getElementById(
            "errorMessage"
        );

    const productContainer =
        document.getElementById(
            "productContainer"
        );


    // ========================================================
    // SAFETY CHECK
    // ========================================================

    if (!productContainer) {

        console.error(
            "Product container not found."
        );

        return;

    }


    try {

        // ====================================================
        // CHECK ROLE FROM JWT
        // ====================================================

        const admin =
            isAdmin();


        console.log(
            "Admin:",
            admin
        );


        // ====================================================
        // GET PRODUCTS
        // ====================================================

        const response =
            await fetch(
                `${API_URL}/products/?skip=0&limit=1000`,
                {
                    method: "GET",
                    headers: {
                        "Accept":
                            "application/json"
                    }
                }
            );


        console.log(
            "Products API status:",
            response.status
        );


        if (!response.ok) {

            let errorData = {};

            try {

                errorData =
                    await response.json();

            } catch {

                errorData = {};

            }


            throw new Error(
                errorData.detail ||
                "Unable to load products."
            );

        }


        const data =
            await response.json();


        console.log(
            "Products received:",
            data
        );


        // ====================================================
        // HIDE LOADING
        // ====================================================

        if (loading) {

            loading.classList.add(
                "d-none"
            );

        }


        // ====================================================
        // CATEGORY
        // ====================================================

        const categoryId =
            getCategoryId();


        let products =
            Array.isArray(data)
                ? data
                : [];


        // ====================================================
        // FILTER CATEGORY
        // ====================================================

        if (
            categoryId !== null
        ) {

            products =
                products.filter(
                    product =>

                        Number(
                            product.category_id
                        ) ===
                        categoryId
                );

        }


        console.log(
            "Products displayed:",
            products
        );


        // ====================================================
        // NO PRODUCTS
        // ====================================================

        if (
            products.length === 0
        ) {

            productContainer.innerHTML = `

                <div class="col-12">

                    <div
                        class="text-center py-5"
                    >

                        <h3>
                            No products found
                        </h3>

                        <p class="text-muted">
                            There are currently no products
                            in this category.
                        </p>

                        <a
                            href="/static/products.html"
                            class="btn btn-dark"
                        >
                            View All Products
                        </a>

                    </div>

                </div>

            `;

            return;

        }


        // ====================================================
        // DISPLAY PRODUCTS
        // ====================================================

        displayProducts(
            products,
            admin
        );

    }


    catch (error) {

        console.error(
            "Error loading products:",
            error
        );


        if (loading) {

            loading.classList.add(
                "d-none"
            );

        }


        if (errorMessage) {

            errorMessage.classList.remove(
                "d-none"
            );

            errorMessage.textContent =
                error.message;

        }

    }

}


// ============================================================
// DISPLAY PRODUCTS
// ============================================================

function displayProducts(
    products,
    admin
) {

    const productContainer =
        document.getElementById(
            "productContainer"
        );


    if (!productContainer) {

        return;

    }


    productContainer.innerHTML =
        "";


    products.forEach(
        product => {

            const productCard =
                document.createElement(
                    "div"
                );


            productCard.className =
                "col-12 col-sm-6 col-lg-4 col-xl-3";


            // =================================================
            // PRODUCT IMAGE
            // =================================================

            const imageUrl =
                product.image_url ||
                "/static/images/tshirts.jpg";


            // =================================================
            // PRODUCT NAME
            // =================================================

            const productName =
                escapeHTML(
                    product.name || ""
                );


            // =================================================
            // DESCRIPTION
            // =================================================

            const description =
                escapeHTML(
                    product.description || ""
                );


            // =================================================
            // SIZE
            // =================================================

            const size =
                escapeHTML(
                    product.size || "N/A"
                );


            // =================================================
            // COLOR
            // =================================================

            const color =
                escapeHTML(
                    product.color || "N/A"
                );


            // =================================================
            // PRICE
            // =================================================

            const price =
                Number(
                    product.price || 0
                ).toFixed(2);


            // =================================================
            // STOCK
            // =================================================

            const stock =
                Number(
                    product.stock || 0
                );


            // =================================================
            // ADMIN CARD
            // =================================================

            if (admin) {

                productCard.innerHTML = `

                    <div
                        class="card h-100 shadow-sm border-0"
                    >

                        <!-- IMAGE -->

                        <div
                            style="
                                height: 300px;
                                overflow: hidden;
                                background: #f5f5f5;
                            "
                        >

                            <img
                                src="${imageUrl}"
                                alt="${productName}"
                                class="w-100 h-100"
                                style="
                                    object-fit: cover;
                                    display: block;
                                "
                                onerror="
                                    this.src='/static/images/tshirts.jpg';
                                "
                            >

                        </div>


                        <!-- DETAILS -->

                        <div class="card-body">

                            <h5
                                class="card-title fw-bold"
                            >
                                ${productName}
                            </h5>


                            <p
                                class="text-muted mb-2"
                            >
                                ${description}
                            </p>


                            <h5
                                class="fw-bold mb-2"
                            >
                                ₹${price}
                            </h5>


                            <div
                                class="small text-muted mb-3"
                            >

                                <div>
                                    Size: ${size}
                                </div>

                                <div>
                                    Color: ${color}
                                </div>

                                <div>
                                    Stock: ${stock}
                                </div>

                            </div>


                            <a
                                href="/static/admin-products.html"
                                class="btn btn-dark w-100"
                            >

                                <i
                                    class="bi bi-pencil-square me-1"
                                ></i>

                                Manage Product

                            </a>

                        </div>

                    </div>

                `;

            }


            // =================================================
            // CUSTOMER CARD
            // =================================================

            else {

                productCard.innerHTML = `

                    <div
                        class="card h-100 shadow-sm border-0"
                    >

                        <!-- IMAGE -->

                        <div
                            style="
                                height: 300px;
                                overflow: hidden;
                                background: #f5f5f5;
                            "
                        >

                            <img
                                src="${imageUrl}"
                                alt="${productName}"
                                class="w-100 h-100"
                                style="
                                    object-fit: cover;
                                    display: block;
                                "
                                onerror="
                                    this.src='/static/images/tshirts.jpg';
                                "
                            >

                        </div>


                        <!-- DETAILS -->

                        <div class="card-body">

                            <h5
                                class="card-title fw-bold"
                            >
                                ${productName}
                            </h5>


                            <p
                                class="text-muted mb-2"
                            >
                                ${description}
                            </p>


                            <h5
                                class="fw-bold mb-2"
                            >
                                ₹${price}
                            </h5>


                            <div
                                class="small text-muted mb-3"
                            >

                                <div>
                                    Size: ${size}
                                </div>

                                <div>
                                    Color: ${color}
                                </div>

                                <div>
                                    Stock: ${stock}
                                </div>

                            </div>


                            <!-- VIEW PRODUCT -->

                            <button
                                type="button"
                                class="btn btn-dark w-100 view-product-btn"
                                data-product-id="${product.id}"
                            >

                                View Product

                            </button>

                        </div>

                    </div>

                `;


                // =================================================
                // VIEW PRODUCT CLICK
                // =================================================

                const viewButton =
                    productCard.querySelector(
                        ".view-product-btn"
                    );


                if (viewButton) {

                    viewButton.addEventListener(
                        "click",
                        function () {

                            const productId =
                                this.dataset.productId;


                            console.log(
                                "Opening product:",
                                productId
                            );


                            // Direct navigation

                            window.location.href =
                                `/static/product-details.html?id=${encodeURIComponent(
                                    productId
                                )}`;

                        }
                    );

                }

            }


            // =================================================
            // ADD CARD TO CONTAINER
            // =================================================

            productContainer.appendChild(
                productCard
            );

        }
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

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadProducts();

    }
);