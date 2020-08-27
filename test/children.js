var test = require('tape');
var createComponent = require('../component');
var fastn = require('../');
var EventEmitter = require('events');

test('Base components can be given children', function(t){
    t.plan(1);

    var component = createComponent(createComponent());

    t.equal(fastn.component.getChildren(component).length, 1);
});

test('Base components can have children inserted', function(t){
    t.plan(1);

    var component = createComponent();

    fastn.component.insertChild(component, createComponent());

    t.equal(fastn.component.getChildren(component).length, 1);
});

test('Base components can have array children inserted', function(t){
    t.plan(1);

    var component = createComponent();

    fastn.component.insertChild(component, [
        createComponent(),
        createComponent(),
        createComponent()
    ]);

    t.equal(fastn.component.getChildren(component).length, 3);
});

test('Base components can have children inserted to a position', function(t){
    t.plan(1);

    var component = createComponent(createComponent());
    var childComponent = createComponent();

    fastn.component.insertChild(component, childComponent, 0);

    t.equal(fastn.component.getChildren(component).indexOf(childComponent), 0);
});

test('fastn.component.insertChild handles positive out of range', function(t){
    t.plan(1);

    var component = createComponent(createComponent());
    var childComponent = createComponent();

    fastn.component.insertChild(component, childComponent, 5);

    t.equal(fastn.component.getChildren(component).indexOf(childComponent), 1);
});

test('fastn.component.insertChild handles negative out of range', function(t){
    t.plan(1);

    var component = createComponent(createComponent());
    var childComponent = createComponent();

    fastn.component.insertChild(component, childComponent, -5);

    t.equal(fastn.component.getChildren(component).indexOf(childComponent), 0);
});

test('fastn.component.insertChild removes child from current parent', function(t){
    t.plan(2);

    var component1 = createComponent();
    var component2 = createComponent();
    var childComponent = createComponent();

    fastn.component.insertChild(component1, childComponent);

    fastn.component.insertChild(component2, childComponent);

    t.equal(fastn.component.getChildren(component1).length, 0, 'Original parent has no children');
    t.equal(fastn.component.getChildren(component2).length, 1, 'New parent has one child');
});

test('fastn.component.remove removes component from parent', function(t){
    t.plan(2);

    var component = createComponent();
    var childComponent = createComponent();

    fastn.component.insertChild(component, childComponent);

    t.equal(fastn.component.getChildren(component).length, 1, 'Parent has one child');

    fastn.component.remove(childComponent);

    t.equal(fastn.component.getChildren(component).length, 0, 'Parent has no children');
});

test('component attach calls children attach', function(t){
    t.plan(1);

    var state = {};

    var child = createComponent();

    child.on('attach', data => {
        t.equal(data, state, 'Base component emitted attach and passed state through');
    });

    var component = createComponent(child);

    component.attach(state);
});

test('component calls children attach if already attached', function(t){
    t.plan(1);

    var state = {};

    var child = createComponent();

    child.on('attach', data => {
        t.equal(data, state, 'Base component emitted attach and passed state through');
    });

    var component = createComponent(child);

    component.attach(state);
});

test('Memory is not held for removed children', function(t){
    if(!global.gc){
        t.plan(1);
        t.pass('GC not available');
        return;
    }

    t.plan(2);

    var state = {};

    var component = createComponent();

    function getBigChild(){
        var child = createComponent();
        child.foo = '';

        for(var i = 0; i < 1e6; i++){
            child.foo += 'Some data '
        }

        return child;
    }

    var initialMemoryUsage = process.memoryUsage().heapUsed;

    fastn.component.insertChild(component, getBigChild());

    var highMemoryUsage = process.memoryUsage().heapUsed;

    fastn.component.empty(component);

    setTimeout(function(){
        global.gc();

        var lowMemoryUsage = process.memoryUsage().heapUsed;

        t.ok(highMemoryUsage - initialMemoryUsage > 1e7, 'Memory allocated');
        t.ok(highMemoryUsage - lowMemoryUsage > 1e7, 'Memory cleaned up');
    });
});

test('Memory is not held for many removed children', function(t){
    if(!global.gc){
        t.plan(1);
        t.pass('GC not available');
        return;
    }

    t.plan(2);

    var state = {};

    var component = createComponent();

    function getManyChildren(){
        var children = [];

        for(var i = 0; i < 1e4; i++){
            var child = createComponent();
            child.foo = 'Some data ';
            children.push(child);
        }

        return children;
    }

    var initialMemoryUsage = process.memoryUsage().heapUsed;

    fastn.component.insertChild(component, getManyChildren());

    var highMemoryUsage = process.memoryUsage().heapUsed;

    fastn.component.empty(component);

    setTimeout(function(){
        global.gc();

        var lowMemoryUsage = process.memoryUsage().heapUsed;

        t.ok(highMemoryUsage - initialMemoryUsage > 1e7, 'Memory allocated');
        t.ok(highMemoryUsage - lowMemoryUsage > 1e7, 'Memory cleaned up');
    });
});