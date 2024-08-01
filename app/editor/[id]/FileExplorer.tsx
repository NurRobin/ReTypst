import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { FaFile, FaFolder, FaFolderOpen } from 'react-icons/fa';

interface FileExplorerProps {
  projectId: string;
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
  border-left: ${({ $level }) => ($level > 0 ? `1px solid #ccc` : 'none')};
  margin: 0;
  padding: 5px 0 5px 10px;
`;

const FileItem = styled.li`
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 3px 0;
`;

const FileName = styled.span`
  margin-left: 5px;
`;

const FileExplorer: React.FC<FileExplorerProps> = ({ projectId }) => {
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
            <FileItem key={fullPath} onClick={(e) => typeof value !== 'string' && toggleFolder(e, fullPath)}>
              {typeof value === 'string' ? (
                <>
                  <FaFile />
                  <FileName>{key}</FileName>
                </>
              ) : (
                <>
                  {isOpen ? <FaFolderOpen /> : <FaFolder />}
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
