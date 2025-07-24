import Navbar from "@/components/ui/Navbar"

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            <Navbar />
            <div>{children}</div>
        </>
    )
}