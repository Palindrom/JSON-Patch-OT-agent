/*!
 * https://github.com/Palindrom/JSON-Patch-OT-agent
 * JSON-Patch-OT-agent version: 1.1.0
 * (c) 2017 Tomek Wytrebowicz
 * MIT license
 */
declare class JSONPatchOTAgent {    

    /**
     * [JSONPatchOTAgent description]
     * @param {Function} transform function(seqenceA, sequences) that transforms `seqenceA` against `sequences`.
     * @param {Array<JSON-Pointer>} versionPaths JSON-Pointers to version numbers [local, remote]
     * @param {function} apply    apply(JSONobj, JSONPatchSequence) function to apply JSONPatch to object.
     * @param {Boolean} purity       [description]
     * @constructor
     * @extends {JSONPatchQueue}
     * @version: 1.1.0
     */
    constructor(transform: Function, versionPaths: Array<String>, apply: Function, purity: Boolean);

    /**
     * Wraps JSON Patch sequence with version related operation objects
     * @param  {JSONPatch} sequence JSON Patch sequence to wrap
     * @return {VersionedJSONPatch}
     */
    public send(JSONPatch: Object, VersionedJSONPatch: Object);

    /**
     * Process received versioned JSON Patch
     * Adds to queue, transform and apply when applicable.
     * @param  {Object} obj                   object to apply patches to
     * @param  {JSONPatch} versionedJsonPatch patch to be applied
     * @param  {Function} [applyCallback]     optional `function(object, consecutiveTransformedPatch)` to be called when applied, if not given #apply will be called
     */
    receive(obj: Object, versionedJsonPatch: Object, applyCallback: Function);


    /**
     * Reset queue internals and object to new, given state
     * @param obj object to apply new state to
     * @param newState versioned object representing desired state along with versions
     */
    reset(obj: Object, newState: Object);
}
export default JSONPatchOTAgent;

