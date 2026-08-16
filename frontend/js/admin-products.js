// ============================================================
// KAPRA ADMIN PRODUCT MANAGEMENT
// ============================================================

const API_URL = "http://127.0.0.1:8000";


// ============================================================
// GLOBAL VARIABLES
// ============================================================

let products = [];

let editingProductId = null;

let productModal = null;


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
// CHECK ADMIN LOGIN
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
// LOAD PRODUCTS
// ============================================================

async function loadProducts() {

    const loading =
        document.getElementById(
            "productsLoading"
        );

    const tableWrapper =
        document.getElementById(
            "productsTableWrapper"
        );

    const noProducts =
        document.getElementById(
            "noProducts"
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

    if (noProducts) {

        noProducts.classList.add(
            "d-none"
        );

    }


    try {

        const response =
            await fetch(
                `${API_URL}/products/?skip=0&limit=1000`
            );


        if (!response.ok) {

            const errorText =
                await response.text();

            console.error(
                "Products API error:",
                errorText
            );

            throw new Error(
                "Unable to load products"
            );

        }


        products =
            await response.json();


        console.log(
            "Products loaded:",
            products
        );


        displayProducts(
            products
        );


    } catch (error) {

        console.error(
            "Load products error:",
            error
        );


        showMessage(
            error.message,
            "danger"
        );


    } finally {

        if (loading) {

            loading.classList.add(
                "d-none"
            );

        }

    }

}


// ============================================================
// DISPLAY PRODUCTS
// ============================================================

function displayProducts(productsList) {

    const tableBody =
        document.getElementById(
            "productsTableBody"
        );

    const tableWrapper =
        document.getElementById(
            "productsTableWrapper"
        );

    const noProducts =
        document.getElementById(
            "noProducts"
        );


    if (!tableBody) {

        return;

    }


    tableBody.innerHTML = "";


    if (
        !productsList ||
        productsList.length === 0
    ) {

        if (tableWrapper) {

            tableWrapper.classList.add(
                "d-none"
            );

        }

        if (noProducts) {

            noProducts.classList.remove(
                "d-none"
            );

        }

        return;

    }


    if (noProducts) {

        noProducts.classList.add(
            "d-none"
        );

    }

    if (tableWrapper) {

        tableWrapper.classList.remove(
            "d-none"
        );

    }


    productsList.forEach(
        product => {

            const row =
                document.createElement(
                    "tr"
                );


            // =================================================
            // IMAGE
            // =================================================

            const imageUrl =
                product.image_url ||
                "/static/images/tshirts.jpg";


            // =================================================
            // CATEGORY
            // =================================================

            const categoryName =
                getCategoryName(
                    product.category_id
                );


            // =================================================
            // STATUS
            // =================================================

            const isActive =
                product.is_active !== false;


            const statusClass =
                isActive
                    ? "admin-status-active"
                    : "admin-status-inactive";


            const statusText =
                isActive
                    ? "Active"
                    : "Inactive";


            // =================================================
            // STOCK
            // =================================================

            let stockClass =
                "admin-stock-good";


            if (
                Number(product.stock) === 0
            ) {

                stockClass =
                    "admin-stock-out";

            } else if (
                Number(product.stock) <= 5
            ) {

                stockClass =
                    "admin-stock-low";

            }


            // =================================================
            // ROW
            // =================================================

            row.innerHTML = `

                <td>

                    <span
                        class="admin-product-id"
                    >

                        #${product.id}

                    </span>

                </td>


                <td>

                    <div
                        class="admin-product-image-wrapper"
                    >

                        <img
                            src="${imageUrl}"
                            alt="${escapeHtml(product.name)}"
                            class="admin-product-image"
                            onerror="
                                this.src='/static/images/tshirts.jpg'
                            "
                        >


                        <div
                            class="admin-product-name"
                        >

                            <strong>
                                ${escapeHtml(product.name)}
                            </strong>

                            <small>
                                ${escapeHtml(
                                    product.description || ""
                                )}
                            </small>

                        </div>

                    </div>

                </td>


                <td>

                    <span
                        class="admin-category-badge"
                    >

                        ${categoryName}

                    </span>

                </td>


                <td>

                    <span
                        class="admin-product-price"
                    >

                        ₹${product.price}

                    </span>

                </td>


                <td>

                    <span
                        class="admin-product-stock ${stockClass}"
                    >

                        ${product.stock}

                    </span>

                </td>


                <td>

                    <span
                        class="admin-product-meta"
                    >

                        ${escapeHtml(
                            product.size || "N/A"
                        )}

                    </span>

                </td>


                <td>

                    <span
                        class="admin-product-meta"
                    >

                        ${escapeHtml(
                            product.color || "N/A"
                        )}

                    </span>

                </td>


                <td>

                    <span
                        class="admin-status-badge ${statusClass}"
                    >

                        ${statusText}

                    </span>

                </td>


                <td>

                    <div
                        class="admin-product-actions"
                    >


                        <!-- EDIT -->

                        <button
                            type="button"
                            class="admin-product-action"
                            title="Edit Product"
                            onclick="editProduct(${product.id})"
                        >

                            <i
                                class="bi bi-pencil"
                            ></i>

                        </button>


                        <!-- ACTIVATE / DEACTIVATE -->

                        <button
                            type="button"
                            class="admin-product-action"
                            title="${isActive
                                ? "Deactivate Product"
                                : "Activate Product"
                            }"
                            onclick="toggleProductStatus(
                                ${product.id},
                                ${isActive}
                            )"
                        >

                            <i
                                class="bi ${
                                    isActive
                                        ? "bi-eye-slash"
                                        : "bi-eye"
                                }"
                            ></i>

                        </button>


                        <!-- DELETE -->

                        <button
                            type="button"
                            class="admin-product-action delete"
                            title="Delete Product"
                            onclick="deleteProduct(${product.id})"
                        >

                            <i
                                class="bi bi-trash"
                            ></i>

                        </button>


                    </div>

                </td>

            `;


            tableBody.appendChild(
                row
            );

        }
    );

}


// ============================================================
// CATEGORY NAME
// ============================================================

function getCategoryName(categoryId) {

    const categories = {

        1: "Men",

        2: "Women",

        3: "Kids"

    };


    return (
        categories[
            Number(categoryId)
        ] ||
        `Category #${categoryId}`
    );

}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

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
            "productMessage"
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
// OPEN ADD PRODUCT MODAL
// ============================================================

function openAddProductModal() {

    editingProductId =
        null;


    const title =
        document.getElementById(
            "productModalTitle"
        );


    if (title) {

        title.textContent =
            "Add Product";

    }


    resetProductForm();


    if (!productModal) {

        productModal =
            new bootstrap.Modal(
                document.getElementById(
                    "productModal"
                )
            );

    }


    productModal.show();

}


// ============================================================
// RESET FORM
// ============================================================

function resetProductForm() {

    const form =
        document.getElementById(
            "productForm"
        );


    if (form) {

        form.reset();

    }


    const activeCheckbox =
        document.getElementById(
            "productActive"
        );


    if (activeCheckbox) {

        activeCheckbox.checked =
            true;

    }


    const errorBox =
        document.getElementById(
            "formError"
        );


    if (errorBox) {

        errorBox.classList.add(
            "d-none"
        );

        errorBox.textContent =
            "";

    }

}


// ============================================================
// EDIT PRODUCT
// ============================================================

function editProduct(productId) {

    const product =
        products.find(
            item =>
                Number(item.id) ===
                Number(productId)
        );


    if (!product) {

        showMessage(
            "Product not found.",
            "danger"
        );

        return;

    }


    editingProductId =
        product.id;


    const title =
        document.getElementById(
            "productModalTitle"
        );


    if (title) {

        title.textContent =
            "Edit Product";

    }


    document.getElementById(
        "productName"
    ).value =
        product.name || "";


    document.getElementById(
        "productDescription"
    ).value =
        product.description || "";


    document.getElementById(
        "productPrice"
    ).value =
        product.price || "";


    document.getElementById(
        "productStock"
    ).value =
        product.stock ?? 0;


    document.getElementById(
        "productSize"
    ).value =
        product.size || "";


    document.getElementById(
        "productColor"
    ).value =
        product.color || "";


    document.getElementById(
        "productCategory"
    ).value =
        product.category_id || "";


    document.getElementById(
        "productImage"
    ).value =
        product.image_url || "";


    document.getElementById(
        "productActive"
    ).checked =
        product.is_active !== false;


    const errorBox =
        document.getElementById(
            "formError"
        );


    if (errorBox) {

        errorBox.classList.add(
            "d-none"
        );

        errorBox.textContent =
            "";

    }


    if (!productModal) {

        productModal =
            new bootstrap.Modal(
                document.getElementById(
                    "productModal"
                )
            );

    }


    productModal.show();

}


// ============================================================
// SAVE PRODUCT
// ============================================================

async function saveProduct(
    event
) {

    event.preventDefault();


    const saveButton =
        document.getElementById(
            "saveProductButton"
        );


    const errorBox =
        document.getElementById(
            "formError"
        );


    if (errorBox) {

        errorBox.classList.add(
            "d-none"
        );

    }


    const productData = {

        name:
            document.getElementById(
                "productName"
            ).value.trim(),

        description:
            document.getElementById(
                "productDescription"
            ).value.trim() ||
            null,

        price:
            Number(
                document.getElementById(
                    "productPrice"
                ).value
            ),

        stock:
            Number(
                document.getElementById(
                    "productStock"
                ).value
            ),

        size:
            document.getElementById(
                "productSize"
            ).value.trim(),

        color:
            document.getElementById(
                "productColor"
            ).value.trim(),

        image_url:
            document.getElementById(
                "productImage"
            ).value.trim() ||
            null,

        category_id:
            Number(
                document.getElementById(
                    "productCategory"
                ).value
            )

    };


    // ========================================================
    // VALIDATION
    // ========================================================

    if (
        !productData.name ||
        !productData.size ||
        !productData.color ||
        !productData.category_id
    ) {

        showFormError(
            "Please fill all required fields."
        );

        return;

    }


    if (
        Number.isNaN(
            productData.price
        ) ||
        productData.price < 0
    ) {

        showFormError(
            "Please enter a valid price."
        );

        return;

    }


    if (
        Number.isNaN(
            productData.stock
        ) ||
        productData.stock < 0
    ) {

        showFormError(
            "Please enter a valid stock quantity."
        );

        return;

    }


    saveButton.disabled =
        true;


    saveButton.textContent =
        editingProductId
            ? "Updating..."
            : "Saving...";


    try {

        let response;


        // ====================================================
        // UPDATE
        // ====================================================

        if (
            editingProductId
        ) {

            response =
                await fetch(
                    `${API_URL}/products/${editingProductId}`,
                    {

                        method: "PUT",

                        headers:
                            getAuthHeaders(),

                        body:
                            JSON.stringify(
                                productData
                            )

                    }
                );

        }


        // ====================================================
        // CREATE
        // ====================================================

        else {

            response =
                await fetch(
                    `${API_URL}/products/`,
                    {

                        method: "POST",

                        headers:
                            getAuthHeaders(),

                        body:
                            JSON.stringify(
                                productData
                            )

                    }
                );

        }


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
                "Server returned an invalid response."
            );

        }


        if (!response.ok) {

            throw new Error(
                data.detail ||
                "Unable to save product."
            );

        }


        // ====================================================
        // SUCCESS
        // ====================================================

        if (productModal) {

            productModal.hide();

        }


        showMessage(
            editingProductId
                ? "Product updated successfully."
                : "Product created successfully.",
            "success"
        );


        editingProductId =
            null;


        await loadProducts();


    } catch (error) {

        console.error(
            "Save product error:",
            error
        );


        showFormError(
            error.message
        );


    } finally {

        saveButton.disabled =
            false;


        saveButton.textContent =
            "Save Product";

    }

}


// ============================================================
// SHOW FORM ERROR
// ============================================================

function showFormError(
    message
) {

    const errorBox =
        document.getElementById(
            "formError"
        );


    if (!errorBox) {

        return;

    }


    errorBox.textContent =
        message;


    errorBox.classList.remove(
        "d-none"
    );

}


// ============================================================
// TOGGLE PRODUCT STATUS
// ============================================================

async function toggleProductStatus(
    productId,
    currentStatus
) {

    const product =
        products.find(
            item =>
                Number(item.id) ===
                Number(productId)
        );


    if (!product) {

        return;

    }


    const newStatus =
        !currentStatus;


    const actionText =
        newStatus
            ? "activate"
            : "deactivate";


    const confirmed =
        confirm(
            `Are you sure you want to ${actionText} "${product.name}"?`
        );


    if (!confirmed) {

        return;

    }


    try {

        const productData = {

            name:
                product.name,

            description:
                product.description,

            price:
                Number(product.price),

            stock:
                Number(product.stock),

            size:
                product.size,

            color:
                product.color,

            image_url:
                product.image_url,

            category_id:
                Number(product.category_id)

        };


        // NOTE:
        // This uses the existing PUT endpoint.
        // Your backend must support is_active
        // in ProductCreate for status changes.

        productData.is_active =
            newStatus;


        const response =
            await fetch(
                `${API_URL}/products/${productId}`,
                {

                    method: "PUT",

                    headers:
                        getAuthHeaders(),

                    body:
                        JSON.stringify(
                            productData
                        )

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
                "Unable to update product status."
            );

        }


        showMessage(
            `Product ${newStatus
                ? "activated"
                : "deactivated"
            } successfully.`,
            "success"
        );


        await loadProducts();


    } catch (error) {

        console.error(
            "Status update error:",
            error
        );


        showMessage(
            error.message,
            "danger"
        );

    }

}


// ============================================================
// DELETE PRODUCT
// ============================================================

async function deleteProduct(
    productId
) {

    const product =
        products.find(
            item =>
                Number(item.id) ===
                Number(productId)
        );


    if (!product) {

        return;

    }


    const confirmed =
        confirm(
            `Are you sure you want to permanently delete "${product.name}"?`
        );


    if (!confirmed) {

        return;

    }


    try {

        const response =
            await fetch(
                `${API_URL}/products/${productId}`,
                {

                    method: "DELETE",

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
                "Unable to delete product."
            );

        }


        showMessage(
            "Product deleted successfully.",
            "success"
        );


        await loadProducts();


    } catch (error) {

        console.error(
            "Delete product error:",
            error
        );


        showMessage(
            error.message,
            "danger"
        );

    }

}


// ============================================================
// SETUP EVENTS
// ============================================================

function setupEvents() {

    // ========================================================
    // SIDEBAR
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
    // ADD PRODUCT BUTTON
    // ========================================================

    const addProductButton =
        document.getElementById(
            "addProductButton"
        );


    if (addProductButton) {

        addProductButton.addEventListener(
            "click",
            openAddProductModal
        );

    }


    // ========================================================
    // EMPTY ADD BUTTON
    // ========================================================

    const emptyAddProductButton =
        document.getElementById(
            "emptyAddProductButton"
        );


    if (emptyAddProductButton) {

        emptyAddProductButton.addEventListener(
            "click",
            openAddProductModal
        );

    }


    // ========================================================
    // PRODUCT FORM
    // ========================================================

    const productForm =
        document.getElementById(
            "productForm"
        );


    if (productForm) {

        productForm.addEventListener(
            "submit",
            saveProduct
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


        productModal =
            new bootstrap.Modal(
                document.getElementById(
                    "productModal"
                )
            );


        await loadProducts();

    }
);