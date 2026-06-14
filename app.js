async function getCurrentUser() {
    const {
        data: { user }
    } = await supabaseClient.auth.getUser();

    if (!user) {
        location.href = "login.html";
        return null;
    }

    return user;
}

function formatNumber(num) {
    return Number(num).toLocaleString();
}
async function loadProducts() {

    const { data, error } = await supabaseClient
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("price");

    if (error) {
        console.error(error);
        return;
    }

    const productsDiv = document.getElementById("products");

    productsDiv.innerHTML = "";

    data.forEach(product => {

        productsDiv.innerHTML += `
            <button>
                ${product.name}
                (${Number(product.price).toLocaleString()}P)
            </button>
            <br><br>
        `;
    });
}
