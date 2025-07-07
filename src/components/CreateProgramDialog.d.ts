interface CreateProgramDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onCreateProgram: (name: string, width: number, height: number) => Promise<void>;
    isLoading?: boolean;
}
declare function CreateProgramDialog({ isOpen, onClose, onCreateProgram, isLoading }: CreateProgramDialogProps): import("react").JSX.Element;
export default CreateProgramDialog;
