import './aurora.css' // 👈 เพิ่ม css custom ด้านล่างไว้ใช้

export default function DashboardLayout({
    children
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-black relative overflow-hidden text-white">
            {/* Aurora background */}
            <div className="aurora z-0" />

            {/* Content overlay */}
            <div className="relative z-10 p-6">
                {children}
            </div>
        </div>
    )
}
