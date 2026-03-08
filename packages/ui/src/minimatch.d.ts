declare module 'minimatch' {
    export function minimatch(target: string, pattern: string, options?: any): boolean;
    export namespace minimatch {
        export function filter(pattern: string, options?: any): (target: string) => boolean;
    }
}
