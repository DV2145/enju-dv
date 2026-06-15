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
        .order("id");

    if (error) {
        console.error(error);
        return;
    }

    const productsDiv = document.getElementById("products");

    if (!productsDiv) return;

    productsDiv.innerHTML = "";

    const categories = {
        "초월": [],
        "강림": [],
        "SS": [],
        "SSS": []
    };

    data.forEach(product => {

        if (product.name.startsWith("초월")) {
            categories["초월"].push(product);
        }
        else if (product.name.startsWith("강림")) {
            categories["강림"].push(product);
        }
        else if (product.name.startsWith("SSS")) {
            categories["SSS"].push(product);
        }
        else if (product.name.startsWith("SS")) {
            categories["SS"].push(product);
        }

    });

    for (const category in categories) {

        if (categories[category].length === 0) continue;

        let image = "leo.png";

        if (category === "강림") {
            image = "tilki.png";
        }
        else if (category === "SS") {
            image = "nello.png";
        }
        else if (category === "SSS") {
            image = "hellkaiser.png";
        }

        productsDiv.innerHTML += `
            <h3 class="category-title">🐉 ${category}</h3>

            <div class="category-grid">

                ${categories[category].map(product => `

                    <div class="product-card">

                        <div class="product-image">
                            <img src="${image}">
                        </div>

                        <div class="product-name">
                            ${product.name}
                        </div>

                        <div class="product-price">
                            ${Number(product.price).toLocaleString()}P
                        </div>

                        <button onclick="createOrder(${product.id})">
                            신청하기
                        </button>

                    </div>

                `).join("")}

            </div>
        `;
    }
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

window.addEventListener("DOMContentLoaded", () => {
    loadProducts();
});
