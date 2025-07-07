import React from 'react';
import { Program } from '../types/content';
interface CanvasEditorProps {
    program: Program;
    onUpdateProgram: (program: Program) => void;
    onClose: () => void;
}
declare const CanvasEditor: React.FC<CanvasEditorProps>;
export default CanvasEditor;
