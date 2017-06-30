### Browser support
IE 9+, latest of Chrome/FF/Safari, iOS 7+ and Android 2.3+ (except 3.x)

### Feature
* Providing key-value storage interface.
* Data is persistent only during back-forward navigation.
* Refreshing browser erases the data.
* Can create an instance for each UI component using key string.
* Can use dot notation path.

### Quick steps to use

#### Install
```
npm install --save @egjs/persist
```

#### or use CDN
``` html
{% for dist in site.data.egjs.dist %}
<script src="//{{ site.data.egjs.github.user }}.github.io/{{ site.data.egjs.github.repo }}/{{ dist }}"></script>
{% endfor %}
```

### Initialize

#### ES5
```javascript
var persist = new eg.Persist("componentID");
```

#### ES6+
```js
import Persist from "@egjs/persist";
const persist = new Persist("componentID");
```

### Usage

```javascript
import Persist from "@egjs/persist";
const persist = new Persist("componentID");

// Overwrite global object
var snapshotObject = { 
    list: [{name: "foo"}, {name: "bar"}]
    index: 0
};

persist.set("", snapshotObject);

// Get global object
persist.get("");
/* 
{ 
    list: [{name: "foo"}, {name: "bar"}]
    index: 0
} 
*/

// Get with property name and index
persist.get("index");
// => 0

persist.get("list.0");
// => {name: "foo"}

persist.get("list.0.name");
// => "foo"

// Set with property name and index
persist.set("list.2", "foo");
/* => this
{ 
    list: [{name: "foo"}, {name: "bar"}, "foo"]
    index: 0
} 
*/

// Chaining with set method 
persist
    .set("isActive", false)
    .set("index", 2)
    .get("list");
//=> [{name: "foo"}, {name: "bar"}, "foo"] 
```