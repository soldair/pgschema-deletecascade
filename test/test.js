var test = require('tape')
var del = require("../")
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

test("can delete",function(t){
  var res = del(schema,"main",1)
  t.ok(res);
  console.log(">query:")
  process.stdout.write(res[0]+"\n")
  console.log(">args")
  console.log(res[1])

  t.equals(res[0],"delete from sub_sub where sub_id in (select id from sub where main_id in (?));\ndelete from sub where main_id in (?);\ndelete from main where id=?;","should build correct query");
  t.equals(res[1].length,3,'should have built 3 queries');


  t.end();
})

