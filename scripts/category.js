function Search(param) {
  if (param.search == "") {
    return [];
  }
  let wheres_object = [
    JSON.parse(param.wheres),
    {
      column: "name",
      op: "match",
      value: param.search,
    },
  ];

  param.wheres = wheres_object;
  return Process("yao.component.SelectOptions", param);
}

function AfterSave(id) {
  var payload = Process("models.category.Find", id, {});

  var category_sn = payload["category_sn"];
  if (!category_sn) {
    return Process("models.material.category.Save", {
      id: id,
      category_sn: MakeSN(id),
    });
  }
  return id;
}

/**
 * 生成类目标签 (1+id)
 * 标签: **类目(6)**-SKU(8)-计划(6)-Item(9)
 *      100001 20000001 000000 400000001
 */
function MakeSN(id) {
  var sn = id.toString();
  return sn.padEnd(6, "0");
}
