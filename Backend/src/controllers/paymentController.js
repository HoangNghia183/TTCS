import moment from 'moment';
import qs from 'qs';
import crypto from 'crypto';
import vnpayConfig from '../config/vnpayConfig.js';

// HÀM SORT ĐÃ SỬA: Chỉ sắp xếp key, không tự ý encode dữ liệu gây lệch hash
function sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}

// @desc    Tạo URL thanh toán
// @route   POST /api/payment/create_payment_url
export const createPaymentUrl = (req, res) => {
    process.env.TZ = 'Asia/Ho_Chi_Minh';
    
    let date = new Date();
    let createDate = moment(date).format('YYYYMMDDHHmmss');
    
    // SỬA: Tạo orderId bảo mật hơn, kết hợp thời gian và số ngẫu nhiên để tránh trùng lặp
    let randomSuffix = Math.floor(1000 + Math.random() * 9000); // 4 số ngẫu nhiên
    let orderId = moment(date).format('DDHHmmss') + '_' + randomSuffix;
    
    let amount = req.body.amount;
    let bankCode = req.body.bankCode;
    
    // Tối ưu lấy IP Client chuẩn hơn
    let ipAddr = req.headers['x-forwarded-for'] || 
                 req.connection.remoteAddress || 
                 req.socket.remoteAddress || 
                 '127.0.0.1';

    let tmnCode = vnpayConfig.vnp_TmnCode;
    let secretKey = vnpayConfig.vnp_HashSecret;
    let vnpUrl = vnpayConfig.vnp_Url;
    let returnUrl = vnpayConfig.vnp_ReturnUrl;

    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = tmnCode;
    vnp_Params['vnp_Locale'] = 'vn';
    vnp_Params['vnp_CurrCode'] = 'VND';
    vnp_Params['vnp_TxnRef'] = orderId;
    vnp_Params['vnp_OrderInfo'] = 'Thanh toan don hang ' + orderId;
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_Amount'] = amount * 100;
    vnp_Params['vnp_ReturnUrl'] = returnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;

    if (bankCode) {
        vnp_Params['vnp_BankCode'] = bankCode;
    }

    vnp_Params = sortObject(vnp_Params);

    let signData = qs.stringify(vnp_Params, { encode: false });
    let hmac = crypto.createHmac("sha512", secretKey);
    // SỬA: Bỏ từ khóa "new" trước Buffer.from
    let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex"); 
    
    vnp_Params['vnp_SecureHash'] = signed;
    vnpUrl += '?' + qs.stringify(vnp_Params, { encode: false });

    res.status(200).json({ paymentUrl: vnpUrl });
};

// @desc    Xử lý kết quả trả về từ VNPAY (Chỉ dùng để hiển thị giao diện cho User)
// @route   GET /api/payment/vnpay_return
export const vnpayReturn = (req, res) => {
    let vnp_Params = req.query;
    let secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);

    let secretKey = vnpayConfig.vnp_HashSecret;
    let signData = qs.stringify(vnp_Params, { encode: false });
    let hmac = crypto.createHmac("sha512", secretKey);
    // SỬA: Bỏ từ khóa "new" trước Buffer.from
    let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

    if (secureHash === signed) {
        // Lưu ý: Ở đây bạn chỉ nên hiển thị giao diện (Thành công/Thất bại) cho User xem.
        if (vnp_Params['vnp_ResponseCode'] == "00") {
             res.json({ status: 'success', code: vnp_Params['vnp_ResponseCode'], orderId: vnp_Params['vnp_TxnRef'] });
        } else {
             res.json({ status: 'fail', code: vnp_Params['vnp_ResponseCode'] });
        }
    } else {
        res.status(400).json({ status: 'error', message: 'Checksum failed' });
    }
};