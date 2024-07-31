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

  const handleNewProject = async () => {
    const projectName = prompt('Enter the name for the new project:');
    if (!projectName) return;

    const projects = await fetch('/api/typst/projects');
    const data = await projects.json();

    if (data.projects.find((project: Project) => project.id === projectName)) {
      alert('Project name is already taken. Please choose another name.');
    } else {
      await fetch('/api/typst/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectId: projectName, type: 'project' }),
      });
      window.location.href = `/editor/${projectName}`;
    }
  };

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
        <div onClick={handleNewProject} style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '20px', width: '200px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }}>
          <h2>+</h2>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;