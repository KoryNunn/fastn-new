var getComponentConfig = require('./getComponentConfig');

module.exports = function setProperty(component, key, newPropertyConfig){
    var currentValue;

    var componentConfig = getComponentConfig(component);
    var componentPropertiesConfig = componentConfig.properties;

    if(!componentPropertiesConfig[key]){
        componentPropertiesConfig[key] = {
            onChange: value => { component[key] = value; }
        };

        Object.defineProperty(component, key, {
            get: function() {
                return currentValue;
            },
            set: function(newValue){
                // if(propertyConfig.transform){
                //     newValue = propertyConfig.transform(component, key, newValue, currentValue);
                // }
                currentValue = newValue;
                component.emit(key, currentValue);
            }
        });
    }

    var propertyConfig = componentPropertiesConfig[key];

    // if('transform' in newPropertyConfig){
    //     propertyConfig.transform = newPropertyConfig.transform;
    // }

    if('value' in newPropertyConfig){
        currentValue = newPropertyConfig.value;
        component[key] = currentValue;
    }

    if('emitter' in newPropertyConfig){
        if(propertyConfig.emitter){
            propertyConfig.emitter.removeListener('change', propertyConfig.onChange);
            if(propertyConfig.emitter.attach){
                component.removeListener('attach', propertyConfig.emitter.attach);
            }
        }

        propertyConfig.emitter = newPropertyConfig.emitter;

        if(!propertyConfig.emitter){
            return;
        }
        
        if(propertyConfig.emitter.attach){
            component.on('attach', propertyConfig.emitter.attach);
            component.on('detach', propertyConfig.emitter.detach);
        }

        if(typeof propertyConfig.emitter === 'function'){
            currentValue = propertyConfig.emitter();
        }

        propertyConfig.emitter.on('change', propertyConfig.onChange);
    }
}