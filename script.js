const apiUrl = "http://127.0.0.1:8000/api";
let token = "";

// Giriş funksiyası
document.getElementById("login-btn").addEventListener("click", async () => {
    const adminLogin = document.getElementById("email").value;
    const adminPassword = document.getElementById("password").value;

    try {
        const response = await axios.post(`${apiUrl}/login`, {
            admin_login: adminLogin,
            admin_password: adminPassword,
        });
        token = response.data.token;

        alert("Uğurla daxil olundu!");

        document.getElementById("auth-section").style.display = "none";
        document.getElementById("logout-btn").style.display = "block";
        document.getElementById("products-section").style.display = "block";
        document.getElementById("categories-section").style.display = "block";
        document.getElementById("basket-section").style.display = "block";

        fetchProducts();
        fetchCategories();
        fetchBasket();
    } catch (error) {
        console.error("Error response:", error.response ? error.response.data : error);
        alert("Giriş zamanı xəta baş verdi: " + (error.response?.data?.message || error.message));
    }
});

// Çıxış funksiyası
document.getElementById("logout-btn").addEventListener("click", async () => {
    try {
        await axios.post(`${apiUrl}/logout`, {}, {
            headers: { Authorization: `Bearer ${token}` },
        });

        alert("Çıxış edildi!");
        token = "";
        location.reload();
    } catch (error) {
        console.error("Error response:", error.response ? error.response.data : error);
        alert("Çıxış zamanı xəta baş verdi.");
    }
});

// Məhsulları gətirmək
async function fetchProducts() {
    try {
        const response = await axios.get(`${apiUrl}/products`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        const products = response.data.data.data;

        const productList = document.getElementById("products-list");
        productList.innerHTML = "";

        products.forEach((product) => {
            const li = document.createElement("li");
            li.classList.add("list-group-item");
            li.textContent = `${product.product_name} - ${product.product_price} AZN`;

            const img = document.createElement("img");
            img.src = `http://127.0.0.1:8000/storage/${product.product_image}`;
            img.alt = product.product_name;
            img.classList.add("product-image");
            li.appendChild(img);

            const addButton = document.createElement("button");
            addButton.textContent = "Səbətə əlavə et";
            addButton.classList.add("btn", "btn-sm", "btn-success", "ms-2");
            addButton.addEventListener("click", () => addToBasket(product.id));
            li.appendChild(addButton);

            productList.appendChild(li);
        });
    } catch (error) {
        console.error("Xəta:", error.response ? error.response.data : error);
        alert("Məhsullar gətirilərkən xəta baş verdi.");
    }
}

// Kateqoriyaları gətirmək
async function fetchCategories() {
    try {
        const response = await axios.get(`${apiUrl}/categories`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        const categories = response.data.data;

        const categoryList = document.getElementById("categories-list");
        categoryList.innerHTML = "";

        categories.forEach((category) => {
            const li = document.createElement("li");
            li.classList.add("list-group-item");
            li.textContent = category.category_name;
            categoryList.appendChild(li);
        });
    } catch (error) {
        console.error("Xəta:", error.response ? error.response.data : error);
        alert("Kategoriyalar gətirilərkən xəta baş verdi.");
    }
}

// Səbətə əlavə et
async function addToBasket(productId) {
    try {
        // Məhsul sayını istə
        const productCount = prompt("Məhsul sayını daxil edin:");

        // Məhsul sayı düzgün deyil
        if (!productCount || isNaN(productCount) || productCount <= 0) {
            alert("Düzgün bir say daxil edin.");
            return;
        }

        // Sorğu göndər
        const response = await axios.patch(`${apiUrl}/products/basket/${productId}`, 
            {
                productcount: productCount, // Parametrlər
            }, 
            {
                headers: { Authorization: `Bearer ${token}` }, // Headerlər
            }
        );

        // Sorğu uğurla tamamlandıqda
        if (response.data.success) {
            alert("Məhsul səbətə əlavə edildi!");
            fetchBasket(); // Səbət məlumatını yenilə
        } else {
            alert("Xəta baş verdi: " + (response.data.message || "Naməlum xəta"));
        }
    } catch (error) {
        // Xəta ilə bağlı məlumat
        console.error("Error response:", error.response ? error.response.data : error);
        alert("Səbətə əlavə edərkən xəta baş verdi: " + (error.response?.data?.message || error.message));
    }
}


// Səbəti gətir
async function fetchBasket() {
    try {
        const response = await axios.get(`${apiUrl}/basket`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        const basketItems = response.data.data;

        const basketList = document.getElementById("basket-list");
        basketList.innerHTML = "";

        for (let item of basketItems) {
            const productResponse = await axios.get(`${apiUrl}/products/${item.product_id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const product = productResponse.data.data;
            const totalPrice = product.product_price * item.count;

            const li = document.createElement("li");
            li.classList.add("list-group-item");
            li.textContent = `${product.product_name} - Say: ${item.count} - ${totalPrice} AZN`;

            basketList.appendChild(li);
        }
    } catch (error) {
        console.error("Error response:", error.response ? error.response.data : error);
        alert("Səbət gətirilərkən xəta baş verdi.");
    }
}

// Səbəti təmizlə
document.getElementById("clear-basket-btn").addEventListener("click", async () => {
    try {
        await axios.post(`${apiUrl}/basket/clear`, {}, {
            headers: { Authorization: `Bearer ${token}` },
        });

        alert("Səbət təmizləndi!");
        fetchBasket();
    } catch (error) {
        console.error("Error response:", error.response ? error.response.data : error);
        alert("Səbəti təmizləyərkən xəta baş verdi.");
    }
});


// Sifarişi tamamla
document.getElementById("complete-order-btn").addEventListener("click", async () => {
    const customerName = document.getElementById("customer-name").value;
    const customerSurname = document.getElementById("customer-surname").value;
    const customerPhone = document.getElementById("customer-phone").value;
    const customerEmail = document.getElementById("customer-email").value;

    if (!customerName || !customerSurname || !customerPhone || !customerEmail) {
        alert("Bütün müştəri məlumatlarını doldurun.");
        return;
    }

    try {
        await axios.post(`${apiUrl}/basket/done`, {
            customer_name: customerName,
            customer_surname: customerSurname,
            customer_phone: customerPhone,
            customer_email: customerEmail,
        }, {
            headers: { Authorization: `Bearer ${token}` },
        });

        alert("Sifariş uğurla tamamlandı!");
        fetchBasket();
    } catch (error) {
        console.error("Error response:", error.response ? error.response.data : error);
        alert("Sifarişi tamamlamaq zamanı xəta baş verdi.");
    }
});