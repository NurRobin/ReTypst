import React, { useEffect, useState } from 'react';
import { FaFile, FaFolder, FaFolderOpen } from 'react-icons/fa';
import './FileExplorer.css';

interface FileExplorerProps {
  projectId: string;
  onFileSelect: (filePath: string) => void;
}

interface FileStructure {
  [key: string]: string | FileStructure;
}

const FileExplorer: React.FC<FileExplorerProps> = ({ projectId, onFileSelect }) => {
  const [files, setFiles] = useState<FileStructure>({});
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set());

  const fetchFiles = async () => {
    const response = await fetch(`/api/v1/projects/files?projectId=${projectId}`);
    if (!response.ok) {
      console.error('Failed to fetch files');
      return;
    }
    const text = await response.text();
    try {
      const data = JSON.parse(text);
      setFiles(data.files || {});
    } catch (error) {
      console.error('Failed to parse JSON', error);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [projectId]);

  const toggleFolder = (event: React.MouseEvent, folder: string) => {
    event.stopPropagation();
    setOpenFolders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(folder)) {
        newSet.delete(folder);
      } else {
        newSet.add(folder);
      }
      return newSet;
    });
  };

  const handleFileClick = (event: React.MouseEvent, filePath: string) => {
    event.stopPropagation(); // Prevent the folder from closing
    onFileSelect(filePath); // Call the callback with the selected file path
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const content = reader.result as string;
      const relativePath = file.name;

      const response = await fetch('/api/v1/files/create/file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          relativePath,
          content,
        }),
      });

      if (!response.ok) {
        console.error('Failed to upload file');
        return;
      }

      await fetchFiles(); // Refresh the file explorer after a successful upload
    };

    reader.readAsText(file);
  };

  const renderFiles = (fileStructure: FileStructure, parentKey: string = '', level: number = 0) => {
    const entries = Object.entries(fileStructure || {});
    const folders = entries.filter(([_, value]) => typeof value !== 'string').sort();
    const files = entries.filter(([_, value]) => typeof value === 'string').sort();
    const sortedEntries = [...folders, ...files];

    return (
      <ul className={`file-list ${level > 0 ? 'level-1' : ''}`}>
        {sortedEntries.map(([key, value]) => {
          const fullPath = parentKey ? `${parentKey}/${key}` : key;
          const isOpen = openFolders.has(fullPath);
          return (
            <li key={fullPath} className="file-item" onClick={(e) => typeof value !== 'string' ? toggleFolder(e, fullPath) : handleFileClick(e, fullPath)}>
              {typeof value === 'string' ? (
                <>
                  <FaFile className="file-icon" />
                  <span className="file-name">{key}</span>
                </>
              ) : (
                <>
                  {isOpen ? <FaFolderOpen className="folder-open-icon" /> : <FaFolder className="folder-icon" />}
                  <span className="file-name">{key}</span>
                  {isOpen && renderFiles(value, fullPath, level + 1)}
                </>
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="container">
      <button className="upload-button">
        <label htmlFor="file-upload" style={{ cursor: 'pointer' }}>
          Upload File
        </label>
        <input
          id="file-upload"
          type="file"
          style={{ display: 'none' }}
          onChange={handleFileUpload}
        />
      </button>
      {renderFiles(files)}
    </div>
  );
};

export default FileExplorer;