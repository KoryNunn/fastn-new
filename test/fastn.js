var test = require('tape');
var fastn = require('../');
var binding = require('../binding');
var EventEmitter = require('events');

test('object model attaches recursively', function(t){
    t.plan(4);

    var state = {
        foo: 1,
        bar: 2
    };

    var ui = fastn.component({ value: binding('foo') }, 
        fastn.component({ value: binding('bar') })
    );

    t.equal(ui.value, undefined, 'initial ui.value is undefined');
    t.equal(fastn.component.getChildren(ui)[0].value, undefined, 'initial ui.child.value is undefined');

    ui.attach(state);

    t.equal(ui.value, 1, 'attached ui.value is expected');
    t.equal(fastn.component.getChildren(ui)[0].value, 2, 'attached ui.child.value is expected');
});

test('object model detaches recursively', function(t){
    t.plan(4);

    var state = {
        foo: 1,
        bar: 2
    };

    var ui = fastn.component({ value: binding('foo') }, 
        fastn.component({ value: binding('bar') })
    );

    ui.attach(state);

    t.equal(ui.value, 1, 'attached ui.value is expected');
    t.equal(fastn.component.getChildren(ui)[0].value, 2, 'attached ui.child.value is expected');

    ui.detach();

    t.equal(ui.value, undefined, 'attached ui.value is expected');
    t.equal(fastn.component.getChildren(ui)[0].value, undefined, 'attached ui.child.value is expected');

});

