declare module 'minimatch' {
    function minimatch(p: string, pattern: string, options?: any): boolean;
    namespace minimatch {
        function filter(pattern: string, options?: any): (p: string) => boolean;
    }
    export = minimatch;
}
