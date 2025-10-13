
// ---- usage ----
// const cloner = new EbControlClone();
// const copy = cloner.clone(originalCtrl);
class EbControlClone {
    /**
     * Deep clone data-only. Cycles preserved; non-serializables dropped.
     * @param {*} input
     * @returns {*} cloned
     */
    clone(input) {
        const seen = new WeakMap();

        const isDomNode = (v) =>
            (typeof Node !== 'undefined' && v instanceof Node) ||
            (v && v.nodeType && typeof v.nodeName === 'string');

        const cloneVal = (val) => {
            // primitives & null
            if (val === null || typeof val !== 'object') return val;

            // drop problematic/object-environment values
            if (typeof Window !== 'undefined' && val instanceof Window) return undefined;
            if (isDomNode(val)) return undefined;

            // drop functions/symbols
            const t = typeof val;
            if (t === 'function' || t === 'symbol') return undefined;

            // special cases
            if (val instanceof Date) return new Date(val.getTime());
            if (val instanceof RegExp) return new RegExp(val.source, val.flags);
            if (val instanceof Map) return Array.from(val.entries()).map(([k, v]) => [cloneVal(k), cloneVal(v)]);
            if (val instanceof Set) return Array.from(val.values()).map(cloneVal);

            // cycle handling
            if (seen.has(val)) return seen.get(val);

            const out = Array.isArray(val) ? [] : {};
            seen.set(val, out);

            if (Array.isArray(val)) {
                for (let i = 0; i < val.length; i++) {
                    const c = cloneVal(val[i]);
                    if (c !== undefined) out.push(c); // skip dropped entries
                }
            } else {
                for (const k of Object.keys(val)) {
                    const c = cloneVal(val[k]);
                    if (c !== undefined) out[k] = c; // omit dropped keys
                }
            }
            return out;
        };

        return cloneVal(input);
    }
}

