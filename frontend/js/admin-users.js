// ============================================================
// KAPRA ADMIN USERS
// ============================================================

const API_URL = window.location.origin;

let users = [];


// ============================================================
// GET TOKEN
// ============================================================

function getToken() {

    return localStorage.getItem(
        "access_token"
    );

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
            "Authentication error:",
            error
        );

        return false;

    }

}


// ============================================================
// LOAD USERS
// ============================================================

async function loadUsers() {

    const loading =
        document.getElementById(
            "usersLoading"
        );

    const tableWrapper =
        document.getElementById(
            "usersTableWrapper"
        );

    const noUsers =
        document.getElementById(
            "noUsers"
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


    if (noUsers) {

        noUsers.classList.add(
            "d-none"
        );

    }


    try {

        const token =
            getToken();


        const response =
            await fetch(
                `${API_URL}/users/`,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
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
                "Unable to load users."
            );

        }


        users =
            Array.isArray(data)
                ? data
                : [];


        console.log(
            "Admin users:",
            users
        );


        updateUserSummary(
            users
        );


        displayUsers(
            users
        );


    } catch (error) {

        console.error(
            "Load users error:",
            error
        );


        showMessage(
            error.message,
            "danger"
        );


        updateUserSummary([]);


        displayUsers([]);


    } finally {

        if (loading) {

            loading.classList.add(
                "d-none"
            );

        }

    }

}


// ============================================================
// UPDATE SUMMARY
// ============================================================

function updateUserSummary(
    userList
) {

    const totalUsers =
        document.getElementById(
            "totalUsers"
        );


    const totalCustomers =
        document.getElementById(
            "totalCustomers"
        );


    const totalAdmins =
        document.getElementById(
            "totalAdmins"
        );


    const customers =
        userList.filter(
            user =>
                String(
                    user.role
                ).toLowerCase() ===
                "customer"
        ).length;


    const admins =
        userList.filter(
            user =>
                String(
                    user.role
                ).toLowerCase() ===
                "admin"
        ).length;


    if (totalUsers) {

        totalUsers.textContent =
            userList.length;

    }


    if (totalCustomers) {

        totalCustomers.textContent =
            customers;

    }


    if (totalAdmins) {

        totalAdmins.textContent =
            admins;

    }

}


// ============================================================
// DISPLAY USERS
// ============================================================

function displayUsers(
    userList
) {

    const tableBody =
        document.getElementById(
            "usersTableBody"
        );


    const tableWrapper =
        document.getElementById(
            "usersTableWrapper"
        );


    const noUsers =
        document.getElementById(
            "noUsers"
        );


    if (!tableBody) {

        return;

    }


    tableBody.innerHTML = "";


    if (
        !userList ||
        userList.length === 0
    ) {

        if (tableWrapper) {

            tableWrapper.classList.add(
                "d-none"
            );

        }


        if (noUsers) {

            noUsers.classList.remove(
                "d-none"
            );

        }

        return;

    }


    if (noUsers) {

        noUsers.classList.add(
            "d-none"
        );

    }


    if (tableWrapper) {

        tableWrapper.classList.remove(
            "d-none"
        );

    }


    userList.forEach(
        user => {

            const row =
                document.createElement(
                    "tr"
                );


            const role =
                String(
                    user.role ||
                    "customer"
                ).toLowerCase();


            const roleClass =
                role === "admin"
                    ? "admin-user-role-admin"
                    : "admin-user-role-customer";


            const roleText =
                role.charAt(0).toUpperCase() +
                role.slice(1);


            const formattedDate =
                formatDate(
                    user.created_at
                );


            row.innerHTML = `

                <td>

                    <span
                        class="admin-user-id"
                    >

                        #${user.id}

                    </span>

                </td>


                <td>

                    <span
                        class="admin-user-name"
                    >

                        ${escapeHTML(
                            user.name
                        )}

                    </span>

                </td>


                <td>

                    <span
                        class="admin-user-email"
                    >

                        ${escapeHTML(
                            user.email
                        )}

                    </span>

                </td>


                <td>

                    <span
                        class="admin-user-role ${roleClass}"
                    >

                        ${roleText}

                    </span>

                </td>


                <td>

                    <span
                        class="admin-user-date"
                    >

                        ${formattedDate}

                    </span>

                </td>

            `;


            tableBody.appendChild(
                row
            );

        }
    );

}


// ============================================================
// FORMAT DATE
// ============================================================

function formatDate(
    dateValue
) {

    if (!dateValue) {

        return "N/A";

    }


    const date =
        new Date(
            dateValue
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "N/A";

    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHTML(
    value
) {

    return String(value ?? "")
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
// SHOW MESSAGE
// ============================================================

function showMessage(
    message,
    type = "success"
) {

    const messageBox =
        document.getElementById(
            "userMessage"
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

    // --------------------------------------------------------
    // Sidebar
    // --------------------------------------------------------

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


    // --------------------------------------------------------
    // Logout
    // --------------------------------------------------------

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


    // --------------------------------------------------------
    // Refresh
    // --------------------------------------------------------

    const refreshButton =
        document.getElementById(
            "refreshUsersButton"
        );


    if (refreshButton) {

        refreshButton.addEventListener(
            "click",
            async function () {

                await loadUsers();

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

        await loadUsers();

    }
);