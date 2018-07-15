const mongoose = require('mongoose');

const { Schema } = mongoose;

export const SchemaTypes = Schema.Types;

export class SchemaProperties {
  constructor()
  {
  }  

  isEnum(options){
    
    const assignOptions = (options, defaults) => Object.assign(defaults, options, { type: defaults.type });

    return {
      ofStrings: enumerables => assignOptions(options, { 
        type: String, 
        enum: enumerables, 
        default: "" 
      }),
      ofNumbers: enumerables => assignOptions(options, { 
        type: Number, 
        enum: enumerables, 
        default: 0 
      }),
      ofDates: enumerables => assignOptions(options, { 
        type: Date, 
        enum: enumerables, 
        default: Date.now 
      }),
      ofBooleans: enumerables => assignOptions(options, { 
        type: Boolean, 
        enum: enumerables, 
        default: false 
      }),
      ofObjectIds: enumerables => assignOptions(options, { 
        type: SchemaTypes.ObjectId, 
        enum: enumerables, 
        default: false 
      })
    }
  }

  isString(options){
    const assignOptions = (options, defaults) => Object.assign(defaults, options, { type: defaults.type });

    return assignOptions(options, {
      type: String,
      trim: true,
      default: ""
    })
  }

  isNumber(options){
    const assignOptions = (options, defaults) => Object.assign(defaults, options, { type: defaults.type });

    return assignOptions(options, {
      type: Number,
      default: 0
    });
  }

  isDate(options){
    const assignOptions = (options, defaults) => Object.assign(defaults, options, { type: defaults.type });

    return assignOptions(options, {
      type: Date,
      default: Date.now
    });
  }

  isBoolean(options){
    const assignOptions = (options, defaults) => Object.assign(defaults, options, { type: defaults.type });

    return assignOptions(options, {
      type: Boolean,
      default: false
    });
  }

  isObjectId(options){
    const assignOptions = (options, defaults) => Object.assign(defaults, options, { type: defaults.type });

    return assignOptions(options, {
      type: SchemaTypes.ObjectId
    });
  }
}