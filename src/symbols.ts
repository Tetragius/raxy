const Symbols = {
    parent: Symbol('parent'),
    now: Symbol('now'),
    prevNow: Symbol('prevNow'),
    ignoreTimeStamp: Symbol('ignoreTimeStamp'),
}

export default Symbols;
export const ignoreTimeStamp = Symbols.ignoreTimeStamp