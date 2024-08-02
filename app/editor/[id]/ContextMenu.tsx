import React from 'react';
import './ContextMenu.css';

interface ContextMenuProps {
  x: number;
  y: number;
  isVisible: boolean;
  onClose: () => void;
  onOpen: () => void;
  onDelete: () => void;
  onRename: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, isVisible, onClose, onOpen, onDelete, onRename }) => {
  if (!isVisible) return null;

  return (
    <div className="context-menu" style={{ top: y, left: x }} onMouseLeave={onClose}>
      <ul>
        <li onClick={onOpen}>Open</li>
        <li onClick={onDelete}>Delete</li>
        <li onClick={onRename}>Rename</li>
      </ul>
    </div>
  );
};

export default ContextMenu;