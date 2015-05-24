
module.exports = deleteRelated;

function deleteRelated(schema,table,id){
  var deletes = [];

  // default id field.
  var idField = 'id';
  var pk = schemaPK(table) 

  // stop circular dependency resolution
  var resolvedTable = {};
  resolvedTable[table] = 1;

  if(pk) {
    idField = pk.field;
    if(pk.dependents){
      traverse(pk.dependents,'?',[id])
    }
  }

  deletes.push(["delete from "+table+" where "+idField+"=?",[id]])

  return multiToBatch(deletes);

  function traverse(deps,sub,id){
    deps.forEach(function(v){
      if(resolvedTable[v[0]]) return;
      resolvedTable[v[0]] = 1;
      pk = schemaPK(v[0])

      if(pk && pk.dependents) {
        var childSub = "select "+pk.field+" from "+v[0]+" where "+v[1]+" in ("+sub+")"
        traverse(pk.dependents,childSub,id)
      }
      deletes.push(["delete from "+v[0]+" where "+v[1]+" in ("+sub+")",id])
    })
  }

  function schemaPK(table){
    if(!schema[table]) return false;
    var fields = Object.keys(schema[table]);
    for(var i = 0; i < fields.length; ++i){
      if(schema[table][fields[i]].pkey){
        var s = schema[table][fields[i]];
        s.field = fields[i]
        return s;
      }
    }
  }

}

// takes [[sql,args],[sql,args]] and makes them one query. with sql+';'+sql, concat(args,args)
function multiToBatch(queries){
  var sql = [];
  var args = [];
  queries.forEach(function(a){
    sql.push(a[0])
    args.push.apply(args,a[1]||[])
  })

  return [sql.join(";\n")+";",args]
}






