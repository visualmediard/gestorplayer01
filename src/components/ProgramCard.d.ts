import { Program } from '../types/content';
interface ProgramCardProps {
    program: Program;
    onDelete: (id: string) => Promise<void>;
    onUpdate: (program: Program) => Promise<void>;
    onEditCanvas?: (program: Program) => void;
}
export default function ProgramCard({ program, onDelete, onUpdate, onEditCanvas }: ProgramCardProps): import("react").JSX.Element;
export {};
