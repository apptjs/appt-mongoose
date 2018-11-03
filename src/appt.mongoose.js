import { apptEcosystem } from '@appt/core';
import customQueries from './custom_queries';

const mongoose = require('mongoose');

const { models, Schema } = mongoose;

const MongooseParse = mongoose.Types;

const model = mongoose.model.bind(mongoose);

const connect = mongoose.connect.bind(mongoose);
const set = mongoose.set.bind(mongoose);

var schemas = {};

function TModel(main, options = null){
  return {
    target: ApptModel,
    args: {
      main: main,
      options: options
    }
  };
}

class ApptModel {
  constructor(extenderParams, Target, injectables) {
    return this.exec(extenderParams, Target, injectables)
  }
   
  normalizeComponents(component){  
    return new Promise(resolve => {
      const schemaPromise = typeof component === 'string' 
        ? new apptEcosystem.getEntity(component, this.targetName)()
        : new component();

      return schemaPromise.then(comp => resolve(comp));
    });
  }

  exec(extenderParams, Target, injectables) {
    this.targetName = Target.name;

    return this.normalizeComponents(extenderParams.main)
      .then(schema => this.getSchema(schema))
      .then(entitySchema => {
        if(models[Target.name]) {
            return models[Target.name]
        }
        else {
          entitySchema.loadClass(Target);

          entitySchema.statics = Object.assign(entitySchema.statics, customQueries);

          const newModel = model(Target.name, entitySchema, extenderParams.options);

          if(injectables && injectables.length > 0){
            new Target(...injectables, newModel);
          } else {
            new Target(newModel);
          }

          return newModel;
        }        
      })
      .catch(err => console.log(err))
  }

  getSchema(mySchema){
    const schema = mySchema.injectables
      ? new mySchema.target(...mySchema.injectables)
      : new mySchema.target();

    const parsedSchema = Object.keys(schema)
      .reduce((prev, crr) => {
          return Object.assign(prev, { [crr]: schema[crr] })
      }, {});

    if(schemas && schemas[mySchema.target.name])
      return new Schema(schemas[mySchema.target.name], mySchema.options);
    else 
      return new Schema(parsedSchema, mySchema.options);
  }
}

function TSchema(args){
  return {
    target: ApptSchema,
    args: args
  };
}

class ApptSchema {
  constructor(extenderParams, Target, injectables){
    return this.exec(extenderParams, Target, injectables)
  }

  exec(extenderParams, Target, injectables) {
    return new Promise(resolve => {
      resolve({
        target: Target, 
        options: extenderParams || {},
        injectables: injectables
      })
    })
  }
}

class Mongoose{
  constructor(uri, options){
    this.instance = mongoose;
    
    this.defaultConfig = {
      uri: uri || 'mongodb://localhost:27017/sample',
      debug: options && options.debug || false,
      options: options || {}
    }

    delete this.defaultConfig.options.debug;

    this.customConfig = this.defaultConfig;    
  }

  getInstance(){
    return this.instance;
  }

  exec() {
    return connect(this.customConfig.uri, this.customConfig.options)
      .then(() => {    
        set('debug', this.customConfig.debug);

        return {
          instance: this.instance,
          config: this.customConfig
        };
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
  MongooseParse
} 