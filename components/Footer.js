import { useState } from "react";
import ContactModal from "./ContactModal";

export default function Footer() {
    const [showModal, setShowModal] = useState(false);

    return (
        <footer className="bg-white border-t border-gray-200 py-6">
            <div className="max-w-7xl mx-auto px-4">
                {/* layout: column on mobile, row on md+ */}
                <div className="w-full flex flex-col md:flex-row items-center md:items-center justify-between gap-4">

                    {/* LEFT: Logo + Tagline (stacked vertically) */}
                    <div className="flex flex-col items-center md:items-start text-center md:text-left">
                        <img
                            src="/logos/data-rhino.png"
                            alt="Data Rhino"
                            className="h-12 w-auto mb-1"
                        />
                        <p className="text-gray-500 italic text-sm">
                            The News-Rhino of Tech.
                        </p>
                    </div>


                    {/* CENTER: Copyright (kept centered) */}
                    <div className="w-full md:w-auto flex-1 text-center">
                        <p className="text-sm text-gray-400">© 2025 Data Rhino. All rights reserved.</p>
                    </div>

                    {/* RIGHT: Contact + Powered by */}
                    <div className="flex flex-col items-center md:items-end text-center md:text-right gap-1 min-w-0">
                        <button
                            onClick={() => setShowModal(true)}
                            className="text-gray-600 hover:underline"
                        >
                            Contact
                        </button>
                        <p className="text-sm text-gray-500 font-semibold">Powered by Rhino Tribe</p>
                        <a href="https://www.rhinotribe.in" className="text-sm underline text-blue-600">
                            www.rhinotribe.in
                        </a>
                    </div>
                </div>
            </div>

            <ContactModal isOpen={showModal} onClose={() => setShowModal(false)} />
        </footer>
    );
}
