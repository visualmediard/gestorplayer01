import { MediaContent } from '../types/content';
interface RepetitionConfigDialogProps {
    content: MediaContent;
    isOpen: boolean;
    onClose: () => void;
    onSave: (contentId: string, limit: number, isUnlimited: boolean) => void;
}
export declare function RepetitionConfigDialog({ content, isOpen, onClose, onSave }: RepetitionConfigDialogProps): import("react").JSX.Element;
export {};
