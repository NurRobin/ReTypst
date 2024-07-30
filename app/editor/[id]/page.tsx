'use client';

import { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import FileExplorer from './FileExplorer';

interface EditorPageProps {
  params: { id: string };
}

const EditorPage: React.FC<EditorPageProps> = ({ params }) => {
  const { id } = params;
  const [content, setContent] = useState<string>('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [pdfSrc, setPdfSrc] = useState<string>('');

  useEffect(() => {
    const createProject = async () => {
      const response = await fetch('/api/typst/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectId: id, fileName: 'main', type: 'typ' }),
      });

      if (!response.ok) {
        console.error('Failed to create project:', response.statusText);
      }
    };

    createProject();

    const socketInstance = io();
    setSocket(socketInstance);
    console.log('Socket connection established');

    socketInstance.emit('join-room', id);

    socketInstance.on('update-file', (newContent: string) => {
      setContent(newContent);
    });

    socketInstance.on('file-saved', () => {
      console.log('File saved event received');
      setPdfSrc(`/api/typst/fetch?projectId=${id}&fileName=main&type=pdf&timestamp=${new Date().getTime()}`);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [id]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('/api/typst/fetch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectId: id, fileName: 'main', type: 'typ' }),
      });
      const data = await response.json();
      setContent(data.content);

      // Set initial PDF src
      setPdfSrc(`/api/typst/fetch?projectId=${id}&fileName=main&type=pdf&timestamp=${new Date().getTime()}`);
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
    const saveResponse = await fetch('/api/typst/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ projectId: id, fileName: 'main', content: content }),
    });
    console.log('Save response:', await saveResponse.json());

    // Trigger compilation
    const compileResponse = await fetch('/api/typst/compile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ projectId: id, fileName: 'main' }),
    });

    if (compileResponse.ok) {
      console.log('Compile response: OK');
      // Update the PDF src to force reload
      setPdfSrc(`/api/typst/fetch?projectId=${id}&fileName=main&type=pdf&timestamp=${new Date().getTime()}`);
      if (socket) {
        console.log('Emitting file-saved event');
        socket.emit('file-saved');
      }
    } else {
      console.error('Compile response error:', compileResponse.statusText);
    }
  };

  return (
    <div className='editor'>
      <FileExplorer projectId={id} />
      <textarea
        value={content}
        onChange={handleChange}
        className='editor-textarea'
      />
      <iframe
        src={pdfSrc}
        className='editor-pdf'
      />
    </div>
  );
};

export default EditorPage;