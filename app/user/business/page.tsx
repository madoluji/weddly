"use client";

import React, { useState } from 'react';

interface Project {
    id: number;
    title: string;
    description: string;
    budget: number;
}

const projects: Project[] = [
    { id: 1, title: 'Website Development', description: 'Develop a responsive website', budget: 1000 },
    { id: 2, title: 'Mobile App Design', description: 'Design a mobile app', budget: 800 },
    { id: 3, title: 'SEO Optimization', description: 'Optimize website for search engines', budget: 500 },
];

const BusinessPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
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
        <div className='container border p-4' align-items='center'>
            <h1>Available Projects</h1>
            <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={handleSearch}
            />
            <ul>
                {filteredProjects.map(project => (
                    <li key={project.id}>
                        <h2>{project.title}</h2>
                        <p>{project.description}</p>
                        <p>Budget: ${project.budget}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default BusinessPage;