import { useState } from "react";
import ContactModal from "./ContactModal";

export default function Footer() {
    const [showModal, setShowModal] = useState(false);

    return (
        <footer className="bg-white border-t border-gray-200 py-6">
            <div className="flex flex-col items-center">
                {/* Logo + Tagline */}
                <div className="flex items-center gap-2 mb-2">
                    <img
                        src="/logos/data-rhino.png"
                        alt="Data Rhino"
                        className="h-12 w-auto"
                    />
                    <span className="font-bold text-lg"></span>
                </div>
                <p className="text-gray-500 italic mb-4">The News-Rhino of Tech.</p>

                {/* Links → only Contact */}
                <div className="flex gap-6 mb-4">
                    <button
                        onClick={() => setShowModal(true)}
                        className="text-gray-600 hover:underline"
                    >
                        Contact
                    </button>
                </div>

                {/* Copyright */}
                <p className="text-sm text-gray-400">
                    © 2025 Data Rhino. All rights reserved.
                </p>
            </div>

            {/* Contact Modal */}
            <ContactModal isOpen={showModal} onClose={() => setShowModal(false)} />
        </footer>
    );
}
