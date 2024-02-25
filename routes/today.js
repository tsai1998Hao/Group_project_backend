import express from "express";

const router = express.Router();

// 檢查空物件, 轉換req.params為數字
import { getIdParam } from "#db-helpers/db-tool.js";

// 資料庫使用
import sequelize from "#configs/db.js";

const { Act } = sequelize.models;
const { Diary } = sequelize.models;
const { Pet } = sequelize.models;
Diary.belongsTo(Act, { foreignKey: "diary_act_id" });

import { QueryTypes, Op } from "sequelize";

function diary_text(diary_item) {
  const desiredKeys = [
    "diary_id",
    "diary_date_time",
    "Act.act_name",
    "Act.act_parent_id",
  ];
  const outputDict = Object.assign(
    {},
    ...desiredKeys.map((key) => ({ [key]: diary_item[key] }))
  );

  switch (diary_item["Act.act_name"]) {

    case "散步":
      outputDict["text"] = "散步 " + diary_item["diary_duration_min"] + " 分鐘";
      break;
    case "洗澡":
      outputDict["text"] = "洗澡 " + diary_item["diary_duration_min"] + " 分鐘";
      break;
    case "濕食":
      outputDict["text"] = "濕食 " + diary_item["diary_quantity_g"] + " 克";
      break;
    case "乾食":
      outputDict["text"] = "乾飼料" + diary_item["diary_quantity_g"] + " 克";
      break;
    case "罐頭":
      outputDict["text"] = "罐頭" + diary_item["diary_quantity_g"] + " 克";
      break;
    case "點心":
      outputDict["text"] = "點心" + diary_item["diary_quantity_g"] + " 克";
      break;
    case "大便":
      outputDict["text"] = "大便";
      break;
    case "尿尿":
      outputDict["text"] = "小便";
      break;
    case "坐下起立運動":
      outputDict["text"] =
        "坐下起立運動" + diary_item["diary_duration_min"] + " 分鐘";
      break;
    case "水療":
      outputDict["text"] = "水療" + diary_item["diary_duration_min"] + " 分鐘";
      break;
    case "重心移轉運動":
      outputDict["text"] =
        "重心移轉運動" + diary_item["diary_duration_min"] + " 分鐘";
      break;
    case "洗澡":
      outputDict["text"] = "洗澡";
      break;
    case "梳毛":
      outputDict["text"] = "梳毛";
      break;
    case "剪指甲":
      outputDict["text"] = "剪指甲";
      break;
    case "剪毛":
      outputDict["text"] = "剪毛";
      break;
    case "疫苗注射":
      outputDict["text"] = "疫苗注射";
      break;
    case "化毛膏":
      outputDict["text"] = "化毛膏";
      break;
    case "成長紀錄":
      outputDict["text"] = "身高" + diary_item["diary_height_cm"] + " 公分" + " 體重" + diary_item["diary_weight_kg"] + " 公斤";
      break;
    case "體溫":
      outputDict["text"] =
        "體溫" + diary_item["diary_body_temperature"] + " 度";
      break;
    default:
      outputDict["text"] = diary_item["Act.act_name"] + " not supported yet";
  }
  return outputDict;
}

async function get_act_info(act_id) {
  const act = await Act.findOne(
    {
      where: { act_id: act_id },
    }
  )

  let act_category = ''
  switch (act.act_parent_id) {
    case 1:
      act_category = 'food'
      break
    case 2:
      act_category = 'faeces'
      break
    case 3:
      act_category = 'workout'
      break
    case 4:
      act_category = 'bath'
      break
    case 5:
      act_category = 'medical'
      break
    case 6:
      act_category = 'other'
      break
    default:
      act_category = 'unknown'
      break
  }

  return { act_name: act.act_name, act_category: act_category }
}

// 獲得單筆資料
router.get("/list/:id", async (req, res, next) => {
  try {
    // 轉為數字
    const id = getIdParam(req);

    // 只會回傳單筆資料
    const _diary = await Diary.findByPk(id, {
      raw: true, // 只需要資料表中資料
    });
    const { act_name, act_category } = await get_act_info(_diary.diary_act_id)

    const diary = { ..._diary, diary_act_name: act_name, act_category: act_category}

    return res.json({ status: "success", data: { diary }});
  } catch (e) {
    console.log(e);

    return res.json({
      status: "error",
      message: "無法查詢到資料，查詢字串可能有誤",
    });
  }
});

// 獲得資料
router.get("/list/", async (req, res, next) => {
  // 獲取query參數值
  // const {
  //   page = 1, // number,  用於 OFFSET =  (Number(page) - 1) * Number(perpage),
  //   perpage = 10, // number, 用於 LIMIT
  //   pet_id = '', // string, 對應 sid 欄位,  `pet_id IN (sid)`
  //   raw=true, //boolean, 代表只回傳products陣列
  // } = req.query

  // !!注意: 以下都要檢查各query參數值的正確性，或給定預設值，要不然可能會產生資料庫查詢錯誤
  // 建立例如: `CONCAT(",", color, ",") REGEXP ",(1|2),"`
  const genConcatRegexp = (param, column) => {
    return sequelize.where(
      sequelize.fn("CONCAT", ",", sequelize.col(column), ","),
      {
        [Op.regexp]: `,(${param.split(",").join("|")}),`,
      }
    );
  };

  // 建立各where條件從句用
  const genClause = (key, value) => {
    switch (key) {
      case "pet_id":
        return {
          diary_pet_id: value.split(",").map((v) => Number(v)),
        };
      default:
        return "";
    }
  };

  // where各條件(以AND相連)
  const conditions = [];
  for (const [key, value] of Object.entries(req.query)) {
    if (value) {
      conditions.push(genClause(key, value));
    }
  }

  // console.log('condiction:')
  // console.log(conditions)

  // 分頁用
  const page = Number(req.query.page) || 1;
  const perpage = Number(req.query.perpage) || 5;
  const offset = (page - 1) * perpage;
  const limit = perpage;

  // 排序用
  const orderDirection = req.query.order || "ASC";
  const order = req.query.sortre
    ? [[req.query.sort, orderDirection]]
    : [["diary_id", "DESC"]];

  // 避免sql查詢錯誤導致後端當掉，使用try/catch語句
  try {
    const { count, rows } = await Diary.findAndCountAll({
      // attributes: ['diary_id', 'Act.act_name', 'diary_quantity_g', 'diary_duration_min', 'diary_body_temperature'],
      where: { [Op.and]: conditions },
      include: Act,
      raw: true, // 只需要資料表中資料,
      // logging: (msg) => console.log(msg.bgWhite),
      offset,
      limit,
      order,
    });
    if (req.query.raw === "true") {
      return res.json(rows);
    }

    // 計算總頁數
    const pageCount = Math.ceil(count / Number(perpage)) || 0;

    return res.json({
      status: "success",
      data: {
        total: count,
        pageCount,
        page,
        perpage,
        diary: rows.map((v) => diary_text(v)),
      },
    });
  } catch (e) {
    console.log(e);

    return res.json({
      status: "error",
      message: "無法查詢到資料，查詢字串可能有誤",
    });
  }
});

// POST - 新增寵物日記資料
router.post("/add/", async function (req, res) {
  // req.body資料範例
  // {
  //     "diary_pet_id":"1"
  //     "diary_act_name":"乾食",
  //     "diary_date":"2023-01-24"
  //     "diary_diary_date_time":"13:20:00"
  //     "diary_quantity_g": 150,
  //     "diary_duration_min":null,
  //     "diary_body_temperature":null,
  //     "diary_height_cm":null,
  //     "diary_weight_kg":null,
  //     "diary_memo":null,
  // }

  // 要新增的寵物日記資料
  const diary = req.body;
  // console.log(diary);

  // 檢查從前端來的資料哪些為必要(name, username...)
  if (
    !diary.diary_pet_id ||
    !diary.diary_act_name ||
    !diary.diary_date ||
    !diary.diary_date_time
  ) {
    return res.json({ status: "error", message: "缺少必要資料" });
  }

  try {
    const act = await Act.findOne(
      {
        where: { act_name: diary.diary_act_name },
      }
    )

    // 執行後created是建立的寵物日記資料，created為布林值
    // where指的是不可以有相同的資料，如username與email不能有相同的
    // defaults用於建立新資料用
    const created = await Diary.create({
      diary_pet_id: diary.diary_pet_id,
      diary_date: diary.diary_date,
      diary_act_id: act.dataValues.act_id,
      diary_date_time: diary.diary_date_time,
      diary_quantity_g: diary.diary_quantity_g,
      diary_duration_min: diary.diary_duration_min,
      diary_body_temperature: diary.diary_body_temperature,
      diary_height_cm: diary.diary_height_cm,
      diary_weight_kg: diary.diary_weight_kg,
      diary_memo: diary.diary_memo,
    });

    // 新增失敗 created=false 代表沒新增
    if (!created) {
      return res.json({ status: "error", message: "建立寵物日記失敗" });
    }

    // 成功建立寵物的回應
    // 狀態`201`是建立資料的標準回應，
    // 如有必要可以加上`Location`寵物建立的uri在回應標頭中，或是回應剛建立的資料
    // res.location(`/users/${user.id}`)
    return res.status(201).json({
      status: "success",
      data: null,
    });
  } catch (e) {
    console.log(e);

    return res.json({
      status: "error",
      message: "無法新增寵物日記，查詢字串可能有誤",
    });
  }
});

// POST - 修改寵物資料
router.post("/edit/", async function (req, res) {
  // req.body資料範例
  // {
  //     "diary_diary_id":"1"
  //     "diary_act_name":"乾食",
  //     "diary_date":"2023-01-24"
  //     "diary_date_time":"13:20:00"
  //     "diary_quantity_g": 150,
  //     "diary_duration_min":null,
  //     "diary_body_temperature":null,
  //     "diary_height_cm":null,
  //     "diary_weight_kg":null,
  //     "diary_memo":null,
  // }

  // 要新增的寵物日記資料
  const diary = req.body;
  // console.log(diary);

  // 檢查從前端來的資料哪些為必要(name, username...)
  if (
    !diary.diary_id ||
    !diary.diary_act_name ||
    !diary.diary_date ||
    !diary.diary_date_time
  ) {
    return res.json({ status: "error", message: "缺少必要資料" });
  }

  const act = await Act.findOne(
    {
      where: { act_name: diary.diary_act_name },
    }
  )

  console.log(diary)
  const diary_id = diary.diary_id || 0;
  const diary_pet_id = diary.diary_pet_id || 0;
  const diary_date = diary.diary_date || '';
  const diary_date_time = diary.diary_date_time || '';
  const diary_act_id = act.act_id || 0;
  const diary_quantity_g = Number(diary.diary_quantity_g) || 0;
  const diary_duration_min = Number(diary.diary_duration_min) || 0;
  const diary_body_temperature = Number(diary.diary_body_temperature) || 0;
  const diary_height_cm = Number(diary.diary_height_cm) || 0;
  const diary_weight_kg = Number(diary.diary_weight_kg) || 0;
  const diary_memo = diary.diary_memo || null;

  try {
    // 執行後updated為布林值
    // where指的是不可以有相同的資料
    const updated = await Diary.update(
      { diary_pet_id, diary_date, diary_date_time, diary_memo, diary_act_id, diary_quantity_g, diary_duration_min, diary_body_temperature, diary_height_cm, diary_weight_kg },
      {
        where: {
          diary_id: diary_id,
        },
      }
    );

    // 失敗 created=false 代表沒有修改
    if (!updated) {
      return res.json({ status: "error", message: "修改寵物資訊失敗" });
    }

    // 成功修改寵物的回應
    // 狀態`201`是建立資料的標準回應，
    return res.status(201).json({ // TODO chagne to updated state
      status: "success",
      data: null,
    });
  } catch (e) {
    console.log(e);

    return res.json({
      status: "error",
      message: "無法查詢到資料，查詢字串可能有誤",
    });
  }
});

// POST - 刪除寵物日記資料
router.post("/delete/", async function (req, res) {
  // req.body資料範例
  // {
  //     "diary_id":"1"
  // }

  // 要刪除的日記資料
  const query = req.body;

  // 檢查從前端來的資料哪些為必要(name, username...)
  if (
    !query.diary_id
  ) {
    return res.json({ status: "error", message: "缺少必要資料" });
  }

  try {
    // 執行後 deleted 為布林值
    // where指的是不可以有相同的資料
    const deleted = await Diary.destroy({
      where: {
        diary_id: query.diary_id,
      },
    });

    // 失敗 created=false 代表沒有刪除
    if (!deleted) {
      return res.json({ status: "error", message: "刪除寵物資訊失敗" });
    }

    // 成功刪除寵物的回應
    // 狀態`201`是建立資料的標準回應，
    return res.status(201).json({
      status: "success",
      data: null,
    });

  } catch (e) {
    console.log(e);

    return res.json({
      status: "error",
      message: "無法查詢到資料，查詢字串可能有誤",
    });
  }
});

export default router;
