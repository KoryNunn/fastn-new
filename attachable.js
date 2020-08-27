function firmer(newFirmness, firmness){
    if(firmness != null && (newFirmness === undefined || firmness < newFirmness)){
        return true;
    }
}

module.exports = function(emitter){
    var firmness = -1;

    function attach(data, newFirmness){
        if(!data || typeof data !== 'object'){
            throw new Error('non-object passed to fastnComponent.attach()');
        }

        if(!firmer(newFirmness, firmness)){
            return emitter;
        }

        firmness = newFirmness;

        emitter.emit('attach', data, firmness);

        return emitter;
    }

    function detach(soft){
        emitter.emit('detach', soft);
    }

    emitter.attach = attach;
    emitter.detach = detach;
}