import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { FaFile, FaFolder, FaFolderOpen } from 'react-icons/fa';

interface FileExplorerProps {
  projectId: string;
  onFileSelect: (filePath: string) => void;
}

interface FileStructure {
  [key: string]: string | FileStructure;
}

const Container = styled.div`
  width: 20%;
  height: 100vh;
  overflow-y: scroll;
  border-right: 1px solid #ccc;
  padding: 10px;
`;

const FileList = styled.ul<{ $level: number }>`
  list-style: none;
  padding-left: 20px;
  border-left: ${({ $level }) => ($level > 0 ? `1px solid #ddd` : 'none')};
  margin: 0;
  padding: 10px 0 10px 10px; /* Increased padding for better spacing */
`;

const FileItem = styled.li`
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px 12px; /* Increased padding for better spacing */
  margin-bottom: 5px; /* Added margin for better spacing */
  border-radius: 4px; /* Rounded corners for a modern look */
  transition: background-color 0.3s; /* Smooth transition for hover effect */

  &:hover {
    background-color: rgba(0, 0, 0, 0.3); /* Slightly darker background for both light and dark modes */
  }

  &.active {
    background-color: rgba(0, 0, 0, 0.2); /* Highlight active item */
  }
`;

const FileName = styled.span`
  margin-left: 10px; /* Increased margin for better spacing */
  font-size: 14px; /* Appropriate font size for readability */
  font-family: Arial, sans-serif; /* Clean and modern font */
`;

const FolderIcon = styled(FaFolder)`
  @media (prefers-color-scheme: dark) {
    color: #008eff; /* White color for folders in dark mode */
  }
  color: #0063b2; /* Dark color for folders in light mode */
`;

const FolderOpenIcon = styled(FaFolderOpen)`
  @media (prefers-color-scheme: dark) {
    color: #008eff; /* White color for folders in dark mode */
  }
  color: #0063b2; /* Dark color for folders in light mode */
`;

const FileIcon = styled(FaFile)`
  @media (prefers-color-scheme: dark) {
    color: #fff; /* White color for files in dark mode */
  }
  color: #333; /* Dark color for files in light mode */
`;

const FileExplorer: React.FC<FileExplorerProps> = ({ projectId, onFileSelect }) => {
  const [files, setFiles] = useState<FileStructure>({});
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchFiles = async () => {
      const response = await fetch(`/api/v1/projects/files?projectId=${projectId}`);
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

  const renderFiles = (fileStructure: FileStructure, parentKey: string = '', level: number = 0) => {
    const entries = Object.entries(fileStructure);
    const folders = entries.filter(([_, value]) => typeof value !== 'string').sort();
    const files = entries.filter(([_, value]) => typeof value === 'string').sort();
    const sortedEntries = [...folders, ...files];

    return (
      <FileList $level={level}>
        {sortedEntries.map(([key, value]) => {
          const fullPath = parentKey ? `${parentKey}/${key}` : key;
          const isOpen = openFolders.has(fullPath);
          return (
            <FileItem key={fullPath} onClick={(e) => typeof value !== 'string' ? toggleFolder(e, fullPath) : handleFileClick(e, fullPath)}>
              {typeof value === 'string' ? (
                <>
                  <FileIcon />
                  <FileName>{key}</FileName>
                </>
              ) : (
                <>
                  {isOpen ? <FolderOpenIcon /> : <FolderIcon />}
                  <FileName>{key}</FileName>
                  {isOpen && renderFiles(value, fullPath, level + 1)}
                </>
              )}
            </FileItem>
          );
        })}
      </FileList>
    );
  };

  return <Container>{renderFiles(files)}</Container>;
};

export default FileExplorer;
