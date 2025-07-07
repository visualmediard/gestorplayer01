import { toast } from 'sonner';
export function useToast() {
    var showToast = function (message, type) {
        if (type === void 0) { type = 'info'; }
        switch (type) {
            case 'success':
                toast.success(message);
                break;
            case 'error':
                toast.error(message);
                break;
            case 'warning':
                toast.warning(message);
                break;
            default:
                toast(message);
        }
    };
    var showSuccessToast = function (message) {
        toast.success(message);
    };
    var showErrorToast = function (message) {
        toast.error(message);
    };
    var showInfoToast = function (message) {
        toast(message);
    };
    var showWarningToast = function (message) {
        toast.warning(message);
    };
    var showPromiseToast = function (promise, messages) {
        return toast.promise(promise, {
            loading: messages.loading,
            success: messages.success,
            error: messages.error,
        });
    };
    return {
        showToast: showToast,
        showSuccessToast: showSuccessToast,
        showErrorToast: showErrorToast,
        showInfoToast: showInfoToast,
        showWarningToast: showWarningToast,
        showPromiseToast: showPromiseToast,
    };
}
