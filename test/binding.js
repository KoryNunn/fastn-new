var test = require('tape');
var mutate = require('../mutate');
var binding = require('../binding');

test('simple binding initialisation', function(t){
    t.plan(3);

    var fooBinding = binding('foo');

    var state = {};

    t.equal(fooBinding(), undefined);

    mutate.set(state, 'foo', 'bar');

    t.equal(fooBinding(), undefined);

    fooBinding.attach(state);

    t.equal(fooBinding(), 'bar');
});

test('simple binding event', function(t){
    t.plan(3);

    var fooBinding = binding('foo');

    var state = {};

    fooBinding.attach(state);

    fooBinding.once('change', function(value){
        t.equal(value, 'bar');
        t.equal(fooBinding(), 'bar');
    });

    mutate.set(state, 'foo', 'bar');

    fooBinding.once('detach', function(){
        t.equal(fooBinding(), undefined);
    });

    fooBinding.detach();

    mutate.set(state, 'foo', 'baz');
});

test('Single bindings update when their attached property changes', function(t){
    t.plan(2);

    var state = {};
    var fooBinding = binding('foo').attach(state);

    t.equal(fooBinding(), undefined);

    mutate.set(state, 'foo', 1);

    t.equal(fooBinding(), 1);
});

test('Compound bindings update when their attached properties changes', function(t){
    t.plan(3);

    var state = { foo: 1, bar: 1 };
    var fooBarBinding = binding('foo', 'bar', (a, b) => a + b).attach(state);

    t.equal(fooBarBinding(), 2);

    mutate.set(state, 'foo', 2);

    t.equal(fooBarBinding(), 3);

    mutate.set(state, 'bar', 2);

    t.equal(fooBarBinding(), 4);
});

test('Compound bindings update when their attached sub-bindings change', function(t){
    t.plan(3);

    var state = { foo: 1, bar: 1 };
    var fooBinding = binding('foo').attach(state);
    var barBinding = binding('bar').attach(state);
    var fooBarBinding = binding(fooBinding, barBinding, (a, b) => a + b);

    t.equal(fooBarBinding(), 2);

    mutate.set(state, 'foo', 2);

    t.equal(fooBarBinding(), 3);

    mutate.set(state, 'bar', 2);

    t.equal(fooBarBinding(), 4);
});

test('Bindings cleanup handlers when detached', function(t){
    t.plan(3);

    var state = { foo: 1, bar: 1 };
    var fooBinding = binding('foo').attach(state);
    var barBinding = binding('bar').attach(state);
    var fooBarBinding = binding(fooBinding, barBinding, (a, b) => a + b);

    t.equal(fooBarBinding(), 2);

    mutate.set(state, 'foo', 2);

    t.equal(fooBarBinding(), 3);

    fooBarBinding.detach();

    t.equal(fooBarBinding(), undefined);
});

test('detach memory usage', function(t){
    if(!global.gc){
        t.plan(1);
        t.pass('GC not available');
        return;
    }

    t.plan(3);

    var initialMemoryUsage;
    var highMemoryUsage;

    function run(){
        initialMemoryUsage = process.memoryUsage().heapUsed;

        var state = {};
        var innerBindings = [];

        for(var i = 0; i < 1e4; i++){
            innerBindings.push(binding('foo').attach(state));
        }

        var outerBinding = binding.apply(null, innerBindings.concat(function(...args){
            return args.length;
        }));

        highMemoryUsage = process.memoryUsage().heapUsed;

        t.equal(outerBinding(), 1e4);

        outerBinding.detach();
    }

    run();

    setTimeout(function(){
        global.gc();

        var lowMemoryUsage = process.memoryUsage().heapUsed;

        t.ok(highMemoryUsage - initialMemoryUsage > 1e7, 'Memory allocated')
        t.ok(highMemoryUsage - lowMemoryUsage > 1e7, 'Memory cleaned up')
    });
});

test('filter', function(t){
    t.plan(2);

    var data = {},
        fooBinding = binding('foo|*');

    fooBinding.attach(data);

    fooBinding.on('change', function(value){
        t.pass();
    });

    mutate.set(data, 'foo', []);

    mutate.set(data.foo, 0, {});
});

test('drill get', function(t){
    t.plan(2);

    var data = {
            foo: {
                bar: 123
            }
        },
        barBinding = binding('foo.bar');

    barBinding.attach(data);

    t.equal(barBinding(), 123);

    mutate.set(data, 'foo', {
        bar: 456
    });

    t.equal(barBinding(), 456);
});

test('drill change', function(t){
    t.plan(1);

    var data = {
            foo: {
                bar: 123
            }
        },
        barBinding = binding('foo.bar');

    barBinding.attach(data);

    barBinding.on('change', function(){
        t.pass('target changed');
    });

    mutate.set(data, 'foo', {
        bar: 456
    });
});