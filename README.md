# @appt/mongoose
This is a plugin made for Appt that wraps [Mongoose ODM](https://www.npmjs.com/package/mongoose) to work into the *Appt's ecosystem* with advanced *database models and schemes*. 
We assume you got here after seeing the [Appt's Main Page](https://github.com/brab0/appt). If you don't, **we strongly recommend** you to step back an take a 5 minutes reading to get used with some key concepts we're going to apply here.


## Install
    $ npm install @appt/mongoose --save

 
## Resources
The `@appt/mongoose` plugin export some resources which can be imported as seen below:
```javascript
import {
	Mongoose,
	TModel,
	TSchema,
	SchemaTypes,
	MongooseParse
} from '@appt/mongoose';
```

### Mongoose
At the example below, we have a component that needs to act as a database connector of an application. By default, an Appt component is just a class with a "signature" that it can be injected by other class. As our component here needs to a specific behavior, we need to make use of a *Special-Type Extender* called *TDatabase*. This special type makes part of the [@appt/core](https://github.com/brab0/appt/tree/master/core) package and it indicates our component should act as a database connector but also, it does not know *how or which kind of database to connect*? To this point we need to use a *"driver"*, which here is the *"Mongoose"*.  As the simple usage below shows, after `use` the Mongoose driver, you only need to provide the `uri` connection. If you need a little more configuration, you can set if you want to debug the connection *(default: false)* or even pass into options attribute any param allowed by the mongoose connection.
```javascript
import { ApptComponent, TDatabase } from '@appt/core';
import { Mongoose } from '@appt/mongoose';

@ApptComponent({
	extend: {
		type: TDatabase,
		use: [Mongoose],
		config: {
			uri: 'mongodb://localhost:27017/appt-demo',
			debug:  true,
			options: {
				keepAlive: true
			}
		}
	}
})
export class AppDatabase(){}
```

### TModel
This Special-Type Extender add the Mongoose Model behavior to our component. That means once imported by another component (or even inside the model), any *mongoose/mongo* query method can be accessed into the class context. After define the type as a TModel component, the mongoose model expect it to has a mongoose schema as well. To get there, just `use: ['TheSchema']` . You also can add any config allowed in a mongoose model by passing them into the config attribute.
```javascript
import { ApptComponent } from '@appt/core';
import { TModel } from '@appt/mongoose';

@ApptComponent({
	extend: {
		type: TModel,
		use: ['TheSchema'],
		config: {}
	}
})
export class TheModel(){
	constructor()
	{
	}

	static getById(_id){
		return this.findOne({ _id: _id });
	}
}
```

### TSchema
The special type to transform a component into a Mongoose Schema. All the configurations accepted by mongoose can be passed into the config attribute.
```javascript
import { ApptComponent } from '@appt/core';
import { TSchema } from '@appt/mongoose';

@ApptComponent({
	extend: {
		type: TSchema,
		config: {}
	}
})
export class AppShema(){
	constructor(){
		this.name = {
			type: String,
			trim: true,
			default: "",
		}

		this.email = {
			type: String,
			trim: true,
			default: "",
		}
	}
}
```

### SchemaTypes
This is an Appt interface for Mongoose ODM schema types. It exposes every type available in Mongoose.
```javascript
import { SchemaTypes } from '@appt/mongoose';
...
	this._id = {
		type: SchemaTypes.ObjectId,
		require: true
	}
...
```

### MongooseParse
This is an Appt interface for Mongoose ODM type parsers. It exposes every parser available by Mongoose.

```javascript
import { MongooseParse } from '@appt/mongoose';
...
	getById(myId){
		return this.findOne({
			_id: MongooseParse.ObjectId(myId)
		})
	}
...
```

## Compatibility
**We're using ES6 features!** Which means you gonna need to compile your code to work with current versions of **NodeJs**. Thankfully, there's a lot of tools out there doing that, such as [babel](https://babeljs.io/).
You might also want to work with **TypeScript**. If you do, check the *experimental decorators support* option to start coding.


## That's all folks!
If you have any suggestion or want to contribute somehow, let me know!


## License
```

MIT License

  

Copyright (c) 2017 Rodrigo Brabo

  

Permission is hereby granted, free of charge, to any person obtaining a copy

of this software and associated documentation files (the "Software"), to deal

in the Software without restriction, including without limitation the rights

to use, copy, modify, merge, publish, distribute, sublicense, and/or sell

copies of the Software, and to permit persons to whom the Software is

furnished to do so, subject to the following conditions:

  

The above copyright notice and this permission notice shall be included in all

copies or substantial portions of the Software.

  

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR

IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,

FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE

AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER

LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,

OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE

SOFTWARE.

```
