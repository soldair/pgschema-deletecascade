# pgschema-deletecascade

uses a pgschematojson object to build a cascade delete batch query for any row.

yes i know postgresql has [delete cascade](http://www.postgresql.org/docs/8.2/static/ddl-constraints.html). it might not be enabled for some reason. if you have this use case use this =)

the output sql string should be included in a transaction otherwise inconsistency problems will abound.

## example

```js
var del = require('pgschema-deletecascade')
var schema = require("./schema.json")

// now lets delete the row from the "main" table with primary key 1

var res = del(schema,"main",1)

// returns an array with the arguments that you would normally pass to pg query
// [query,arguments]

console.log(">query:")
process.stdout.write(res[0]+"\n")
console.log(">args")
console.log(res[1])

```
which outputs

```
>query:
delete from sub_sub where sub_id in (select id from sub where main_id in (?));
delete from sub where main_id in (?);
delete from main where id=?;
>args
[ 1, 1, 1 ]
```

in this case the schema.json looks like this

```js
var schema = {
  main:{
    id:{
      pkey:true,
      dependents:[["sub","main_id"]]
    }
  },
  sub:{
    id:{
      pkey:true,
      dependents:[["sub_sub","sub_id"]]
    },
    main_id:{
      fk:["main","id"]
    }
  },
  sub_sub:{
    sub_id:{
      fk:["sub","id"]
    }
  }
}
```

## api

### module.exports(schema,tableName,primaryKeyValue)
- schema, is an object as produced from your db schema from the module [pgschematojson](https://www.npmjs.com/package/pgschematojson)
- tableName, the table you would like to delete from
- primaryKeyvalue, the id of the row you want to delete

