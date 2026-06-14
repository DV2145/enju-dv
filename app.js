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
    <button onclick="createOrder('${product.name}', ${product.price})">
        ${product.name}
        (${Number(product.price).toLocaleString()}P)
    </button>
    <br><br>

`;
        });
    }
window.loadProducts = loadProducts;

async function createOrder(productName, productPrice) {

    const user = await getCurrentUser();

    const { data: profile } = await supabaseClient
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    if (profile.points < productPrice) {
        alert("포인트가 부족합니다.");
        return;
    }

    const newPoint = profile.points - productPrice;

    await supabaseClient
        .from("orders")
        .insert({
            user_id: user.id,
            nickname: profile.nickname,
            product_name: productName,
            product_price: productPrice,
            status: "대기중"
        });

    await supabaseClient
        .from("profiles")
        .update({ points: newPoint })
        .eq("id", user.id);

    alert("신청 완료!");

    location.reload();
}

window.loadProducts = loadProducts;

console.log("createOrder 등록 전");

async function createOrder(productName, productPrice) {

    const user = await getCurrentUser();

    const { data: profile } = await supabaseClient
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    if (profile.points < productPrice) {
        alert("포인트가 부족합니다.");
        return;
    }

    const newPoint = profile.points - productPrice;

    await supabaseClient
        .from("orders")
        .insert({
            user_id: user.id,
            nickname: profile.nickname,
            product_name: productName,
            product_price: productPrice,
            status: "대기중"
        });

    await supabaseClient
        .from("profiles")
        .update({ points: newPoint })
        .eq("id", user.id);

    alert("신청 완료!");
    location.reload();
}

window.createOrder = createOrder;

console.log("createOrder 등록 완료");
