import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn() {
    var inputs = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        inputs[_i] = arguments[_i];
    }
    return twMerge(clsx(inputs));
}
export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
export function formatDate(date) {
    return new Intl.DateTimeFormat('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}
export function formatFileSize(bytes) {
    if (bytes === 0)
        return '0 Bytes';
    var k = 1024;
    var sizes = ['Bytes', 'KB', 'MB', 'GB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
export function isValidImageFile(file) {
    var validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    return validTypes.includes(file.type);
}
export function isValidVideoFile(file) {
    var validTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    return validTypes.includes(file.type);
}
export function getMediaDuration(file) {
    return new Promise(function (resolve) {
        if (file.type.startsWith('video/')) {
            var video_1 = document.createElement('video');
            video_1.preload = 'metadata';
            video_1.onloadedmetadata = function () {
                resolve(video_1.duration);
            };
            video_1.src = URL.createObjectURL(file);
        }
        else {
            resolve(5); // 5 segundos por defecto para imágenes
        }
    });
}
