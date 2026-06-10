import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import api from "@/lib/axios";
import { formatCurrency } from "@/utils/format";

interface RevenueDaily {
  day: string;
  revenue: number;
}

const RevenuePage = () => {
  const [revenue, setRevenue] = useState<RevenueDaily[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [beginDay, setBeginDay] = useState("");
  const [endDay, setEndDay] = useState("");

  const getDefaultDates = () => {
    const now = new Date();
    const begin = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return {
      begin: begin.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    };
  };

  useEffect(() => {
    const defaults = getDefaultDates();
    setBeginDay(defaults.begin);
    setEndDay(defaults.end);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (beginDay) params.append('beginDay', beginDay);
      if (endDay) params.append('endDay', endDay);
      
      const res = await api.get(`/admin/revenue?${params.toString()}`);
      console.log(params.toString());
      console.log(res.data);
      const dailyData = res.data.revenueDaily.map((value: any) => ({
        day: value._id,
        revenue: value.total
      }));
      
      setRevenue(dailyData);
      setTotalRevenue(res.data.revenueMonth);
    } catch (error) {
      console.error("Error loading revenue:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (beginDay && endDay) {
      loadData();
    }
  }, [beginDay, endDay]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header and Filters */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="section-title">💰 Doanh Thu</h1>
      </div>

      {/* Date Range Selector */}
      <div className="bg-white dark:bg-card rounded-2xl border border-border p-5">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-semibold mb-2 text-foreground">
              Ngày bắt đầu
            </label>
            <input
              type="date"
              value={beginDay}
              onChange={(e) => setBeginDay(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-white dark:bg-card text-sm focus:outline-none focus:ring-2 focus:ring-[var(--pet-coral)]/40"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-semibold mb-2 text-foreground">
              Ngày kết thúc
            </label>
            <input
              type="date"
              value={endDay}
              onChange={(e) => setEndDay(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-white dark:bg-card text-sm focus:outline-none focus:ring-2 focus:ring-[var(--pet-coral)]/40"
            />
          </div>
        </div>
      </div>

      {/* Total Revenue Display */}
      <div className="bg-white dark:bg-card rounded-2xl border border-border p-5 md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground mb-1">
              Tổng doanh thu
            </h2>
            <p className="text-3xl md:text-4xl font-bold text-[var(--pet-coral)]">
              {loading ? "..." : formatCurrency(totalRevenue)}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Từ {beginDay} đến {endDay}
            </p>
          </div>
          <div className="text-5xl opacity-20">💰</div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white dark:bg-card rounded-2xl border border-border p-5">
        <h2 className="font-bold mb-4">Doanh thu theo ngày</h2>
        {loading ? (
          <div className="h-80 flex items-center justify-center text-muted-foreground">
            Đang tải dữ liệu...
          </div>
        ) : revenue.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={revenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="day" 
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis />
              <Tooltip
                formatter={(value) => [
                  new Intl.NumberFormat('vi-VN', { 
                    style: 'currency', 
                    currency: 'VND' 
                  }).format(Number(value ?? 0)), 
                  "Doanh thu"
                ]}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="var(--pet-coral)"
                strokeWidth={2}
                dot={{ fill: "var(--pet-coral)", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-80 flex items-center justify-center text-muted-foreground">
            Không có dữ liệu doanh thu
          </div>
        )}
      </div>
    </div>
  );
};

export default RevenuePage;