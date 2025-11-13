import React from "react";

export default function ContactModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-96 relative">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl"
                >
                    ✖
                </button>

                <h2 className="text-2xl font-bold text-center mb-2 text-blue-600">
                    Let’s Connect 🚀
                </h2>
                <p className="text-center text-gray-600 mb-6">
                    We’d love to hear from you — reach out via email.
                </p>

                <div className="bg-gray-50 p-4 rounded-md text-center mb-4">
                    <p className="text-sm text-gray-700">
                        📧 <span className="font-mono">contact@rhinotribe.in</span>
                    </p>
                </div>

                <div className="space-y-4">
                    <a
                        href="mailto:contact@rhinotribe.in"
                        className="block w-full bg-blue-600 text-white text-center py-2 rounded-md hover:bg-blue-700 transition"
                    >
                        📧 Email Us
                    </a>
                </div>

                <p className="text-xs text-gray-400 text-center mt-6">
                    We typically respond within 24 hours.
                </p>
            </div>
        </div>
    );
}
