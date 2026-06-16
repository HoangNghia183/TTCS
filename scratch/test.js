import fs from 'fs';

async function run() {
    try {
        fs.writeFileSync('dummy.png', 'fake image content');
        
        // Node 18+ has native FormData and Blob
        const form = new FormData();
        form.append('name', 'Sống Đời Rủng Rỉnh Thong Dong - Quán Xuyến Chuyện Tiền Nong, Hướng Về An Tâm Tài Chính');
        form.append('description', 'Tài chính cá nhân cần được xuất phát từ...');
        form.append('price', '179000');
        form.append('originalPrice', '150000');
        form.append('stock', '120');
        form.append('category', '69e426cd2d7219766e9b44c5');
        form.append('specifications', JSON.stringify({ author: "Lê Hoàng Linh", publisher: "NXB Thế giới" }));
        
        const blob = new Blob([fs.readFileSync('dummy.png')], { type: 'image/png' });
        form.append('images', blob, 'dummy.png');
        
        console.log('Sending request...');
        const res = await fetch('http://localhost:5001/api/products', {
            method: 'POST',
            body: form
        });
        
        const data = await res.json();
        console.log('Status:', res.status);
        console.log('Response:', data);
    } catch (err) {
        if (err.response) {
            console.error('Error:', err.response.status, err.response.data);
        } else {
            console.error('Crash error:', err);
        }
    }
}
run();
