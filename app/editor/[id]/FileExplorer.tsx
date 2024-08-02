import React, { useEffect, useState } from 'react';
import { FaFile, FaFolder, FaFolderOpen } from 'react-icons/fa';
import './FileExplorer.css';
import ContextMenu from './ContextMenu';
import Modal from './Modal'; // Import the Modal component

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
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; isVisible: boolean; target: string | null }>({ x: 0, y: 0, isVisible: false, target: null });
  const [isFilesFetched, setIsFilesFetched] = useState(false);
  const [editingFile, setEditingFile] = useState<string | null>(null);
  const [newFileName, setNewFileName] = useState<string>('');
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isNewFileModalOpen, setIsNewFileModalOpen] = useState(false);
  const [newFilePath, setNewFilePath] = useState('');
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
  const [newFolderPath, setNewFolderPath] = useState('');
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

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
    if (!isFilesFetched) {
      fetchFiles();
      setIsFilesFetched(true);
    }
  }, [projectId, isFilesFetched]);

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
    event.stopPropagation();
    onFileSelect(filePath);
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

      await fetchFiles();
    };

    reader.readAsText(file);
  };

  const handleContextMenu = (event: React.MouseEvent, target: string) => {
    event.preventDefault();
    event.stopPropagation();
    setContextMenu({ x: event.clientX, y: event.clientY, isVisible: true, target });
  };

  const handleContextMenuClose = () => {
    setContextMenu(prevContextMenu => ({ ...prevContextMenu, isVisible: false }));
  };

  const handleOpen = () => {
    if (contextMenu.target) {
      onFileSelect(contextMenu.target);
    }
    handleContextMenuClose();
  };

  const handleDelete = async () => {
    setIsDeleteConfirmOpen(true); // Show the confirmation dialog
  };

  const confirmDelete = async () => {
    if (contextMenu.target) {
      await fetch('/api/v1/files/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          relativePath: contextMenu.target,
        }),
      });
    }
    handleContextMenuClose();
    await fetchFiles();
    setIsDeleteConfirmOpen(false); // Close the confirmation dialog
  };

  const cancelDelete = () => {
    setIsDeleteConfirmOpen(false); // Close the confirmation dialog
  };

  const handleRename = (filePath: string) => {
    handleContextMenuClose();
    setEditingFile(filePath);
    setNewFileName(filePath.split('/').pop() || '');
  };

  const saveRename = async () => {
    if (!editingFile || !newFileName) return;

    const response = await fetch('/api/v1/files/rename', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectId,
        oldPath: editingFile,
        newPath: editingFile.replace(/[^/]+$/, newFileName),
      }),
    });

    if (!response.ok) {
      console.error('Failed to rename file');
      return;
    }

    setEditingFile(null);
    setNewFileName('');
    await fetchFiles();
  };

  const cancelRename = () => {
    setEditingFile(null);
    setNewFileName('');
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      saveRename();
    } else if (event.key === 'Escape') {
      cancelRename();
    }
  };

  const handleNewFile = async () => {
    if (!newFilePath) return;

    const response = await fetch('/api/v1/files/create/file', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectId,
        relativePath: newFilePath,
        content: '', // Empty file
      }),
    });

    if (!response.ok) {
      console.error('Failed to create new file');
      return;
    }

    setNewFilePath('');
    setIsNewFileModalOpen(false);
    await fetchFiles();
  };

  const handleNewFolder = async () => {
    if (!newFolderPath) return;

    const response = await fetch('/api/v1/files/create/folder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectId,
        relativePath: newFolderPath,
      }),
    });

    if (!response.ok) {
      console.error('Failed to create new folder');
      return;
    }

    setNewFolderPath('');
    setIsNewFolderModalOpen(false);
    await fetchFiles();
  };

  const handleDragStart = (event: React.DragEvent, filePath: string) => {
    event.stopPropagation();
    setDraggedItem(filePath);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = async (event: React.DragEvent, newFolder: string) => {
    event.preventDefault();
    event.stopPropagation();

    if (!draggedItem) return;

    const newFilePath = `${newFolder}/${draggedItem.split('/').pop()}`;
    const response = await fetch('/api/v1/files/move', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectId,
        oldPath: draggedItem,
        newPath: newFilePath,
      }),
    });

    if (!response.ok) {
      console.error('Failed to move file');
      return;
    }

    setDraggedItem(null);
    await fetchFiles();
  };

  const handleRootDrop = async (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (!draggedItem) return;

    const newFilePath = draggedItem.split('/').pop() || '';
    const response = await fetch('/api/v1/files/move', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectId,
        oldPath: draggedItem,
        newPath: newFilePath,
      }),
    });

    if (!response.ok) {
      console.error('Failed to move file to root');
      return;
    }

    setDraggedItem(null);
    await fetchFiles();
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
          const handleClick = (e: React.MouseEvent, fullPath: string) => {
            if (typeof value !== 'string') {
              toggleFolder(e, fullPath);
            } else {
              handleFileClick(e, fullPath);
            }
          };

          const handleContextMenuClick = (e: React.MouseEvent, fullPath: string) => {
            handleContextMenu(e, fullPath);
          };

          const handleDoubleClick = (e: React.MouseEvent, fullPath: string) => {
            e.stopPropagation();
            handleRename(fullPath);
          };

          return (
            <li key={fullPath}
              className="file-item"
              onClick={(e) => handleClick(e, fullPath)}
              onContextMenu={(e) => handleContextMenuClick(e, fullPath)}
              onDoubleClick={(e) => handleDoubleClick(e, fullPath)}
              draggable
              onDragStart={(e) => handleDragStart(e, fullPath)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, fullPath)}>
              {editingFile === fullPath ? (
                <input
                  type="text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  onBlur={saveRename}
                  onKeyDown={handleKeyDown}
                  autoFocus
                />
              ) : (
                <>
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
                </>
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="container" onDragOver={handleDragOver} onDrop={handleRootDrop}>
      <h2>Files</h2>
      <div className="divider" />
      <div className="buttons-container">
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
        <div className="create-buttons-container">
          <button className="new-file-button" onClick={() => setIsNewFileModalOpen(true)}>
            <FaFile className="file-icon" />
          </button>
          <button className="new-folder-button" onClick={() => setIsNewFolderModalOpen(true)}>
            <FaFolder className="folder-icon" />
          </button>
        </div>
      </div>
      {renderFiles(files)}
      <ContextMenu
        x={contextMenu.x}
        y={contextMenu.y}
        isVisible={contextMenu.isVisible}
        onClose={handleContextMenuClose}
        onOpen={handleOpen}
        onDelete={handleDelete}
        onRename={() => handleRename(contextMenu.target || '')}
      />
      <Modal
        isOpen={isDeleteConfirmOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        message="Are you sure you want to delete this file?"
      />
      <Modal
        isOpen={isNewFileModalOpen}
        onClose={() => setIsNewFileModalOpen(false)}
        onConfirm={handleNewFile}
        message={
          <>
            <label>
              Enter new file name:
              <input
                type="text"
                value={newFilePath}
                onChange={(e) => setNewFilePath(e.target.value)}
              />
            </label>
          </>
        }
      />
      <Modal
        isOpen={isNewFolderModalOpen}
        onClose={() => setIsNewFolderModalOpen(false)}
        onConfirm={handleNewFolder}
        message={
          <>
            <label>
              Enter new folder name:
              <input
                type="text"
                value={newFolderPath}
                onChange={(e) => setNewFolderPath(e.target.value)}
              />
            </label>
          </>
        }
      />
    </div>
  );
};

export default FileExplorer;
