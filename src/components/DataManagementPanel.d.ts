import React from 'react';
interface DataManagementPanelProps {
    onDataImported?: () => void;
    onDataCleared?: () => void;
}
declare function DataManagementPanel({ onDataImported, onDataCleared }: DataManagementPanelProps): React.JSX.Element;
export default DataManagementPanel;
