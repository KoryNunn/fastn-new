var test = require('tape');
var createComponent = require('../component');
var EventEmitter = require('events');

test('create a base component', function(t){
    t.plan(1);

    var component = createComponent();

    t.equal(typeof component.attach, 'function', 'Base component has an attach method');
});

test('base component emits attach when attached to state', function(t){
    t.plan(1);

    var component = createComponent();
    var state = {};

    component.on('attach', function(data){
        t.equal(data, state, 'Base component emitted attach and passed state through');
    });

    component.attach(state);
});

test('base component emits correct firmness when attached', function(t){
    t.plan(3);

    var component = createComponent();
    var state = {};

    component.once('attach', function(data, firmness){
        t.equal(firmness, 0, 'Base component emitted expected firmness');

        component.once('attach', function(data, firmness){
            t.equal(firmness, 1, 'Base component emitted expected firmness');

            component.once('attach', function(data, firmness){
                t.equal(firmness, 2, 'Base component emitted expected firmness');
            });
        });
    });

    component.attach(state, 0);
    component.attach(state, 1);
    component.attach(state, 2);
    component.attach(state, 1);
    component.attach(state, 0);
});

test('base emits correct firmness when without firmness set', function(t){
    t.plan(1);

    var component = createComponent();
    var state = {};

    component.on('attach', function(data, firmness){
        t.equal(firmness, undefined, 'Base component emitted expected firmness');
    });

    component.attach(state);
});
