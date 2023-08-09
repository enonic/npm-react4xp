var context = typeof window !== 'undefined' ? window : global;

(function(window) {
    if (typeof console === 'undefined') {
        try {
            window.console = {};
        } catch (e) {}
        window.console.log = console.log;
    }

    if (typeof window.verify === 'undefined') {
        window.verify = () => { window.console.log("Testing: A-OK!") };
    }
} )(context);

context.verify();
