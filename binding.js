var functionEmitter = require('function-emitter');
var attachable = require('./attachable');
var Enti = require('enti');
var is = require('./is');

module.exports = function(...args){
    var argValues = [];
    var currentValue;
    var model = new Enti();
    var transform = args.length > 1 && args.pop();
    var emitQueued;
    var handlersAttached;

    var binding = function(){
        return currentValue;
    };

    Object.setPrototypeOf(binding, functionEmitter);
    attachable(binding);

    function updateArgValue(arg, argIndex){
        if(typeof arg === 'function'){
            argValues[argIndex] = arg();
        } else if(typeof arg === 'string' || typeof arg === 'number') {
            argValues[argIndex] = model.get(arg);
        }
    }

    function updateCurrentValue(){
        args.map(updateArgValue);
        currentValue = transform ? transform.apply(null, argValues) : argValues[0];
    }

    function runAndEmitChange(fn){
        var emit;

        if(!emitQueued){
            emitQueued = emit = true;
        }

        fn();

        if(emit){
            emitQueued = false;
            binding.emit('change', currentValue);
        }
    }

    var handlers = args.map((arg, argIndex) => {
        var handler = function(value){
            runAndEmitChange(() => {
                argValues[argIndex] = value;
                updateCurrentValue();
            });
        }

        if(!is.emitter(arg) && typeof arg !== 'string' && typeof arg !== 'number'){
            throw new Error(`Unexpected value passed to binding(), argument ${argIndex} was not a string, number, or observable.`);
        }

        updateArgValue(arg, argIndex);
        
        return handler;
    });

    function attachHandlers(){
        if(handlersAttached){
            return;
        }

        args.forEach((arg, argIndex) => {
            if(typeof arg === 'string' || typeof arg === 'number'){
                model.on(arg, handlers[argIndex]);
            } else if(is.emitter(arg)) {
                arg.on('change', handlers[argIndex]);
            }
        });

        handlersAttached = true;
    }

    function attach(state){
        runAndEmitChange(() => {
            attachHandlers();
            model.attach(state);
            updateCurrentValue();
        });
    }

    function detach(soft){
        if(soft && binding._handlers && binding._handlers.change && binding._handlers.change.length > 0){
            return
        }

        runAndEmitChange(() => {
            model.detach();

            args.forEach(function(arg, argIndex){
                if(is.emitter(arg)){
                    arg.removeListener('change', handlers[argIndex])
                }
                if(is.attachable(arg)){
                    arg.detach(true);
                }
                handlersAttached = false;
            });

            argValues = [];
            currentValue = undefined;
        });
    }

    binding.on('attach', attach);
    binding.on('detach', detach);

    attachHandlers();
    updateCurrentValue();

    return binding;
}