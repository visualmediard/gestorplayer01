import { Program } from '../types/content';
interface IndexProps {
    programs: Program[];
    onCreateProgram: (program: Program) => Promise<Program>;
    onUpdateProgram: (program: Program) => Promise<Program>;
    onDeleteProgram: (programId: string) => Promise<void>;
}
declare function Index({ programs, onCreateProgram, onUpdateProgram, onDeleteProgram }: IndexProps): import("react").JSX.Element;
export default Index;
