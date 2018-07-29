class Upsert {  
  static buildObjectsToUpsert(oldObjects, newObjects, comparable){
    return {
      toUpdate: oldObjects
        .map(oldObject => {
          return {
            old: oldObject,
            new: newObjects.find(newObject => newObject[comparable] == oldObject[comparable])
          }              
        }),
      toCreate: newObjects
        .filter(newObject => !oldObjects.some(oldObject => newObject[comparable] == oldObject[comparable]))
    }
  }

  static getItemsToUpsert(oldItems, newItems, comparable, cb){
    const items = Upsert.buildObjectsToUpsert(oldItems, newItems, comparable);

    return items.toUpdate
      .map(itemToUpdate => {

        if(!itemToUpdate.new)
          return itemToUpdate.old;

        const childProperty = cb && cb(itemToUpdate.old, itemToUpdate.new);

        return Object.assign(itemToUpdate.old, itemToUpdate.new, childProperty)
      })
      .concat(items.toCreate);            
  }

  static setChildren(database, dataset, _this){
      return _this.reduce((prevChild, child) => {        
        
        const $property = Object.keys(child)
          .map(key => {
             return key != '$children'
                ? { key: key, comparator: child[key] } 
                : {}
          })[0];

        const $child = child.$children
                   
        const items = Upsert.getItemsToUpsert(database[$property.key], dataset[$property.key], $property.comparator,
          (oldValues, newValues) => {
             if($child)
                return Upsert.setChildren(oldValues, newValues, $child);              
          });

        return Object.assign(prevChild, { [$property.key]: items });
      }, {});
  }

  static exec(matcher, dataset, properties){
    return this.findOne(matcher)
      .lean()
      .then(res => {
        if(!res) 
          return this.create(dataset.$set);
        else if(res._id)
          dataset.$set._id = res._id;

        let toUpdate = dataset.$set;

        if(properties) {
          const newChildren = Upsert.setChildren(res, toUpdate, properties.$children);

          toUpdate = Object.assign(res, toUpdate, newChildren);
        }              

        return this.update(matcher, toUpdate, { 
          runValidators: true 
        })
        .then(res => toUpdate);
      })
      .catch(ex => console.log(ex))
  }
}

export default Upsert;