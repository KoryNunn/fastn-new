var test = require('tape');
var createComponent = require('../component');
var setProperty = require('../setProperty');
var EventEmitter = require('events');

test('All settings become properties on base component', function(t){
    t.plan(1);

    var component = createComponent({ foo: 'bar' });
    
    t.equal(component.foo, 'bar', 'Base component properties had expected value');
});

test('Settings emit change on component when set to', function(t){
    t.plan(1);

    var component = createComponent({ foo: 'bar' });

    component.on('foo', value => {
        t.equal(value, 'baz', 'Emitted expected value');
    })

    component.foo = 'baz';
});

test('Settings can be assigned emitters', function(t){
    t.plan(1);

    var emitter = new EventEmitter();

    var component = createComponent({ foo: emitter });

    component.on('foo', value => {
        t.equal(value, 'baz', 'Emitted expected value');
    })

    emitter.emit('change', 'baz')
});

test('Base component properties can be re-assigned emitters', function(t){
    t.plan(2);

    var emitter = new EventEmitter();

    var component = createComponent({ foo: emitter });

    component.once('foo', value => {
        t.equal(value, 'baz', 'Emitted expected value');
    })

    emitter.emit('change', 'baz');

    component.once('foo', value => {
        t.equal(value, 'foo', 'Emitted expected value');
    })

    var newEmitter = new EventEmitter();

    setProperty(component, 'foo', {
        emitter: newEmitter
    });

    emitter.emit('change', 'bazinga');
    newEmitter.emit('change', 'foo');
});

// test('Base component properties can be assigned transforms', function(t){
//     t.plan(1);

//     var emitter = new EventEmitter();

//     var component = createComponent({ foo: emitter });

//     setProperty(component, 'foo', {
//         transform: function(component, key, newValue, currentValue){
//             return String(newValue);
//         }
//     });

//     component.foo = 1;

//     t.equal(component.foo, '1', 'Component property was transformed');
// });

test('Attachable emitters have attach called from parent', function(t){
    t.plan(1);

    var state = {}

    var emitter = new EventEmitter();
    emitter.attach = function(data){
        t.equal(data, state, 'Emitter recieved expected data')
    }
    emitter.detach = () => {}

    var component = createComponent({ foo: emitter });

    component.attach(state)
});