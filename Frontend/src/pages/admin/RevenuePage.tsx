import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { useState,useEffect } from "react";
import api from "@/lib/axios";
// 1. Định nghĩa Type cho cấu trúc của từng phần tử dữ liệu
interface RevenueData {
  revenueMonth:Number,
  revenueDaily:[{
    _id:string,
    total:Number
  }]
}
interface RevenueDaily{
  day:string,
  revenue:Number
}

// 3. Khai báo Component với kiểu dữ liệu trả về là React.ReactElement hoặc định danh tường minh
function RevenuePage(): React.ReactElement {
  const [revenue,setRevenue] = useState<RevenueDaily[]>([]);
  const loadData = async ()=>{
    const res = await api.get(`/admin/revenue`);
    const da = res.data.revenueDaily.map((value:any)=>{
      return{
        day:value._id,
        revenue:value.total
      }
    })
    // console.log(da);
    setRevenue(da)
  }
  useEffect(()=>{
    loadData();
  },[])
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={revenue}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="day" />
        <YAxis />
        <Tooltip 
          // Định dạng lại hiển thị VNĐ cho Tooltip khi hover (Tùy chọn, giúp biểu đồ chuyên nghiệp hơn)
          formatter={(value) => [new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value ?? 0)), "Doanh thu"]}
        />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#8884d8"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default RevenuePage;