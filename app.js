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
        .eq("is_active", true);

    if (error) {
        console.error(error);
        return;
    }

    const productsDiv = document.getElementById("products");

    if (!productsDiv) return;

    productsDiv.innerHTML = "";

    const groups = {
        "초월": [],
        "강림": [],
        "SS": [],
        "SSS": []
    };

    data.forEach(product => {

        if (product.name.startsWith("초월")) {
            groups["초월"].push(product);
        }
        else if (product.name.startsWith("강림")) {
            groups["강림"].push(product);
        }
        else if (product.name.startsWith("SSS")) {
            groups["SSS"].push(product);
        }
        else if (product.name.startsWith("SS")) {
            groups["SS"].push(product);
        }
    });

    Object.keys(groups).forEach(groupName => {

        if (groups[groupName].length === 0) return;

        productsDiv.innerHTML += `
            <div class="category-title">
                🐉 ${groupName}
            </div>

            <div class="category-grid" id="group-${groupName}">
            </div>
        `;

        const groupDiv =
            document.getElementById(`group-${groupName}`);

        groups[groupName].forEach(product => {

            groupDiv.innerHTML += `
                <div class="product-card">

                    <div class="product-image">
                        🐉
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
            `;
        });
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

window.addEventListener("DOMContentLoaded", () => {
    loadProducts();
});
