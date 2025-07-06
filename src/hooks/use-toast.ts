import { toast } from 'sonner';

export function useToast() {
  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
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

  const showSuccessToast = (message: string) => {
    toast.success(message);
  };

  const showErrorToast = (message: string) => {
    toast.error(message);
  };

  const showInfoToast = (message: string) => {
    toast(message);
  };

  const showWarningToast = (message: string) => {
    toast.warning(message);
  };

  const showPromiseToast = (
    promise: Promise<any>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return toast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
    });
  };

  return {
    showToast,
    showSuccessToast,
    showErrorToast,
    showInfoToast,
    showWarningToast,
    showPromiseToast,
  };
} 