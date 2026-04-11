"use client";

import React, { useState } from "react";
import PageShell from "@/app/ui/layout/PageShell";
import PageCard from "@/app/ui/layout/PageCard";

interface Project {
    id: number;
    title: string;
    description: string;
    budget: number;
}

const projects: Project[] = [
    { id: 1, title: "Website Development", description: "Develop a responsive website", budget: 1000 },
    { id: 2, title: "Mobile App Design", description: "Design a mobile app", budget: 800 },
    { id: 3, title: "SEO Optimization", description: "Optimize website for search engines", budget: 500 },
];

const BusinessPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredProjects, setFilteredProjects] = useState<Project[]>(projects);

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        const term = event.target.value;
        setSearchTerm(term);
        setFilteredProjects(
            projects.filter(project =>
                project.title.toLowerCase().includes(term.toLowerCase())
            )
        );
    };

    return (
        <PageShell
            title="Business"
            description="Browse and manage business opportunities"
        >
            <PageCard>
                <div className="space-y-5">
                    <input
                        type="text"
                        placeholder="Search projects..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    />
                    <ul className="space-y-3">
                        {filteredProjects.map((project) => (
                            <li key={project.id} className="rounded-lg border border-slate-200 p-4">
                                <h2 className="text-lg font-semibold">{project.title}</h2>
                                <p className="text-sm text-slate-600 mt-1">{project.description}</p>
                                <p className="text-sm font-medium mt-2">Budget: ${project.budget}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </PageCard>
        </PageShell>
    );
};

export default BusinessPage;