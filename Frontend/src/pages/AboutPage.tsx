import { Link } from "react-router";

const team = [
    {
        name: "Hoàng Minh Nghĩa",
        role: "Founder",
        emoji: "🧑‍💼",
        desc: "Người sáng lập BookStore, đam mê đọc sách và chia sẻ tri thức từ thuở nhỏ.",
    },
    {
        name: "Vũ Huy Hoàng",
        role: "Co-Founder",
        emoji: "🧑‍💻",
        desc: "Đồng sáng lập BookStore, chung tay xây dựng nền tảng BookStore từ con số 0.",
    },
];

const milestones = [
    { year: "02/2026", title: "Thành lập", desc: "Đội ngũ BookStore ra đời tại TP. Hà Nội chỉ với 2 thành viên sáng lập." },
    { year: "04/2026", title: "Chính thức hoạt động", desc: "Cột mốc đầu tiên — BookStore chính thức hoạt động." },
];

const values = [
    { emoji: "❤️", title: "Tri Thức", desc: "Mỗi quyển sách là một kho tàng vô giá – chúng tôi trân trọng từng trang sách." },
    { emoji: "🛡️", title: "Bản Quyền", desc: "Cam kết 100% sách thật, có bản quyền, đồng hành cùng tác giả và NXB." },
    { emoji: "🌱", title: "Bền Vững", desc: "Sử dụng vật liệu đóng gói thân thiện, giảm rác thải nhựa." },
    { emoji: "🤝", title: "Cộng Đồng", desc: "Xây dựng cộng đồng yêu sách, khuyến khích văn hóa đọc mọi lứa tuổi." },
];

const AboutPage = () => {
    return (
        <div className="overflow-x-hidden">

            {/* ── HERO ── */}
            <section className="relative min-h-[55vh] flex items-center overflow-hidden bg-gradient-to-br from-[var(--pet-coral)]/90 via-[var(--pet-mint)]/70 to-[var(--pet-warm)]/80">
                {/* Background pattern */}
                <div
                    className="absolute inset-0 opacity-[0.06]"
                    style={{
                        backgroundImage:
                            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
                    }}
                />
                {/* Floating emojis */}
                <div className="absolute top-10 right-16 text-6xl animate-float opacity-80 select-none hidden md:block">📖</div>
                <div className="absolute bottom-10 right-1/3 text-5xl animate-float-slow opacity-60 select-none hidden lg:block">📚</div>
                <div className="absolute top-1/3 left-10 text-4xl animate-float opacity-50 select-none hidden md:block">🖊️</div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center w-full">
                    <div className="inline-flex items-center gap-2 bg-white/25 backdrop-blur-sm border border-white/40 text-white text-sm font-semibold px-4 py-2 rounded-full mb-6">
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        Câu chuyện của chúng tôi
                    </div>
                    <h1
                        className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-5"
                        style={{ fontFamily: "'Nunito', sans-serif" }}
                    >
                        Về <span className="text-white/80 underline decoration-wavy decoration-white/50">BookStore</span> 📚
                    </h1>
                    <p className="text-lg text-white/85 max-w-2xl mx-auto leading-relaxed">
                        Chúng tôi tin rằng mỗi người đều xứng đáng có một cuốn sách hay.
                        BookStore ra đời từ niềm đam mê đọc sách và sứ mệnh kết nối người đọc với những tác phẩm giá trị nhất.
                    </p>
                </div>

                {/* Bottom curve */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 60L1440 60L1440 20C1200 60 240 -10 0 20L0 60Z" className="fill-background" />
                    </svg>
                </div>
            </section>

            {/* ── MISSION ── */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--pet-coral)] mb-3">Sứ mệnh</p>
                        <h2 className="text-3xl md:text-4xl font-black text-foreground mb-5" style={{ fontFamily: "'Nunito', sans-serif" }}>
                            Trao gửi tri thức — <br />
                            <span className="gradient-text">đánh thức đam mê</span>
                        </h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            BookStore được thành lập năm 2019 với một sứ mệnh đơn giản: giúp mọi người tìm được cuốn sách yêu thích
                            một cách nhanh chóng, tiện lợi và đầy cảm hứng.
                        </p>
                        <p className="text-muted-foreground leading-relaxed">
                            Chúng tôi hợp tác định hướng trải nghiệm người đọc với các nhà xuất bản hàng đầu,
                            đảm bảo mỗi ấn bản đều đạt chuẩn cao nhất trước khi đến bàn tay người yêu sách.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { value: "10,000+", label: "Độc giả tin tưởng", emoji: "🏠" },
                            { value: "50,000+", label: "Tựa sách đa dạng", emoji: "📚" },
                            { value: "Chất lượng", label: "Phục vụ cộng đồng", emoji: "⭐" },
                            { value: "63", label: "Tỉnh thành phủ sóng", emoji: "🗺️" },
                        ].map((s) => (
                            <div key={s.label} className="bg-muted/50 dark:bg-muted/20 border border-border rounded-2xl p-5 text-center hover:shadow-md transition-shadow">
                                <div className="text-3xl mb-2">{s.emoji}</div>
                                <div className="text-2xl font-black text-foreground" style={{ fontFamily: "'Nunito', sans-serif" }}>{s.value}</div>
                                <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── VALUES ── */}
            <section className="bg-muted/40 dark:bg-muted/20 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10">
                        <h2 className="section-title">Giá Trị Cốt Lõi</h2>
                        <p className="text-sm text-muted-foreground mt-1">Những điều chúng tôi tin tưởng và sống theo mỗi ngày</p>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {values.map((v) => (
                            <div key={v.title} className="bg-background border border-border rounded-2xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                                <div className="text-4xl mb-3">{v.emoji}</div>
                                <h3 className="font-bold text-foreground mb-2" style={{ fontFamily: "'Nunito', sans-serif" }}>{v.title}</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed">{v.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── TIMELINE ── */}
            <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-10">
                    <h2 className="section-title">Hành Trình Phát Triển</h2>
                    <p className="text-sm text-muted-foreground mt-1">Từ một ý tưởng nhỏ đến pet shop #1 Việt Nam</p>
                </div>
                <div className="relative">
                    {/* Vertical line */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border -translate-x-1/2 hidden md:block" />
                    <div className="flex flex-col gap-8">
                        {milestones.map((m, i) => (
                            <div key={m.year} className={`flex items-center gap-6 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
                                <div className={`flex-1 ${i % 2 === 0 ? "md:text-right" : "md:text-left"}`}>
                                    <div className="bg-background border border-border rounded-2xl p-5 hover:shadow-md transition-shadow inline-block w-full">
                                        <p className="text-xs font-bold text-[var(--pet-coral)] uppercase tracking-widest mb-1">{m.year}</p>
                                        <h3 className="font-black text-foreground text-lg" style={{ fontFamily: "'Nunito', sans-serif" }}>{m.title}</h3>
                                        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{m.desc}</p>
                                    </div>
                                </div>
                                {/* Dot */}
                                <div className="shrink-0 w-10 h-10 rounded-full bg-[var(--pet-coral)] flex items-center justify-center text-white font-black text-sm z-10 shadow-md hidden md:flex">
                                    {i + 1}
                                </div>
                                <div className="flex-1 hidden md:block" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── TEAM ── */}
            <section className="bg-muted/40 dark:bg-muted/20 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10">
                        <h2 className="section-title">Đội Ngũ Của Chúng Tôi</h2>
                        <p className="text-sm text-muted-foreground mt-1">Những con người đứng sau BookStore</p>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
                        {team.map((t) => (
                            <div key={t.name} className="bg-background border border-border rounded-2xl p-6 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                                <div className="text-5xl mb-3">{t.emoji}</div>
                                <h3 className="font-bold text-foreground" style={{ fontFamily: "'Nunito', sans-serif" }}>{t.name}</h3>
                                <p className="text-xs font-semibold text-[var(--pet-coral)] mb-2">{t.role}</p>
                                <p className="text-xs text-muted-foreground leading-relaxed">{t.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="rounded-3xl bg-gradient-to-r from-[var(--pet-coral)] to-[var(--pet-mint)] p-10 md:p-14 text-center relative overflow-hidden">
                    <div className="absolute top-4 right-8 text-5xl opacity-20 select-none">📖</div>
                    <div className="absolute bottom-4 left-8 text-4xl opacity-15 select-none">📚</div>
                    <h2 className="text-3xl md:text-4xl font-black text-white mb-4" style={{ fontFamily: "'Nunito', sans-serif" }}>
                        Sẵn sàng tìm người bạn đồng hành? 📚
                    </h2>
                    <p className="text-white/80 mb-8 max-w-xl mx-auto">
                        Hàng ngàn tựa sách hấp dẫn đang chờ được khám phá. Tìm ngay cuốn sách yêu thích của bạn!
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link
                            to="/shop"
                            className="bg-white text-[var(--pet-coral)] font-bold px-8 py-3.5 rounded-2xl hover:bg-[var(--pet-warm)] hover:text-foreground hover:-translate-y-1 transition-all duration-300 shadow-xl"
                        >
                            🔍 Khám Phá Ngay
                        </Link>
                        <Link
                            to="/"
                            className="border-2 border-white/60 text-white font-bold px-8 py-3.5 rounded-2xl hover:bg-white/20 hover:-translate-y-1 transition-all duration-300"
                        >
                            🏠 Về Trang Chủ
                        </Link>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default AboutPage;
