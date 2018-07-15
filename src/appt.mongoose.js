import { apptEcosystem } from '@appt/core';

const mongoose = require('mongoose');

const { models, Schema } = mongoose;

const SchemaTypes = Schema.Types;
const MongooseParse = mongoose.Types;

const model = mongoose.model.bind(mongoose);
const connect = mongoose.connect.bind(mongoose);
const set = mongoose.set.bind(mongoose);

var schemas = {};

class TModel {
  constructor() {
    this.targetName = '';
  }
   
  normalizeComponents(components){  
    return new Promise(resolve => {
      const component = components instanceof Array ? components[0] : components;
      const schemaPromise = typeof component === 'string' 
          ? new apptEcosystem.getEntity(component, this.targetName)()
          : new component();

      return schemaPromise.then(comp => resolve(comp));
    });
  }

  exec(extend, Target, injectables) {
    this.targetName = Target.name;

    return this.normalizeComponents(extend.use)
      .then(schema => this.getSchema(schema, Target.name))
      .then(entitySchema => {
        if(models[Target.name]) {
            return models[Target.name]
        }
        else {
          if(injectables && injectables.length > 0){
            new Target(...injectables);
          }
          
          entitySchema.loadClass(Target);
              
          return model(Target.name, entitySchema, extend.config);
        }        
      })
      .catch(err => console.log(err))
  }

  getSchema(mySchema, targetName){
    let schema;

    if(mySchema.injectables)
      schema = new mySchema.target(...mySchema.injectables);
    else 
      schema = new mySchema.target();

    const parsedSchema = Object.keys(schema)
      .reduce((prev, crr) => {
          return Object.assign(prev, { [crr]: schema[crr] })
      }, {});

    if(schemas && schemas[mySchema.target.name])
      return new Schema(schemas[mySchema.target.name], mySchema.args);
    else 
      return new Schema(parsedSchema, mySchema.args);
  }
}

class TSchema {
   exec(extend, Target, injectables) {
    return new Promise(resolve => {
      resolve({target: Target, args: extend.config, injectables: injectables})
    })
  }
}

class SchemaProperties {
  constructor()
  {
  }  

  isEnum(options){
    return {
      ofStrings: (defaultValue) => Object.assign({ enum: options, type: String, trim: true, default: defaultValue || "" }),
      ofNumbers: (defaultValue) => Object.assign({ enum: options, type: Number, default: defaultValue || 0 }),
      ofDates: (defaultValue) => Object.assign({ enum: options, type: Date, default: defaultValue || Date.now }),
      ofBooleans: (defaultValue) => Object.assign({ enum: options, type: Boolean, default: defaultValue || false }),
      ofObjectIds: () => Object.assign({ enum: options, type: SchemaTypes.ObjectId })
    }
  }

  isString(defaultValue){
    return {
      type: String,
      trim: true,
      default: defaultValue || ""
    }
  }

  isNumber(defaultValue){
    return {
      type: Number,
      default: defaultValue || 0
    }
  }

  isDate(defaultValue){
    return {
      type: Date,
      default: defaultValue || Date.now
    }
  }

  isBoolean(defaultValue){
    return {
      type: Boolean,
      default: defaultValue || false
    }
  }

  isObjectId(){
    return {
      type: SchemaTypes.ObjectId
    }
  }
}

class Mongoose{
  constructor(){
    this.instance = mongoose;

    this.defaultConfig = {
      uri: 'mongodb://localhost:27017/sample',
      debug: false,
      options: {}
    }

    this.customConfig = this.defaultConfig;
  }

  getInstance(){
    return this.instance;
  }

  setUri(uri) {
     this.customConfig.uri = uri || this.defaultConfig.uri;
  }

  setDebug(debug) {
        this.customConfig.debug = debug || this.defaultConfig.debug;
    }

  setOptions(options) {
      this.customConfig.options = options || this.defaultConfig.options;
  }

  exec(args) {
     this.setUri(args && args.uri);     
     this.setDebug(args && args.debug);
     this.setOptions(args && args.options);
     
     return connect(this.customConfig.uri, this.customConfig.options)
      .then(() => {    
        set('debug', this.customConfig.debug);
        return this.customConfig;
      })
      .catch(err => {        
        throw new Error(err)
      });
  }
}

export {
  TModel,
  TSchema,
  Mongoose,
  SchemaTypes,
  MongooseParse,
  SchemaProperties
} 