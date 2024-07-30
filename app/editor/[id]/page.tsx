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
      await fetch('/api/typst/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectId: id }),
      });
    };

    createProject();

    const socketInstance = io();
    setSocket(socketInstance);

    socketInstance.emit('join-room', id);

    socketInstance.on('update-file', (newContent: string) => {
      setContent(newContent);
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
    await fetch('/api/typst/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ projectId: id, fileName: 'main', content: content }),
    });

    // Trigger compilation
    const compileResponse = await fetch('/api/typst/compile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ projectId: id, fileName: 'main' }),
    });

    if (compileResponse.ok) {
      // Update the PDF src to force reload
      setPdfSrc(`/api/typst/fetch?projectId=${id}&fileName=main&type=pdf&timestamp=${new Date().getTime()}`);
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      <FileExplorer projectId={id} />
      <textarea
        value={content}
        onChange={handleChange}
        style={{ width: '50%', height: '100vh' }}
      />
      <iframe
        src={pdfSrc}
        style={{ width: '50%', height: '100vh' }}
      />
    </div>
  );
};

export default EditorPage;