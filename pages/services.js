import React from "react";
import { motion } from "framer-motion";
import Footer from "../components/Footer";
import Header from "../components/Header"; // ✅ Use global header



// Core services with doodle images
const servicesCore = [
    {
        title: "Ghostwriting & Editing",
        desc: "End-to-end ghostwriting or collaborative editing that preserves your voice and sharpens impact.",
        img: "/doodles/ghostwriting.png",
        tag: "Core",
    },
    {
        title: "Structuring & Formatting",
        desc: "From raw draft to a clean, logical manuscript with headings, TOC, references, and citations handled.",
        img: "/doodles/structuring.png",
        tag: "Core",
    },
    {
        title: "Website Development",
        desc: "Modern, responsive websites built with Next.js, React, and Tailwind. From landing pages to full-stack apps with Airtable/DB integration, SEO optimization, and Vercel-ready deployment.",
        img: "/doodles/webdev.png", // replace with your doodle/illustration path
        tag: "Core",
    },

];

// Advanced services with doodle images
const servicesAdvanced = [
    {
        title: "Technical Book Writing (Data/AI/Cloud)",
        desc: "Specialized authorship and review for data platforms, ML, GenAI, and cloud architectures.",
        img: "/doodles/technical.png",
    },
    {
        title: "Visual Storytelling Add-ons",
        desc: "Figures, charts, and infographics. Optional animated data stories powered by FlowViz.",
        img: "/doodles/visual.png",
    },
    {
        title: "eLearning & Product Development",
        desc:"Transform ideas into digital learning products and tools — from workshops, slide decks, and micro-courses to custom applications and product prototypes.",
        img: "/doodles/elearning.png",
    },
    {
        title: "Publishing & Distribution Advisory",
        desc: "KDP, Pagami.in, or multi-channel releases. ISBN guidance, pricing, and royalty optimization.",
        img: "/doodles/publishing.png",
    },
    {
        title: "Thought Leadership & Branding",
        desc: "Positioning, LinkedIn cadence, talk abstracts, and conference CFPs to amplify your reach.",
        img: "/doodles/thought.png",
    },
    {
        title: "Career Guidance",
        desc: "One-on-one mentoring to leverage your book for roles, consulting, and speaking opportunities.",
        img: "/doodles/career.png",
    },
];

// Badge
const Badge = ({ children }) => (
    <span className="ml-2 rounded-full bg-black/5 px-2 py-0.5 text-xs font-medium text-black/70 dark:bg-white/10 dark:text-white/80">
        {children}
    </span>
);

// Card
const Card = ({ img, title, desc, tag }) => (
    <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.35 }}
        className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
    >
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-zinc-50 group-hover:scale-105 dark:bg-zinc-800">
            <img src={img} alt={`${title} doodle`} className="h-12 w-12" />
        </div>
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {title}
            {tag ? <Badge>{tag}</Badge> : null}
        </h3>
        <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{desc}</p>
    </motion.div>
);

export default function ServicesPage() {
    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-white via-white to-zinc-50 text-zinc-900 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900 dark:text-zinc-50">

            {/* ✅ Use global header */}
            <Header />

            {/* Hero */}
            <section className="relative overflow-hidden flex-grow">
                <div className="mx-auto max-w-6xl px-4 pb-8 pt-8 md:pb-14 md:pt-12">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                        <h1 className="mt-5 text-2xl font-extrabold leading-tight tracking-tight md:text-4xl">
                            Turn ideas into{" "}
                            <span className="underline decoration-amber-400 decoration-[6px] underline-offset-4">
                                publish-ready
                            </span>{" "}
                            books.
                        </h1>
                        <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-600 dark:text-zinc-300 italic">
                            Expert help across writing, structure, and design — plus advanced options tailored to Data/AI/Cloud authors.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Core Services */}
            <section className="mx-auto max-w-6xl px-4 pb-6 md:pb-10">
                <h2 className="text-xl font-bold md:text-2xl">Core Services</h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {servicesCore.map((s) => (
                        <Card key={s.title} img={s.img} title={s.title} desc={s.desc} tag={s.tag} />
                    ))}
                </div>
            </section>

            {/* Advanced Services */}
            <section className="mx-auto max-w-6xl px-4 py-8">
                <h2 className="text-xl font-bold md:text-2xl">Add-ons & Specialized Support</h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {servicesAdvanced.map((s) => (
                        <Card key={s.title} img={s.img} title={s.title} desc={s.desc} />
                    ))}
                </div>
            </section>

            {/* Footer */}
            <Footer />
        </div>
    );
}