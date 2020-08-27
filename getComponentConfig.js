var COMPONENT_CONFIG = Symbol.for('configuration');

module.exports = function getComponentConfig(component){
    var componentConfig = component[COMPONENT_CONFIG];

    if(!componentConfig){
        componentConfig = {};
        component[COMPONENT_CONFIG] = componentConfig;
    }

    if(!componentConfig.properties){
        componentConfig.properties = {};
    }

    if(!componentConfig.children){
        componentConfig.children = [];
    }

    return componentConfig;
}