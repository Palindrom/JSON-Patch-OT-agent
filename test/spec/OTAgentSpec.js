if(typeof JSONPatchOTAgent === 'undefined') {
  JSONPatchOTAgent = require('../../src/json-patch-ot-agent.js');
}

var obj;

describe("JSONPatchOTAgent features:", function(){
describe("JSONPatchOTAgent instance", function () {
  var noop = function(){};

  describe("when sends a JSON Patch", function () {
    var agent;
    beforeEach(function () {
      agent = new JSONPatchOTAgent({}, noop, ["/local","/remote"],function(){});
    });
    it("should push it to `.pending` sequences list (along with version operation objects)",function(){
      var patch0 = [{op: 'replace', path: '/foo', value: 'smth'}];
      var patch1 = [{op: 'replace', path: '/baz', value: 'smth'}];
      var versionedJSONPatch1 = agent.send(patch0);
      var versionedJSONPatch2 = agent.send(patch1);
      // first two operation objects are versions
      expect(agent.pending[0]).toEqual(versionedJSONPatch1);
      expect(agent.pending[1]).toEqual(versionedJSONPatch2);
    });
    it("should not increment `.ackLocalVersion`",function(){
      var versionedJSONPatch1 = agent.send([{op: 'replace', path: '/baz', value: 'smth'}]);
      expect(agent.ackLocalVersion).toEqual(0);
    });
  });

  describe("when receives a Versioned JSON Patch", function () {
    var agent, applyPatch, transformPatch;
    var obj = {foo: 1, baz: [{qux: 'hello'}]};
    beforeEach(function () {
      transformPatch = jasmine.createSpy("transformPatch");
      var transform = function transform(){
        transformPatch.apply(this, arguments);
        return [{op:"add", path: "/transformed", value: "JSON Patch sequence"}];
      };
      applyPatch = jasmine.createSpy("applyPatch");
      var apply = function apply(){
        applyPatch.apply(this, arguments);
        return arguments[0]; //obj
      }
      agent = new JSONPatchOTAgent(obj, transform, ["/local","/remote"], apply);
      agent.localVersion = 2;
      agent.pending = [
        [{op: 'replace', path: '/foo', value: 1}],
        [{op: 'add', path: '/baz', value: [{qux: 'hello'}]}]
      ];
    });

    describe("with local version equal to current local version", function () {
      var versionedJSONPatch = [
        {op: 'replace', path: '/remote', value: 1},
        {op: 'test', path: '/local', value: 2}, // OT

        {op: 'add', path: '/bar', value: [1, 2, 3]},
        {op: 'replace', path: '/baz', value: 'smth'}
      ];

      beforeEach(function () {
        agent.receive(versionedJSONPatch);
      });

      it('should apply given JSON Patch sequence', function() {
        expect(applyPatch).toHaveBeenCalled();
        expect(applyPatch).toHaveBeenCalledWith(
          obj,
          [
            {op: 'add', path: '/bar', value: [1, 2, 3]},
            {op: 'replace', path: '/baz', value: 'smth'}
          ]);
      });
      it('should clear pending sequences list', function() {
        expect(agent.pending).toEqual([]);
      });
      it('should change `ackLocalVersion`', function() {
        expect(agent.ackLocalVersion).toEqual(2);
      });
    });

    describe("with local version lower than current local version", function () {
      var versionedJSONPatch1 = [
        {op: 'replace', path: '/remote', value: 1},
        {op: 'test', path: '/local', value: 1}, // OT

        {op: 'replace', path: '/baz', value: 'smth'}
      ];
      beforeEach(function () {
        agent.receive(versionedJSONPatch1);

      });

      it('should transform given JSON Patch sequence against pending sequences with higher versions', function() {
        expect(transformPatch).toHaveBeenCalled();
        expect(transformPatch).toHaveBeenCalledWith(
          [{op: 'replace', path: '/baz', value: 'smth'}], // received sequence
          [
            [{op: 'add', path: '/baz', value: [{qux: 'hello'}]}]
          ] //pending sequences with higher version
          );
      });
      it('should apply transformed JSON Patch sequence', function() {
        expect(applyPatch.calls.count()).toEqual(1);
        expect(applyPatch).toHaveBeenCalledWith(
          obj,
          [{op:"add", path: "/transformed", value: "JSON Patch sequence"}] // transformed JSON Patch
          );
      });
      it('should change `ackLocalVersion` according to received localVersion', function() {
        expect(agent.ackLocalVersion).toEqual(1);
      });
    });


  });

});
});

// Benchmark performance test
if (typeof Benchmark !== 'undefined') {
(function(){
  var noop = function(){};

  var banchAgent, remoteCounter, localCounter, obj;
  var suite = new Benchmark.Suite("JSONPatchOTAgent",{
    onError: function(error){
      console.error(error);
    }
  });
  suite.add(suite.name + ' call transform against 1 of 2 pending sequences', function () {
    banchAgent.receive(obj, [
      {op: 'replace', path: '/remote', value: remoteCounter},
      {op: 'test', path: '/local', value: 1}, // OT
      {op: 'replace', path: '/foo', value: [1, 2, 3, 4]}
    ]);

    remoteCounter++;

  },{
    onStart: function(){
      banchAgent = new JSONPatchOTAgent(noop, ["/local","/remote"],function(){});
      obj = {foo: 1, baz: [
        {qux: 'hello'}
      ]};
      remoteCounter = 1;
      localCounter = 2;
      banchAgent.localVersion = 2;
      banchAgent.pending = [
        [{op: 'replace', path: '/foo', value: 1}],
        [{op: 'add', path: '/baz', value: [{qux: 'hello'}]}]
      ];
    }
  });
  suite.add(suite.name + ' call transform against 7 of 10 pending sequences', function () {
    banchAgent.receive(obj, [
      {op: 'replace', path: '/remote', value: remoteCounter},
      {op: 'test', path: '/local', value: 1}, // OT
      {op: 'replace', path: '/foo', value: [1, 2, 3, 4]}
    ]);

    remoteCounter++;

  },{
    onStart: function(){
      banchAgent = new JSONPatchOTAgent(noop, ["/local","/remote"],function(){});
      obj = {foo: 1, baz: [
        {qux: 'hello'}
      ]};
      remoteCounter = 1;
      localCounter = 3;
      banchAgent.localVersion = 3;
      banchAgent.pending = [
        [{op: 'replace', path: '/foo', value: 1}],
        [{op: 'add', path: '/baz', value: 10}],
        [{op: 'replace', path: '/foo', value: 10}],
        [{op: 'add', path: '/baz', value: 10}],
        [{op: 'replace', path: '/foo', value: 10}],
        [{op: 'add', path: '/baz', value: 10}],
        [{op: 'replace', path: '/foo', value: 10}],
        [{op: 'add', path: '/baz', value: 10}],
        [{op: 'replace', path: '/foo', value: 10}],
        [{op: 'add', path: '/baz', value: 10}]
      ];
    }
  });
  benchmarkReporter(suite);
}());
}
