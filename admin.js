const apiUrl = 'http://127.0.0.1:8000/api';
let token = "";

// Login funksiyası
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
        document.getElementById("orderTable").style.display = "block";
        document.getElementById("orderTableBody").style.display = "block";
        document.getElementById("orderItemTable").style.display = "block";
        document.querySelector(".addproductde").style.display = "block";
        document.querySelector(".addproductde1").style.display = "block";
        document.getElementById("products-section").style.display = "block";
        document.querySelector(".addproductde2").style.display = "block";

        fetchProducts();
        fetchOrders();
        fetchOrderItems();
    } catch (error) {
        console.error("Error response:", error.response ? error.response.data : error);
        alert("Giriş zamanı xəta baş verdi: " + (error.response?.data?.message || error.message));
    }
});

// Sifarişləri fetch etmək
async function fetchOrders() {
    try {
        const response = await axios.get(`${apiUrl}/order`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        const orders = response.data.data; // `response.data` ilə işləyirik

        const orderTableBody = document.getElementById('orderTableBody');
        orderTableBody.innerHTML = ''; // Əvvəlki məlumatları təmizləyirik

        orders.forEach(order => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${order.id}</td>
                <td>${order.customer_name}</td>
                <td>${order.customer_surname}</td>
                <td>${order.customer_email}</td>
                <td>${order.customer_phone}</td>
                <td>${order.order_total}</td>
                <td>${order.order_date}</td>
                <td>${order.order_status === 1 ? 'Təsdiqlənib' : 'Gözləyir'}</td>
                <td><button class="button1" onclick="confirmOrder(${order.id})">Təsdiqlə</button></td>
                <td><button class="button2" onclick="deleteOrder(${order.id})">Sil</button></td>
            `;
            orderTableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Sifarişləri alarkən xəta baş verdi:', error);
        alert('Sifarişləri alarkən xəta baş verdi!');
    }
}

// Sifariş elementlərini fetch etmək
async function fetchOrderItems() {
    try {
        const response = await axios.get(`${apiUrl}/orderItem`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        const orderItems = response.data.data; // `response.data` ilə işləyirik
        const orderItemTableBody = document.getElementById('orderItemTableBody');
        orderItemTableBody.innerHTML = ''; // Əvvəlki məlumatları təmizləyirik

        orderItems.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.order_id}</td>
                <td>${item.product_id}</td>
                <td>${item.count}</td>
            `;
            orderItemTableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Sifariş elementlərini alarkən xəta baş verdi:', error);
        alert('Sifariş elementlərini alarkən xəta baş verdi!');
    }
}

// Sifarişi təsdiqləmək
async function confirmOrder(orderId) {
    try {
        const response = await axios.patch(`${apiUrl}/order/done/${orderId}`, {}, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
            alert('Sifariş təsdiqləndi!');
            fetchOrders(); // Sifarişləri yeniləyirik
        } else {
            alert('Xəta baş verdi. Sifariş təsdiqlənmədi.');
        }
    } catch (error) {
        console.error('Sifariş təsdiqləyərkən xəta baş verdi:', error);
        alert('Sifariş təsdiqləyərkən xəta baş verdi.');
    }
}

async function deleteOrder(orderId) {
    try {
        const response = await axios.delete(`${apiUrl}/order/${orderId}`, {}, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
            alert('Sifariş silindi!');
            fetchOrders();
            fetchOrderItems();
        } else {
            alert('Xəta baş verdi. Sifariş silinmedi.');
        }
    } catch (error) {
        console.error('Sifariş silinerken xəta baş verdi:', error);
        alert('Sifariş silinerken xəta baş verdi.');
    }
}


document.getElementById('addProductForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    // Form məlumatlarını topla
    const formData = new FormData();
    formData.append('product_name', document.getElementById('product_name').value);
    formData.append('product_price', document.getElementById('product_price').value);
    formData.append('product_category', document.getElementById('product_category').value);
    formData.append('product_about', document.getElementById('product_about').value);
    
    
    // Şəkil varsa əlavə et
    const imageFile = document.getElementById('product_image').files[0];
    if (imageFile) {
        formData.append('product_image', imageFile);
    }

    try {
        const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
        const response = await axios.post('http://127.0.0.1:8000/api/products', formData, {
            headers: {
                'X-CSRF-TOKEN': csrfToken,
                'Content-Type': 'multipart/form-data',
            }
        });

        if (response.data.success) {
            alert('Məhsul uğurla əlavə olundu!');
            fetchProducts();
        } else {
            alert('Xəta baş verdi: ' + response.data.message);
        }
    } catch (error) {
        console.error('API sorğusu zamanı xəta baş verdi:', error);
        alert('Xəta baş verdi.');
    }
});


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
            addButton.textContent = "Mehsulu sil";
            addButton.classList.add("btn", "btn-sm", "btn-danger", "ms-2");
            addButton.addEventListener("click", () => deleteProduct(product.id));
            li.appendChild(addButton);

            productList.appendChild(li);
        });
    } catch (error) {
        console.error("Xəta:", error.response ? error.response.data : error);
        alert("Məhsullar gətirilərkən xəta baş verdi.");
    }
}

async function deleteProduct(productId) {
    try {
        

        // Sorğu göndər
        const response = await axios.delete(`${apiUrl}/products/${productId}`, 
            {
                headers: { Authorization: `Bearer ${token}` }, // Headerlər
            }
        );

        // Sorğu uğurla tamamlandıqda
        if (response.data.success) {
            alert("Silindi!");
            fetchProducts();
        } else {
            alert("Xəta baş verdi: " + (response.data.message || "Naməlum xəta"));
        }
    } catch (error) {
        // Xəta ilə bağlı məlumat
        console.error("Error response:", error.response ? error.response.data : error);
        alert("Silerken xəta baş verdi: " + (error.response?.data?.message || error.message));
    }
}

// Sayfa yükləndikdə məlumatları yükləyirik
window.onload = function() {
    // Əgər token varsa, sifarişləri yükləyirik
    if (token) {
        fetchOrders();
        fetchOrderItems();
    }
};
