/**
 * IBMS API Bridge
 * e-Iskolar Bayan Management Portal
 * Emulates Google Apps Script 'google.script.run' on local PHP / MySQL backend (XAMPP).
 * Translates RPC calls directly to fetch('api.php?action=...').
 */

(function () {
    function createRunProxy() {
        let successHandler = null;
        let failureHandler = null;

        const runner = {
            withSuccessHandler(callback) {
                successHandler = callback;
                return proxy;
            },
            withFailureHandler(callback) {
                failureHandler = callback;
                return proxy;
            }
        };

        const proxy = new Proxy(runner, {
            get(target, prop) {
                if (prop === 'withSuccessHandler' || prop === 'withFailureHandler') {
                    return target[prop];
                }

                // If calling a backend function name
                return function (...args) {
                    const action = prop;

                    // Construct request payload
                    const payload = {
                        action: action,
                        args: args
                    };

                    fetch(`api.php?action=${encodeURIComponent(action)}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify(payload)
                    })
                    .then(async response => {
                        const contentType = response.headers.get('content-type') || '';
                        let data;
                        if (contentType.includes('application/json')) {
                            data = await response.json();
                        } else {
                            const text = await response.text();
                            try {
                                data = JSON.parse(text);
                            } catch (e) {
                                throw new Error(text || `Server error: HTTP ${response.status}`);
                            }
                        }

                        if (!response.ok || (data && data.success === false && data.error)) {
                            const errMsg = (data && (data.message || data.error)) ? (data.message || data.error) : `Error: HTTP ${response.status}`;
                            throw new Error(errMsg);
                        }

                        return data;
                    })
                    .then(data => {
                        if (typeof successHandler === 'function') {
                            successHandler(data);
                        }
                    })
                    .catch(err => {
                        console.error(`[API Bridge Error] ${action}:`, err);
                        if (typeof failureHandler === 'function') {
                            failureHandler(err);
                        } else if (window.Swal) {
                            Swal.fire('Error', err.message || 'Server communication failed.', 'error');
                            if (typeof window.toggleLoader === 'function') {
                                window.toggleLoader(false);
                            }
                        }
                    });
                };
            }
        });

        return proxy;
    }

    window.google = window.google || {};
    window.google.script = window.google.script || {};

    // Define getter on google.script.run so each call gets a fresh proxy instance
    Object.defineProperty(window.google.script, 'run', {
        get() {
            return createRunProxy();
        },
        configurable: true
    });
})();
