var EventEmitter = require('events');
var attachable = require('./attachable');
var getComponentConfig = require('./getComponentConfig');
var setProperty = require('./setProperty');
var is = require('./is');
var PARENT = Symbol.for('parent');

function getChildren(component){
    return getComponentConfig(component).children;
}

function remove(component){
    var parent = component && component[PARENT];

    if(parent){
        removeChild(parent, component);
        parent.emit('childRemove', component);
    }
}

function empty(component){
    var children = getComponentConfig(component).children;
    children.forEach(child => remove(child));
}

function removeChild(component, child){
    var children = getComponentConfig(component).children;
    var index = children.indexOf(child);

    if(~index){
        children.splice(index, 1);
    }

    child[PARENT] = null;
}

function insertChild(component, child, index){
    var componentConfig = getComponentConfig(component);
    var state = componentConfig.state;
    var children = componentConfig.children;

    index = index || 0;

    if(Array.isArray(child)){
        var newChildren = child.flat();
        newChildren.forEach((subChild, subIndex) => {
            insertChild(component, subChild, index + subIndex);
        });
        return component;
    }

    if(child === null || child === false){
        return component;
    }

    if(!is.component(child)){
        child = createComponent({ text: child });
        child.render = function(renderers){
            renderers.text(child);
            child.emit('render', child, renderers);
        }
    }

    if(child[PARENT] === component && children[index] === child){
        return component;
    }

    remove(child);

    child[PARENT] = component;
    children.splice(index, 0, child);

    if(state){
        child.attach(state, 1);
    }

    component.emit('childInsert', child, index);

    return component;
}

function getParent(component){
    return component[PARENT];
}

function getOwnIndex(component){
    if(!isis.component(component)){
        throw new Error(`non-componant passed to getOwnIndex: ${typeof component}: ${component}`)
    }

    var parent = getParent(component);

    if(!parent){
        return -1;
    }

    return getChildren(parent).indexOf(component);
}

function createComponent(settings, ...children){
    var component = new EventEmitter();

    var componentConfig = getComponentConfig(component);

    if(settings && is.attachable(settings)){
        children.unshift(settings);
        settings = null;
    }

    componentConfig.children = [];

    insertChild(component, children);

    component.on('attach', (data, firmness) => {
        componentConfig.state = data;
        componentConfig.children.forEach(child => is.attachable(child) && child.attach(data, 1))
    });
    component.on('detach', (soft) => componentConfig.children.forEach(child => is.attachable(child) && child.detach(true)));

    attachable(component);

    if (settings) {
        Object.keys(settings).forEach(key => {
            if(is.emitter(settings[key])){
                setProperty(component, key, {
                    emitter: settings[key]
                })
            } else {
                setProperty(component, key, {
                    value: settings[key]
                })
            }
        });
    }

    return component;
}

module.exports = createComponent
createComponent.insertChild = insertChild;
createComponent.getChildren = getChildren;
createComponent.getOwnIndex = getOwnIndex;
createComponent.remove = remove;
createComponent.empty = empty;
createComponent.getParent = getParent;