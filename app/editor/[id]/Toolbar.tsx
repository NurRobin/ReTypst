import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { FaSave, FaArrowLeft } from 'react-icons/fa';

interface ToolbarProps {
    onSave: () => void;
    onBack: () => void;
}

const ToolbarContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px;
    background-color: #f0f0f0;
    border-bottom: 1px solid #ccc;
`;

const ToolbarButton = styled.button`
    display: flex;
    align-items: center;
    padding: 5px 10px;
    margin-right: 10px;
    background-color: transparent;
    border: none;
    cursor: pointer;
    font-size: 16px;

    &:hover {
        background-color: #ddd;
    }

    &:last-child {
        margin-right: 0;
    }
`;

const ToolbarProjectName = styled.h2`
    margin: 0;
`;

const Toolbar: React.FC<ToolbarProps> = ({ onSave, onBack }) => {
    const [projectName, setProjectName] = useState('');

    useEffect(() => {
        const pathname = window.location.pathname;
        const projectNameFromUrl = pathname.split('/editor/')[1];
        setProjectName(projectNameFromUrl);
    }, []);

    return (
        <ToolbarContainer>
            <ToolbarButton onClick={onBack}>
                <FaArrowLeft />
                <span style={{ marginLeft: '5px' }}>Back</span>
            </ToolbarButton>
            <ToolbarProjectName>{projectName}</ToolbarProjectName>
            <div>
                <ToolbarButton onClick={onSave}>
                    <FaSave />
                    <span style={{ marginLeft: '5px' }}>Save</span>
                </ToolbarButton>
            </div>
        </ToolbarContainer>
    );
};

export default Toolbar;