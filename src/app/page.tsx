import { Features } from "@/components/landing/features";
import { Footer } from "@/components/landing/footer";
import { Header } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { Templates } from "@/components/landing/templates";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-white">
            <Header />
            <main>
                <Hero />
                <Features />
                <Templates />
            </main>
            <Footer />
        </div>
    );
}
