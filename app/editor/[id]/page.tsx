'use client';

import { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import FileExplorer from './FileExplorer';
import Toolbar from './Toolbar';
import styled from 'styled-components';

interface EditorPageProps {
  params: { id: string };
}

interface Project {
  id: string;
  name: string;
}

const EditorContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

const MainContent = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const TextArea = styled.textarea`
  flex: 1;
  margin: 0;
  padding: 10px;
  border: none;
  resize: none;
  font-family: monospace;
  font-size: 14px;
`;

const IFrame = styled.iframe`
  flex: 1;
  margin: 0;
  padding: 0;
  border: none;
`;

const EditorPage: React.FC<EditorPageProps> = ({ params }) => {
  const { id } = params;
  const [content, setContent] = useState<string>('');
  const [openFile, setOpenFile] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [pdfSrc, setPdfSrc] = useState<string>('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectListLoaded, setProjectListLoaded] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/v1/projects/list');
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        const data = await response.json();
        setProjects(data.projects);
        setProjectListLoaded(true);
      } catch (error) {
        console.error(error);
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    const createProjectIfNotPresent = async () => {
      if (projectListLoaded && !projects.some((project: Project) => project.id === id)) {
        try {
          const response = await fetch('/api/v1/projects/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ projectId: id }),
          });

          if (!response.ok) {
            throw new Error('Failed to create project');
          }
        } catch (error) {
          console.error('Error creating project:', error);
        }
      }
    };

    if (projectListLoaded) {
      createProjectIfNotPresent();
    }
    
    const initializeSocket = async () => {
      await createProjectIfNotPresent();

      const socketInstance = io();
      setSocket(socketInstance);

      socketInstance.emit('join-room', id);

      socketInstance.on('update-file', (newContent: string) => {
        setContent(newContent);
      });

      socketInstance.on('file-saved', () => {
        setPdfSrc(`/api/v1/files/fetch?projectId=${id}&fileName=main.pdf&timestamp=${new Date().getTime()}`);
      });

      return () => {
        socketInstance.disconnect();
      };
    };

    initializeSocket();
  }, [id, projectListLoaded, projects]);

  useEffect(() => {
    const fetchData = async () => {
      const typResponse = await fetch(`/api/v1/files/fetch?projectId=${id}&fileName=main.typ`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const typData = await typResponse.text();
      setContent(typData);
  
      // Set initial PDF src
      const pdfResponse = await fetch(`/api/v1/files/fetch?projectId=${id}&fileName=main.pdf`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const pdfBlob = await pdfResponse.blob();
      const pdfUrl = URL.createObjectURL(pdfBlob);
      setPdfSrc(pdfUrl);
    };
  
    fetchData();
  }, [id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveFile();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [content]);

  const handleChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    if (socket) {
      socket.emit('file-change', id, e.target.value);
    }
  };

  const saveFile = async () => {
    if (!openFile) {
      return;
    }
    const savedFileType = openFile.split('.').pop();
    const saveResponse = await fetch('/api/v1/files/save', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ projectId: id, relativeFilePath: openFile, content: content }),
    });
  
    if (saveResponse.ok && savedFileType === 'typ') {
      // Trigger compilation
      const compileResponse = await fetch('/api/v1/typst/compile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectId: id, relativeFilePath: './main.typ' }), // Include relativeFilePath
      });
  
      if (compileResponse.ok) {
        // Update the PDF src to force reload
        setPdfSrc(`/api/v1/files/fetch?projectId=${id}&fileName=main.pdf&timestamp=${new Date().getTime()}`);
        if (socket) {
          socket.emit('file-saved');
        }
      } else {
        console.error('Compile response error:', compileResponse.statusText);
      }
    } else {
      console.error('Save response error:', saveResponse.statusText);
    }
  };

  const handleBack = () => {
    window.history.back();
  };

  const handleFileSelect = async (filePath: string) => {
    setError(null);
    const response = await fetch(`/api/v1/files/fetch?projectId=${id}&fileName=${filePath}`);
    if (!response.ok) {
      setError('Failed to fetch file');
      return;
    }
    if (filePath.endsWith('.pdf')) {
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setPdfSrc(url);
    } else {
      try {
        const text = await response.text();
        setContent(text);
        setOpenFile(filePath);
      } catch (error) {
        setError('Failed to parse file');
      }
    }
};

  return (
    <EditorContainer>
      <Toolbar onSave={saveFile} onBack={handleBack} />
      <MainContent>
        <FileExplorer projectId={id} onFileSelect={handleFileSelect} />
        <TextArea
          value={content}
          onChange={handleChange}
          className='editor-textarea'
        />
        <IFrame
          src={pdfSrc}
          className='editor-pdf'
        />
      </MainContent>
    </EditorContainer>
  );
};

export default EditorPage;