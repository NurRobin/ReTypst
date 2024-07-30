import React, { useEffect, useState } from 'react';

interface FileExplorerProps {
  projectId: string;
}

const FileExplorer: React.FC<FileExplorerProps> = ({ projectId }) => {
  const [files, setFiles] = useState<string[]>([]);

  useEffect(() => {
    const fetchFiles = async () => {
      const response = await fetch(`/api/typst/files?projectId=${projectId}`);
      if (!response.ok) {
        console.error('Failed to fetch files');
        return;
      }
      const text = await response.text();
      try {
        const data = JSON.parse(text);
        setFiles(data.files);
      } catch (error) {
        console.error('Failed to parse JSON', error);
      }
    };

    fetchFiles();
  }, [projectId]);

  return (
    <div style={{ width: '20%', height: '100vh', overflowY: 'scroll', borderRight: '1px solid #ccc' }}>
      <ul>
        {files.map((file) => (
          <li key={file}>{file}</li>
        ))}
      </ul>
    </div>
  );
};

export default FileExplorer;