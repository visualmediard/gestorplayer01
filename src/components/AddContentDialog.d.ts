import React from 'react';
import { Content } from '../types/content';
interface AddContentDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onAddContent: (content: Content) => void;
}
declare function AddContentDialog({ isOpen, onClose, onAddContent }: AddContentDialogProps): React.JSX.Element;
export default AddContentDialog;
