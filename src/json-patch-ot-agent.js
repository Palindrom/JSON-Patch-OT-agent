if(typeof JSONPatchQueue === 'undefined') {
	if(typeof require !== 'undefined') {
		var JSONPatchQueue = require('json-patch-queue').JSONPatchQueue;
	}
	else {
		throw new Error('You need to reference JSONPatchQueue before JSONPatchOTAgent');
	}
}

/**
 * [JSONPatchOTAgent description]
 * @param {Object} obj The target object where patches are applied
 * @param {Function} transform function(seqenceA, sequences) that transforms `seqenceA` against `sequences`.
 * @param {Array<JSON-Pointer>} versionPaths JSON-Pointers to version numbers [local, remote]
 * @param {function} apply apply(JSONobj, JSONPatchSequence) function to apply JSONPatch to object. Must return the final state of the object.
 * @param {Boolean} purity 
 * @constructor
 * @extends {JSONPatchQueue}
 * @version: 2.0.0-rc.0
 */
var JSONPatchOTAgent = function(obj, transform, versionPaths, apply, purity){
	JSONPatchQueue.call(this, obj, versionPaths, apply, purity);
	this.transform = transform;
	/**
	 * History of performed JSON Patch sequences that might not yet be acknowledged by Peer
	 * @type {Array<JSONPatch>}
	 */
	this.pending = [];

};
JSONPatchOTAgent.prototype = Object.create(JSONPatchQueue.prototype);
JSONPatchOTAgent.prototype.constructor = JSONPatchOTAgent;
JSONPatchOTAgent.prototype.ackLocalVersion = 0;

/**
 * Wraps JSON Patch sequence with version related operation objects
 * @param  {JSONPatch} sequence JSON Patch sequence to wrap
 * @return {VersionedJSONPatch}
 */
JSONPatchOTAgent.prototype.send = function(sequence){
	var newSequence = sequence.slice(0);
	newSequence.unshift({ // test for conflict resolutions
		op: "test",
		path: this.remotePath,
		value: this.remoteVersion
	});
	var versionedJSONPatch = JSONPatchQueue.prototype.send.call(this, newSequence);
	this.pending.push(versionedJSONPatch);
    return versionedJSONPatch;
};


/**
 * Process received versioned JSON Patch
 * Adds to queue, transform and apply when applicable.
 * @param  {Object} obj object to apply patches to
 * @param  {JSONPatch} versionedJsonPatch patch to be applied
 * @param  {Function} [applyCallback] optional `function(object, consecutiveTransformedPatch)` to be called when applied, must return the final state of the object, if not given #apply will be called
 */
JSONPatchOTAgent.prototype.receive = function(versionedJsonPatch, applyCallback){
	var apply = applyCallback || this.apply,
		queue = this;

	return JSONPatchQueue.prototype.receive.call(this, versionedJsonPatch,
		function applyOT(obj, remoteVersionedJsonPatch){
			// console.log("applyPatch", queue, arguments);
	        // transforming / applying
	        var consecutivePatch = remoteVersionedJsonPatch.slice(0);

	        // shift first operation object as it should contain test for our local version.
	        // ! We assume correct sequence structure, and queuing applied before.
	        //
	        // Latest local version acknowledged by remote
	        // Thanks to the queue version may only be higher or equal to current.
	        var localVersionAckByRemote = consecutivePatch.shift().value;
	        var ackDistance = localVersionAckByRemote - queue.ackLocalVersion;
	        queue.ackLocalVersion = localVersionAckByRemote;

	        //clear pending operations
	        queue.pending.splice(0,ackDistance);
	        if(queue.pending.length){// is there any pending local operation?
	            // => Remote sent us something based on outdated versionDistance
	            // console.info("Transformation needed", consecutivePatch, 'by', queue.nonAckList);
	            consecutivePatch = queue.transform(
	                    consecutivePatch,
	                    queue.pending
	                );
			}
			return queue.obj = apply(queue.obj, consecutivePatch);
		});
};

/**
 * Reset queue internals and object to new, given state
 * @param newState versioned object representing desired state along with versions
 */
JSONPatchOTAgent.prototype.reset = function(newState){
	this.ackLocalVersion = JSONPatchQueue.getPropertyByJsonPointer(newState, this.localPath);
	this.pending = [];
	return this.obj = JSONPatchQueue.prototype.reset.call(this, newState);
};
if(typeof module !== 'undefined') {
	module.exports = JSONPatchOTAgent;
	module.exports.default = JSONPatchOTAgent;
	module.exports.__esModule = true;
}