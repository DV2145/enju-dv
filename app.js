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

    if (!productsDiv) return;

    productsDiv.innerHTML = "";

    data.forEach(product => {

        productsDiv.innerHTML += `
            <button onclick="createOrder(${product.id})">
                ${product.name}
                (${Number(product.price).toLocaleString()}P)
            </button>
            <br><br>
        `;
    });
}

async function createOrder(productId) {

    const user = await getCurrentUser();

    const { data: product } = await supabaseClient
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();

    const { data: profile } = await supabaseClient
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    if (profile.points < product.price) {
        alert("포인트가 부족합니다.");
        return;
    }

    const newPoint = profile.points - product.price;

    await supabaseClient
        .from("orders")
        .insert({
            user_id: user.id,
            nickname: profile.nickname,
            product_name: product.name,
            product_price: product.price,
            status: "대기중"
        });

    await supabaseClient
        .from("profiles")
        .update({
            points: newPoint
        })
        .eq("id", user.id);

    alert("신청 완료!");

    location.reload();
}

window.loadProducts = loadProducts;
window.createOrder = createOrder;

loadProducts();
