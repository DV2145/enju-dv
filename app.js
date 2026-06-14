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
