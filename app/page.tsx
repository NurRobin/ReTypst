'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface Project {
  id: string;
  name: string;
}

const LandingPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      const response = await fetch('/api/typst/projects');
      if (!response.ok) {
        console.error('Failed to fetch projects');
        return;
      }
      const data = await response.json();
      setProjects(data.projects);
    };

    fetchProjects();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Projects</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        {projects.map((project) => (
          <div key={project.id} style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '20px', width: '200px' }}>
            <h2>{project.id}</h2>
            {/* <p>{project.description}</p> */}
            <Link href={`/editor/${project.id}`}>
              <button style={{ marginTop: '10px' }}>Edit Project</button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LandingPage;