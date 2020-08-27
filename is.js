var COMPONENT_CONFIG = Symbol.for('configuration');

function isEmitter(value){
    return value && typeof value.on === 'function' && typeof value.removeListener === 'function';
}

function isAttachable(value){
    return value && typeof value.attach === 'function';
}

function isComponent(value){
    return value && isAttachable(value) && value[COMPONENT_CONFIG]
}

module.exports = {
    emitter: isEmitter,
    attachable: isAttachable,
    component: isComponent
};