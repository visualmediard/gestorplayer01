import { useState, useEffect } from 'react';
export function useMobile() {
    var _a = useState(false), isMobile = _a[0], setIsMobile = _a[1];
    useEffect(function () {
        var checkMobile = function () {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return function () { return window.removeEventListener('resize', checkMobile); };
    }, []);
    return isMobile;
}
