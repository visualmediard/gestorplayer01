export declare function useToast(): {
    showToast: (message: string, type?: "success" | "error" | "info" | "warning") => void;
    showSuccessToast: (message: string) => void;
    showErrorToast: (message: string) => void;
    showInfoToast: (message: string) => void;
    showWarningToast: (message: string) => void;
    showPromiseToast: (promise: Promise<any>, messages: {
        loading: string;
        success: string;
        error: string;
    }) => (string & {
        unwrap: () => Promise<any>;
    }) | (number & {
        unwrap: () => Promise<any>;
    }) | {
        unwrap: () => Promise<any>;
    };
};
