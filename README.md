# JSON-Patch-OT-Agent
> Makes your JSON Patch application sequential

[![Build Status](https://travis-ci.org/Palindrom/JSON-Patch-OT-agent.svg?branch=master)](https://travis-ci.org/Palindrom/JSON-Patch-OT-agent)

Implements a queue of JSON Patches, based on [Versioned JSON Patch](https://github.com/tomalec/Versioned-JSON-Patch) convention, that will resolve a problem of sequential application of JSON Patches.

## Demo
[Full Versioned JSON Patch + OT visualization](http://tomalec.github.io/PuppetJs-operational-transformation/visualization.html)

Specific visualization will come soon.


## Install

Install the component using NPM

```sh
$ npm install json-patch-ot-agent --save
```

Or

Install the component using [Bower](http://bower.io/):

```sh
$ bower install json-patch-ot-agent --save
```

Or [download as ZIP](https://github.com/Palindrom/JSON-Patch-OT-Agent/archive/master.zip).

## Usage

```javascript
var targetObject = {};
// create queue
var myQueue = new new JSONPatchOTAgent(targetObject,
                jsonpatchTransform,
                ['/localVersion', '/remoteVersion'],
                jsonpatch
             );
// to compose versioned JSON Patch, to be send somewhere?
var versionedPatchToBeSent = myQueue.send(regularPatch);
// to apply/queue/transform received versioned JSON Patch
myQueue.receive(receivedVersionedPatch);
```

## Requirements

Agent requires a specific `transform` function (as a first argument), if you do not have your own, we advise you [JSON-Patch-OT](https://github.com/Palindrom/JSON-Patch-OT) (`bower install json-patch-ot`).
You will also need function to apply JSON Patch, we suggest [fast JSON Patch](https://github.com/Starcounter-Jack/JSON-Patch) (`bower install fast-json-patch`).

## Methods

Name      | Arguments                     | Default | Description
---       | ---                           | ---     | ---
`send`    | *JSONPatch* sequence          |         | Changes given JSON Patch to Versioned JSON Patch
`receive` | *VersionedJSONPatch* sequence |         | Versioned JSON Patch to be queued and applied
`JSONPatchQueue`  | *Object* obj          |         | Target object where patches are applied
__  | *Function* transform |         |  `function(patch, againstPatch_es)` function to transform given JSON Patch against others
__  |*Array* *JSONPointer* [localVersionPath, remoteVersionPath] |         | Paths where to store the versions
  __             | *Function* apply     |         | `function(object, patch)` function to apply JSON Patch, must return the final state of the object
 __                 | *Boolean* purist     | `false` | set to `true` to enable pure/unoptimized Versioned JSON Patch convention

## Properties

Name      | Type                          | Description
---       | ---                           | ---
`obj`     |  *`Object`* obj               | Target object where patches are applied
`waiting` | *Array* *JSONPatch*           | Array of JSON Patches waiting in queue
`localVersion` | *Number*           | local version
`remoteVersion` | *Number*           | acknowledged remote version
`ackLocalVersion` | *Number*           | local version that is for sure acknowledged by remote

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## History

For detailed changelog, check [Releases](https://github.com/Palindrom/JSON-Patch-OT-Agent/releases).

## License

MIT

## See also
- [fast JSON Patch](https://github.com/Starcounter-Jack/JSON-Patch)
- [JSON Patch Queue](https://github.com/Palindrom/JSON-Patch-Queue)
- [JSON Patch OT](https://github.com/Palindrom/JSON-Patch-OT)
- ...putting it all together: [Palindrom](https://github.com/Palindrom/Palindrom)
